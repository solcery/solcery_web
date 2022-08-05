import { useState, useEffect, useCallback } from 'react';
import { Session } from '../game';
import Unity, { UnityContext } from 'react-unity-webgl';
import { useBrickLibrary } from '../contexts/brickLibrary';
import { build } from '../content';
import { useUser } from '../contexts/user';
import { useProject } from '../contexts/project';

const unityPlayContext = new UnityContext({
	loaderUrl: '/Build/WebGl.loader.js',
	dataUrl: '/Build/WebGl.data',
	frameworkUrl: '/Build/WebGl.framework.js',
	codeUrl: '/Build/WebGl.wasm',
	streamingAssetsUrl: '/StreamingAssets',
});

function* stringChunk(s, maxBytes) {
	const SPACE_CODE = 32;
	let buf = Buffer.from(s);
	while (buf.length) {
		let i = buf.lastIndexOf(SPACE_CODE, maxBytes + 1);
		if (i < 0) i = buf.indexOf(SPACE_CODE, maxBytes);
		if (i < 0) i = buf.length;
		yield buf.slice(0, i).toString();
		buf = buf.slice(i + 1);
	}
}

export default function GameClient(props) {
	let gameSession = props.gameSession;

	const clientCommand = useCallback((funcName, param) => {
		const USHORT_SIZE = 65536;
		let data = typeof param === 'string' ? param : JSON.stringify(param);
		const chunks = [...stringChunk(data, USHORT_SIZE)];
		console.log(`Web - sending package to Unity client [${funcName}]: ${data}`);
		for (let i = 0; i < chunks.length; i++) {
			let chunk_package = {
				count: chunks.length,
				index: i,
				value: chunks[i],
			};
			// console.log(`Web - sending package to Unity client [${funcName}]: ${JSON.stringify(chunk_package)}`);
			unityPlayContext.send('ReactToUnity', funcName, JSON.stringify(chunk_package));
		}
	}, []);

	const sendDiffLog = useCallback(
		(states) => {
			for (let index in states) {
				states[index].id = index;
			}
			clientCommand('UpdateGameState', { states });
		},
		[clientCommand]
	);

	useEffect(() => {
		if (!gameSession) return;
		unityPlayContext.on('OnUnityLoaded', async () => {
			let content = gameSession.getUnityContent();
			clientCommand('UpdateGameContent', content);
			let overrides = gameSession.getContentOverrides();
			clientCommand('UpdateGameContentOverrides', overrides);
			sendDiffLog(gameSession.game.diffLog);
		});

		unityPlayContext.on('SendCommand', async (jsonData) => {
			let command = JSON.parse(jsonData);
			gameSession.onPlayerCommand(command);
			sendDiffLog(gameSession.game.diffLog);
		});

		return function () {
			unityPlayContext.removeAllEventListeners();
		};
	}, [gameSession, clientCommand, sendDiffLog]);

	return !gameSession ? (
		<>ERROR: NO SESSION</>
	) : (
		<div style={{ width: '100%' }}>
			<Unity style={{ width: '100%' }} unityContext={unityPlayContext} />
		</div>
	);
}
