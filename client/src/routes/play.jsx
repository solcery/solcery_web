import React, { useEffect, useState } from 'react'
import { Session } from '../game';
import gameContent from '../game/game_content.json';
import Unity, { UnityContext } from "react-unity-webgl";
import './progress.css';

const unityPlayContext = new UnityContext({
  loaderUrl: "game/WebGl.loader.js",
  dataUrl: "game/WebGl.data",
  frameworkUrl: "game/WebGl.framework.js",
  codeUrl: "game/WebGl.wasm",
  streamingAssetsUrl: "StreamingAssets",
})

CSS.registerProperty({
  name: "--p",
  syntax: "<integer>",
  initialValue: 0,
  inherits: true,
});

export default function Play() {
	const [ gameSession, setGameSession ] = useState()
	const [ loading, setLoading ] = useState(false);
	
	const sendDiffLog = (diffLog, send = true) => {
		let states = diffLog.map((state, index) => {
			return {
				id: index,
				state_type: state.delay ? 1 : 0,
				value: state,
			}
		})
		console.log('Sending states to unity client');
		console.log(JSON.stringify(states));
		if (send) clientCommand('UpdateGameState', { states });
	}

	function * stringChunk(s, maxBytes) {
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

	const clientCommand = (funcName, param) => {
		const USHORT_SIZE = 65536;
		let data = typeof param === 'string' ? param : JSON.stringify(param)
		const chunks = [...stringChunk(data, USHORT_SIZE)];

		for (let i = 0; i < chunks.length; i++) {
			let chunk_package = {
				count: chunks.length,
				index: i,
				value: chunks[i],
			}
			// console.log(`Web - sending package to Unity client [${funcName}]: ${JSON.stringify(chunk_package)}`);
			unityPlayContext.send('ReactToUnity', funcName, JSON.stringify(chunk_package))
		}
	}

	unityPlayContext.on("OnUnityLoaded", async () => {
		let content = gameSession.content.client
		clientCommand("UpdateGameContent", content)
		sendDiffLog(gameSession.game.diffLog)
	});

	unityPlayContext.on("SendCommand", async (jsonData) => {
		let command = JSON.parse(jsonData)
		gameSession.handlePlayerCommand(command)
		sendDiffLog(gameSession.game.diffLog)
	});

	useEffect(function () {
    unityPlayContext.on("progress", setLoading);
    if (!gameSession) setGameSession(new Session(gameContent, [ 1 ]))
  }, []);

	return (

		!gameSession ? <></> :
	
			<div className = 'splash-bg'>
			{loading < 1 && 
					<div className = 'progress'>
						<p className = 'progress-caption'> Loading Eclipse </p>
						<div className = 'progress-containter'>
					  	<div className = 'progress-value' style={{ width: `${loading * 100}%` }}></div>
						</div>
					</div>}
				<Unity tabIndex={3} style={{ width: '100%' }} unityContext={unityPlayContext} />
			</div>
	);
}
