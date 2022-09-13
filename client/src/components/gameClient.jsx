import { useState, useEffect, useRef } from 'react';
import { SolceryAPIConnection } from '../api';
import { getTable, insertTable } from '../utils';
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
				cacheControl: function (url) {
		          // Revalidate if file is up to date before loading from cache
		          if (url.match(/\.data/) 
		              || url.match(/\.bundle/)) {
		            return "must-revalidate";
		          }

		          // Load file from cache without revalidation.
		          if (url.match(/\.custom/)
		                  || url.match(/\.png/)
		                  || url.match(/\.jpg/)
		                  || url.match(/\.wav/)) {
		            return "immutable";
		          }

		          // Disable explicit caching for all other files.
		          // Note: the default browser cache may cache them anyway.
		          return "no-store";
		        },
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
				let data = param ? JSON.parse(param) : {};

				let content = gameSession.getUnityContent();
				let contentHash = md5(JSON.stringify(content));
				let cachedContentHash = getTable(data, 'content_metadata', 'game_content', 'hash');

				if (false && contentHash === cachedContentHash) {
					console.log('Content cache valid, sending Null')
					sendToUnity('UpdateGameContent', null);

				} else {
					insertTable(content, contentHash, 'metadata', 'hash')
					sendToUnity('UpdateGameContent', content);
				}

				let overrides = gameSession.getContentOverrides();
				console.log(JSON.stringify(overrides))
				let overridesHash = md5(JSON.stringify(overrides));
				let cachedOverridesHash = getTable(data, 'content_metadata', 'game_content_overrides', 'hash');
				if (false && overridesHash === cachedOverridesHash) {
					console.log('Overrides cache valid, sending Null')
					sendToUnity('UpdateGameContentOverrides', null);
				} else {
					overrides.metadata = {
						hash: md5(JSON.stringify(overrides)),
						content_hash: contentHash,
					}
					sendToUnity('UpdateGameContentOverrides', overrides);
				}



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
