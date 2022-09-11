import { useState, useEffect, useRef } from 'react';
import { SolceryAPIConnection } from '../api'
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


		window.getUnityConfig = async () => {
			let api = new SolceryAPIConnection('solcery', { modules: [ 'template' ]});
			let unityBuildId = props.unityBuild;
			let unityBuildData = await api.template.getObjectById({ template: 'unityBuilds', objectId: unityBuildId });
			let loaderUrl = unityBuildData.fields.loaderUrl;
			let loader = await fetch(loaderUrl);
			let script = await loader.text();

			let config = {
				loaderScript: script,
				dataUrl: unityBuildData.fields.dataUrl,
				frameworkUrl: unityBuildData.fields.frameworkUrl,
				codeUrl: unityBuildData.fields.codeUrl,
				streamingAssetsUrl: unityBuildData.fields.streamingAssetsUrl,
				companyName: "Solcery",
				productName: "solcery_client_unity",
				productVersion: "0.1"
			}
			return config
		}

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
	}, [ gameSession, props.unityBuild ])

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
