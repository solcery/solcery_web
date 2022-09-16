import { useState, useEffect, useRef } from 'react';
import { SolceryAPIConnection } from '../api';
import { getTable, insertTable } from '../utils';
const md5 = require('js-md5'); 

function delay(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

const DOWNLOADING_PROGRESS_PERCENTAGE = 20;

export default function GameClient(props) {
	const [ loaded, setLoaded ] = useState(false);
	const [ finished, setFinished ] = useState(false);

	const getAspect = () => {
		const width = 1920;
        const height = 900;
        let innerWidth = window.innerWidth;
        let innerHeight = window.innerHeight;
        let coef = Math.min(innerWidth / width, innerHeight / height);
		return {
			width: width * coef,
			height: height * coef,
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
		if (!iframeRef.current) return;
		iframeRef.current.width = aspect.width;
		iframeRef.current.height = aspect.height;
	}


	useEffect(() => {

		window.onUnityDownloadProgress = (progress) => {
			props.onLoadingProgress && props.onLoadingProgress(Math.floor(DOWNLOADING_PROGRESS_PERCENTAGE * progress));
		}


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
				productVersion: "0.1",
			}
			return config
		}

		window.onMessageFromUnity = (message, param) => {
			if (message === 'OnUnityLoadProgress') {
				let { progress } = JSON.parse(param)
				if (progress >= 100) {
					setLoaded(true);
					props.onLoadingProgress && props.onLoadingProgress(100);
				}
				let prog = Math.floor(progress * (1 - DOWNLOADING_PROGRESS_PERCENTAGE / 100)) + DOWNLOADING_PROGRESS_PERCENTAGE;
				props.onLoadingProgress && props.onLoadingProgress(prog);
			} 

			if (message === 'OnUnityLoaded') {
				let data = param ? JSON.parse(param) : {};
				let content = gameSession.getUnityContent();
				let contentHash = md5(JSON.stringify(content));
				let cachedContentHash = getTable(data, 'content_metadata', 'game_content', 'hash');

				if (false && contentHash === cachedContentHash) {
					sendToUnity('UpdateGameContent', null);

				} else {
					insertTable(content, contentHash, 'metadata', 'hash')
					sendToUnity('UpdateGameContent', content);
				}

				let overrides = gameSession.getContentOverrides();
				let overridesHash = md5(JSON.stringify(overrides));
				let cachedOverridesHash = getTable(data, 'content_metadata', 'game_content_overrides', 'hash');
				if (false && overridesHash === cachedOverridesHash) {
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
				sendToUnity('UpdateGameState', unityPackage);
				setFinished(gameSession.finished)
			}
			if (message === 'SendCommand') {
				if (gameSession.finished) return; //TODO notify
				let command = JSON.parse(param);
				gameSession.onPlayerCommand(command).then(unityPackage => {
					setFinished(gameSession.finished)
					if (!unityPackage) return;
					unityPackage.predict = true;
					sendToUnity('UpdateGameState', unityPackage);
				})
			}

			if (message === 'OnGameStateConfirmed') {
				if (gameSession.finished) {
					setFinished(true);
					props.onFinished(gameSession.outcome)
				}
			}
		}
	}, [ gameSession, props.unityBuild ])

	useEffect(() => {
		window.addEventListener('resize', handleResize)
		return () => {
				window.removeEventListener('resize', handleResize)
			}
	}, [])

	useEffect(() => {
		if (!gameSession) {
			setLoaded(false);
			setFinished(0);
		}
	}, [ gameSession ])

	if (!gameSession) return <></>
	let aspect = getAspect();
	let iframeStyle = {
		borderStyle: 'none',
		margin: '0',
		padding: '0px',
		border: '1px solid gray'
	}
	let divStyle = {
		position: 'absolute',
		width: '100%',
		height: '100%',
		display: 'flex',
  		justifyContent: 'center',
  		alignItems: 'center',
  		visibility: loaded ? 'unset' : 'hidden',
		pointerEvents: finished ? 'none' : 'auto',
	}
	return <div style={divStyle}>
		<iframe 
			key='unity'
			ref={iframeRef} 
			style={iframeStyle}
			src='/unity.html'
			scrolling='no'
			width={aspect.width}
			height={aspect.height}
		/>
	</div>
}
