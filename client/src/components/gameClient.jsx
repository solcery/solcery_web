import { useState, useEffect, useRef } from 'react';

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
				sendToUnity('UpdateGameState', { states });
			}

			if (message === 'OnUnityLoaded') {
				let content = gameSession.getUnityContent();
				sendToUnity('UpdateGameContent', content);

				let overrides = gameSession.getContentOverrides();
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
