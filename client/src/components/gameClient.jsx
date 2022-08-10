import { useState, useEffect, useCallback } from 'react';
import { Session } from '../game';
import { Unity, useUnityContext } from "react-unity-webgl";
import { useBrickLibrary } from '../contexts/brickLibrary';
import { build } from '../content';
import { useUser } from '../contexts/user';
import { useProject } from '../contexts/project';

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
	const { unityProvider, sendMessage, addEventListener, removeEventListener } = useUnityContext({
		loaderUrl: '/Build/WebGl.loader.js',
		dataUrl: '/Build/WebGl.data',
		frameworkUrl: '/Build/WebGl.framework.js',
		codeUrl: '/Build/WebGl.wasm',
		streamingAssetsUrl: '/StreamingAssets',
	});

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
			sendMessage('ReactToUnity', funcName, JSON.stringify(chunk_package));
		}
	}, [ sendMessage ]);

	const sendDiffLog = useCallback(states => {
		for (let index in states) {
			states[index].id = index;
		}
		clientCommand('UpdateGameState', { states });
	}, [clientCommand]);

	const onUnityLoaded = useCallback(() => {
		let content = gameSession.getUnityContent();
		clientCommand('UpdateGameContent', content);
		let overrides = gameSession.getContentOverrides();
		clientCommand('UpdateGameContentOverrides', overrides);
		sendDiffLog(gameSession.game.diffLog);
	}, [ clientCommand, sendDiffLog ])

	const onPlayerCommand = useCallback(jsonData => {
		let command = JSON.parse(jsonData);
		gameSession.onPlayerCommand(command).then(sendDiffLog);
	}, [ clientCommand, sendDiffLog ]);

	useEffect(() => {
		addEventListener('OnUnityLoaded', onUnityLoaded);
		addEventListener('SendCommand', onPlayerCommand);
		return function () {
			removeEventListener('OnUnityLoaded', onUnityLoaded);
			removeEventListener('SendCommand', onPlayerCommand);
		};
	}, [clientCommand, sendDiffLog]);

	if (!gameSession) return <></>
	return <div style={{ width: '100%' }}>
		<Unity style={{ width: '100%' }} unityProvider={unityProvider} />
	</div>;
}
