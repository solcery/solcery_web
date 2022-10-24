import { useState, useEffect, useRef } from 'react';
import { SolceryAPIConnection } from '../../api';
import { getTable, insertTable } from '../../utils';
import { useGame } from '../../contexts/game';

import './style.css';

const DOWNLOADING_PROGRESS_PERCENTAGE = 20;

export default function GameClient(props) {
	const { game, actionLog } = useGame();
	const [ loaded, setLoaded ] = useState(false);
	const [ finished, setFinished ] = useState(false);
	const [ unityReady, setUnityReady ] = useState(false);
	const [ iframeName, setIframeName ] = useState();
	// const [ loadingProgress, setLoadingProgress ] = useState();
	const step = useRef(0);
	const loadingBarRef = useRef();
	const loadingProgressRef = useRef();
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
		const md5 = require('js-md5'); 
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

	const setLoadingProgress = (progress) => {
		if (!loadingBarRef.current) return;
		loadingProgressRef.current.innerHTML = `Loading: ${progress}%`;
		loadingBarRef.current.style.width = `${progress}%`;
	}

	const onUnityLoadingProgress = (progress) => {
		setLoaded(progress >= 100);
		let prog = Math.floor(progress * (1 - DOWNLOADING_PROGRESS_PERCENTAGE / 100)) + DOWNLOADING_PROGRESS_PERCENTAGE;
		setLoadingProgress(prog)
	}

	const onUnityDownloadingProgress = (progress) => {
		setLoadingProgress(Math.floor(DOWNLOADING_PROGRESS_PERCENTAGE * progress));
	}

	const onUnityGameStateConfirmed = () => {
		setUnityReady(true);
	}

	const onUnityEvent = (event, param) => {
		switch (event) {
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

	useEffect(() => {
		if (!unityReady) return;
		if (actionLog.length > step.current) {
			setUnityReady(false);
			sendToUnity('UpdateGameState', actionLog[actionLog.length - 1].package);
			step.current = actionLog.length;
		}
	}, [ unityReady, actionLog ])

	const onIframeReady = async () => {
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
	          if (url.match(/\.custom/)
	                  || url.match(/\.png/)
	                  || url.match(/\.jpg/)
	                  || url.match(/\.wav/)) {
	            return "immutable";
	          }
	          return "no-store";
	        },
			companyName: "Solcery",
			productName: "solcery_client_unity",
			productVersion: "0.1",
		}
		iframeRef.current.contentWindow.launch(config); // TODO: postMessage
	}

	const onMessageFromIframe = (type, data) => {
		if (type === 'iframeReady') {
			onIframeReady();
			return;
		}
		if (type === 'dowloadProgress') {
			onUnityDownloadingProgress(data);
			return;
		}
		if (type === 'unityEvent') {
			let { event, param } = data;
			onUnityEvent(event, param)
			return;
		}
	}


	useEffect(() => {
		if (!game) return;
		const name = `${game.id}.${game.playerId}.iframe`;

		window.addEventListener('message', (message) => {
			if (message.source.name !== name) {
				return;
			}
			onMessageFromIframe(message.data.type, message.data.data);
		});

		window.onUnityProgress = (data) => {
			setLoadingProgress(data.progress)
		}

		setIframeName(name);
	}, [ game ])

	useEffect(() => {
		if (!game) {
			setLoaded(false);
			setFinished(0);
			return;
		}

	}, [ game ])

	if (!game) return <></>;
	if (!iframeName) return <></>;

	if (!loaded) {
		var iframeStyle = {
			visibility: 'hidden',
			position: 'absolute'
		}
	}
	return <div style={{ width: '100%', height:'100%' }}>
		<iframe 
			name={iframeName}
			key='unity'
			ref={iframeRef} 
			className={'game-iframe'}
			style={iframeStyle}
			src='/unity.html'
			scrolling='no'
			width={1920}
			height={900}
		/>
		{!loaded && <div className='loading-screen'>
			<div className='progress-number' ref={loadingProgressRef}>Loading</div>
			<div className="progressbar">
				<div ref={loadingBarRef} className="progress"/>
 			</div>
 		</div>}
	</div>
}
