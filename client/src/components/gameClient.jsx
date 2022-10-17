import { useState, useEffect, useRef } from 'react';
import { SolceryAPIConnection } from '../api';
import { getTable, insertTable } from '../utils';
import { useGame } from '../contexts/game';
const md5 = require('js-md5'); 

function delay(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

const DOWNLOADING_PROGRESS_PERCENTAGE = 20;

export default function GameClient(props) {
	const { game, actionLog } = useGame();
	const [ loaded, setLoaded ] = useState(false);
	const [ finished, setFinished ] = useState(false);
	const [ logLength, setLogLength ] = useState(0);
	const [ unityReady, setUnityReady ] = useState(false);
	const step = useRef(0);

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

	const sendToUnity = (funcName, param) => {
		if (!iframeRef.current) return;
		let data = { funcName, param }
		try {
			iframeRef.current.contentWindow.sendToUnity(JSON.stringify(data));
		}
		catch (err) {
			console.error(err)
			if (props.onError) {
				err.data = {
					type: 'unity',
					funcName,
				}
				props.onError(err);
			}
			throw err;
		}
	}

	const onUnityReady = (data) => {
		let content = game.getUnityContent();
		let contentHash = md5(JSON.stringify(content));
		let cachedContentHash = getTable(data, 'content_metadata', 'game_content', 'hash');

		if (false && contentHash === cachedContentHash) {
			sendToUnity('UpdateGameContent', null);

		} else {
			insertTable(content, contentHash, 'metadata', 'hash')
			sendToUnity('UpdateGameContent', content);
		}
		let overrides = game.getContentOverrides();
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
		setUnityReady(true);
	}

	const onUnityLoadingProgress = (progress) => {
		if (progress >= 100) {
			setLoaded(true);
			props.onLoadingProgress && props.onLoadingProgress(100);
		}
		let prog = Math.floor(progress * (1 - DOWNLOADING_PROGRESS_PERCENTAGE / 100)) + DOWNLOADING_PROGRESS_PERCENTAGE;
		props.onLoadingProgress && props.onLoadingProgress(prog);
	}

	const onUnityDownloadingProgress = (progress) => {
		props.onLoadingProgress && props.onLoadingProgress(Math.floor(DOWNLOADING_PROGRESS_PERCENTAGE * progress));
	}

	const onUnityGameStateConfirmed = () => {
		setUnityReady(true);
	}

	useEffect(() => {
		if (!unityReady) return;
		if (actionLog.length > step.current) {
			setUnityReady(false);
			sendToUnity('UpdateGameState', actionLog[actionLog.length - 1].package);
			step.current = actionLog.length;
		}
	}, [ unityReady, actionLog ])

	useEffect(() => {
		if (!game) return;

		window.onUnityDownloadProgress = (progress) => {
			onUnityDownloadingProgress(progress);
		}

		window.getUnityConfig = async () => {
			let unityBuildData = game.unityBuild;
			let loaderUrl = unityBuildData.loaderUrl;
			let loader = await fetch(loaderUrl);
			let script = await loader.text();

			let config = {
				loaderScript: script,
				dataUrl: unityBuildData.dataUrl,
				frameworkUrl: unityBuildData.frameworkUrl,
				codeUrl: unityBuildData.codeUrl,
				streamingAssetsUrl: unityBuildData.streamingAssetsUrl,
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
			return config;
		}

		window.onMessageFromUnity = (message, stringParam) => {
			if (stringParam) {
				var param = JSON.parse(stringParam);
			}
			switch (message) {
				case 'OnUnityLoadProgress':
					onUnityLoadingProgress(param.progress);
					break;
				case 'OnUnityLoaded':
					onUnityReady(param)
					break;
				case 'SendCommand':
					game.onClientCommand(param);
					break;
				case 'OnGameStateConfirmed':
					onUnityGameStateConfirmed();
					break;
				default:
					throw 'Unkown unity command';
			}
		}
	}, [ game ])

	useEffect(() => {
		const handleResize = () => {
			let aspect = getAspect();
			if (!iframeRef.current) return;
			iframeRef.current.width = aspect.width;
			iframeRef.current.height = aspect.height;
		}

		window.addEventListener('resize', handleResize)
		return () => {
				window.removeEventListener('resize', handleResize)
			}
	}, [])

	useEffect(() => {
		if (!game) {
			setLoaded(false);
			setFinished(0);
			return;
		}

	}, [ game ])

	if (!game) return <></>
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
