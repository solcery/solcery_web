import { useState, useEffect, useRef } from 'react';
const md5 = require('js-md5');

export default function GameClient(props) {

	const getAspect = () => {
		return {
			width: window.innerWidth,
			height: window.innerWidth / 2.133
		}
	}

	const iframeRef = useRef();
	let gameSession = props.gameSession;

	const sendToUnity = (funcName, param) => {
		if (!iframeRef.current) return;
		let data = { funcName, param }
		// console.log(JSON.stringify(param))
		iframeRef.current.contentWindow.sendToUnity(JSON.stringify(data));
	}

	const handleResize = () => {
		let aspect = getAspect();
		iframeRef.current.width = aspect.width;
		iframeRef.current.height = aspect.height;
	}

	useEffect(() => {
		window.onMessageFromUnity = (message, param) => {

			const sendDiffLog = (states) => {
				for (let index in states) {
					states[index].id = index;
				}
				sendToUnity('UpdateGameState', { predict: true, states });
			}

			if (message === 'OnUnityLoaded') {
				// TODO: add metadata parsing
				let content = gameSession.getUnityContent();
				let contentHash = md5(JSON.stringify(content));
				content.metadata.hash = contentHash;
				sendToUnity('UpdateGameContent', content);

				let overrides = gameSession.getContentOverrides();
				overrides.metadata = {
					hash: md5(JSON.stringify(overrides)),
					content_hash: contentHash,
				}
				sendToUnity('UpdateGameContentOverrides', overrides);

				sendDiffLog(gameSession.game.diffLog);
			}
			if (message === 'SendCommand') {
				let command = JSON.parse(param);
				gameSession.onPlayerCommand(command).then(sendDiffLog)
			}
		}
	}, [])

	useEffect(() => {
		window.addEventListener('resize', handleResize)
		return () => {
      		window.removeEventListener('resize', handleResize)
      	}
	}, [])

	if (!gameSession) return <>NO SESSION</>
	let aspect = getAspect();
	return <iframe 
		key='unity'
		ref={iframeRef} 
		style={{ borderStyle: 'none', margin: '0'}}
		src='/unity.html'
		scrolling='no'
		width={aspect.width}
		height={aspect.height}
	/>
}
