import { useState, useEffect, useRef } from 'react';
import { SolceryAPIConnection } from '../../api';
import { getTable, insertTable } from '../../utils';

import './style.css';

const DOWNLOADING_PROGRESS_PERCENTAGE = 20;
const iframeName = game => `${game.id}.${game.playerIndex}.iframe`


export default function GameClient(props) {
	const [ loaded, setLoaded ] = useState(false);
	const [ unityReady, setUnityReady ] = useState(false);
	const loadingBarRef = useRef();
	const loadingProgressRef = useRef();
	const iframeRef = useRef();
	const currentStep = useRef();

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

	const onUnityLoaded = (data) => {
		const md5 = require('js-md5'); 
		let content = props.game.getUnityContent();
		let contentHash = md5(JSON.stringify(content));
		let cachedContentHash = getTable(data, 'content_metadata', 'game_content', 'hash');

		if (false && contentHash === cachedContentHash) {
			sendToUnity('UpdateGameContent', null);

		} else {
			insertTable(content, contentHash, 'metadata', 'hash')
			sendToUnity('UpdateGameContent', content);
		}
		let overrides = props.game.getContentOverrides();
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
		setUnityReady(true)
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
		if (props.onGameStateConfirmed) {
			props.onGameStateConfirmed(step.current);
		}
		setUnityReady(true);
	}

	const onUnityCommand = (command) => {
		let content = props.game.getUnityContent();
		let commands = content.commands.objects;
		let command_type = command.command_data_type;
		let contentCommand = commands.find(cmd => cmd.command_type === command_type);
		if (contentCommand) {
			let ctx = { ...command };
			delete ctx.command_data_type;
			props.game.onPlayerCommand(contentCommand.id, ctx);
		}
	}

	const onUnityEvent = (event, param) => {
		switch (event) {
			case 'OnUnityLoadProgress':
				onUnityLoadingProgress(param.progress);
				break;
			case 'OnUnityLoaded':
				onUnityLoaded(param)
				break;
			case 'SendCommand':
				onUnityCommand(param);
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
		console.warn('log updated, unityReady');
		console.log(props.game.log.length)
		if (currentStep.current === undefined) {
			var nextStep = props.game.log.length - 1;
		} else {
			var nextStep = currentStep.current + 1;
		}
		console.log(nextStep)
		console.log(currentStep.current)
		let pkg = props.game.getUnityPackage(nextStep);
		if (!pkg) return;
		currentStep.current = nextStep;
		setUnityReady(false);
		console.log(pkg);
		sendToUnity('UpdateGameState', pkg);
	}, [ props.game.log.length, unityReady ])

	useEffect(() => {
		// if (!props.game) return;
		// if (!unityReady) return;
		// setUnityReady(false);
		// sendToUnity('UpdateGameState', pkg);
	}, [ props.game, unityReady ])

	const onIframeReady = async () => {
		let unityBuildData = props.game.unityBuild;
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
		if (!props.game) {
			setLoaded(false);
			return;
		};
		const name = iframeName(props.game)
		window.addEventListener('message', (message) => {
			if (message.source.name !== name) {
				return;
			}
			onMessageFromIframe(message.data.type, message.data.data);
		});

		window.unityLoading = window.unityLoading ?? {};
		window.unityLoading[name] = (data) => {
			onUnityLoadingProgress(data.progress)
		}
	}, [ props.game ])

	if (!props.game) return <></>;
	if (!loaded) {
		var iframeStyle = {
			visibility: 'hidden',
			position: 'absolute'
		}
	}
	return <div style={{ width: '100%', height:'100%' }}>
		<iframe 
			name={iframeName(props.game)}
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
