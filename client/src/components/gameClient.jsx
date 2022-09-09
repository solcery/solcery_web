import { useState, useEffect, useRef } from 'react';
const md5 = require('js-md5');

function delay(ms) {
   return new Promise(resolve => setTimeout(resolve, ms));
}

export default function GameClient(props) {
	const [ loadingProgress, setLoadingProgress ] = useState(0);
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
		if (!iframeRef.current) return;
		iframeRef.current.width = aspect.width;
		iframeRef.current.height = aspect.height;
	}

	useEffect(() => {
		window.onMessageFromUnity = (message, param) => {
			if (message === 'OnUnityLoadProgress') {
				let { progress } = JSON.parse(param)
				setLoadingProgress(progress)
				props.onLoadingProgress && props.onLoadingProgress(progress);
			} 

			if (message === 'OnUnityLoaded') {

				// TODO: add metadata parsing
				let content = gameSession.getUnityContent();
				let contentHash = md5(JSON.stringify(content));
				if (!content.metadata) {
					content.metadata = {}
				}
				content.metadata.hash = contentHash;
				sendToUnity('UpdateGameContent', content);

				let overrides = gameSession.getContentOverrides();
				overrides.metadata = {
					hash: md5(JSON.stringify(overrides)),
					content_hash: contentHash,
				}
				sendToUnity('UpdateGameContentOverrides', overrides);
				let unityPackage = gameSession.game.exportPackage();
				unityPackage.predict = true;
				sendToUnity('UpdateGameState', unityPackage)	
			}
			if (message === 'SendCommand') {
				let command = JSON.parse(param);
				gameSession.onPlayerCommand(command).then(unityPackage => {
					unityPackage.predict = true;
					sendToUnity('UpdateGameState', unityPackage);
				})
			}
		}
	}, [ gameSession ])

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
		style={{ borderStyle: 'none', margin: '0', visibility: loadingProgress < 100 ? 'hidden' : 'unset' }}
		src='/unity.html'
		scrolling='no'
		width={aspect.width}
		height={aspect.height}
	/>
}
