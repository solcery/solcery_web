import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Game } from '../../game';
import Unity, { UnityContext } from 'react-unity-webgl';
import { useBrickLibrary } from '../../contexts/brickLibrary';
import { build } from '../../content';
import { useUser } from '../../contexts/user';
import { useProject } from '../../contexts/project';
import { notif } from '../../components/notification';
import { useApi } from '../../contexts/api';
import { Input, Button } from 'antd';

export default function Autotest() {
	const { engine } = useProject();
	const [ content, setContent ] = useState();
	const { solceryAPI } = useApi();
	const [ gameData, setGameData ] = useState();
	const [ unityBuild, setUnityBuild ] = useState();
	const [ runs, setRuns ] = useState(5);
	const [ result, setResult ] = useState({});
	const [ running, setRunning ] = useState(false);
	const [ progress, setProgress ] = useState(0);
	let navigate = useNavigate()

	useEffect(() => {
		if (!engine) return;
		if (content) return;
		let targets = [
			{
				name: 'web',
				format: 'web',
			},
			{
				name: 'unity_local',
				format: 'unity'
			},
			{
				name: 'bot',
				format: 'web',
			},
			{
				name: 'web_meta',
				format: 'web',
			},
		];
		engine.getContent({ objects: true, templates: true }).then(raw => {
			let construction = build({
				targets,
				content: raw,
			});
			if (!construction.status) {
				notif.error('Error', 'Content is not valid');
				navigate('../validator');
			}
			construction.constructed.unity = construction.constructed.unity_local;
			setContent(construction.constructed);
		});
	}, [ content, engine ])

	useEffect(() => {
		if (!engine) return;
		if (!solceryAPI) return;
		if (!content) return;
		solceryAPI.getUnityBuild(content.web_meta.gameSettings.build).then(setUnityBuild);
	}, [ engine, content, solceryAPI ])

	useEffect(() => {
		if (!unityBuild) return;
		if (!content) return;
	}, [unityBuild, content]);


	const runGame = () => {
		let seed = Math.floor(Math.random() * 255);
		let players = [];
		let playerSettings = Object.values(content.web.players);
		for (let playerInfo of playerSettings) {
			players.push({
				id: playerInfo.id,
				index: playerInfo.index,
				bot: true,
			})
		};

		
		let actionLog = [];
		const addAction = (action) => {
			actionLog.push(action);
			for (let g of games) {
				g.updateLog(actionLog);
			}
		}

		setGameData()
		let games = []
		for (let player of players) {
			let game = new Game({
				id: 1,
				players,
				playerIndex: player.index,
				seed,
				content,
				unityBuild,
				bot: true,
				// TODO: layoutOverride
			})
			game.onAction = (action) => {
				if (!action.ctx) {
					action.ctx = {};
				}
				action.ctx.player_index = game.playerIndex;
				action.playerIndex = game.playerIndex;
				addAction(action)
			}
			games.push(game);
		}
		for (let game of games) {
			game.setBotStatus(true);
		}
		addAction({ type: 'init' });
		let outcome;
		for (let game of games) {
			game.checkOutcome();
			if (outcome === undefined) {
				outcome = game.outcome;
			}
			assert(game.outcome === outcome);
		}
		return outcome;
	}

	const runAll = () => {
		setProgress(0);
		setResult({});
		setRunning(true);
	}

	useEffect(() => {
		if (!running) return;
		if (progress >= runs) {
			setRunning(false);
			return;
		}
		let outcome = runGame();
		if (!result[outcome]) {
			result[outcome] = 0;
		}
		result[outcome]++;
		setProgress(progress + 1);
	}, [ running, progress ])

	const onRunsChanged = (value) => {
		setRuns(value);
	}
			
	if (!content || !unityBuild) return <>Loading</>
	return (<div>
		{!running && <>
			<Input defaultValue={runs} onChange={event => onRunsChanged(event.target.value)}/>
			<Button onClick={runAll}>RUN!</Button>
		</>}
		{running && <p>Simulation in progress: {progress}/{runs}</p>}
		{!running && result && <p>{JSON.stringify(result)}</p>}
	</div>);
}
