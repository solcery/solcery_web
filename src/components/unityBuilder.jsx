import { useState } from 'react';
import { Button, Select, Card, Switch } from 'antd';
import { useUser } from '../contexts/user';
import { useProject } from '../contexts/project';
import { build, validate } from '../content';
import { DownloadJSON } from './DownloadJSON';
import { notif } from './notification';
import { Link, useNavigate } from 'react-router-dom';
import { Game } from '../game';
import { DownloadOutlined } from '@ant-design/icons';
const { Option } = Select;

export function UnityBuilder() {
	let navigate = useNavigate();
	const [result, setResult] = useState();
	const { engine  } = useProject();
	const { layoutPresets, nfts } = useUser();
	const [ commandsMode, setCommandsMode ] = useState(false);

	const buildForUnity = async () => {
		let content = await engine.getContent({ objects: true, templates: true });
		let targets = [
			{
				name: 'web',
				format: 'web',
			},
			{
				name: 'unity_local',
				format: 'unity'
			}
		];
		let res = build({ targets, content });
		if (!res.status) {
			notif.error('Unity build error', 'Content is not valid');
			navigate('validator');
			return;
		}
		let layoutOverride = layoutPresets;
		if (!layoutOverride || layoutOverride.length === 0) {
			layoutOverride = undefined; // TODO: empty layoutPresets should be undefined
		}
		content = res.constructed;
		content.unity = content.unity_local;
		let players = [];
		let playerSettings = Object.values(content.web.players);
		let actionLog = [];
		let botCommandId = content.web.gameSettings.botActivationCommand;
		for (let playerInfo of playerSettings) {
			if (nfts) {
				var playerNfts = nfts.filter(nft => nft.player === playerInfo.index);
			}
			players.push({
				id: playerInfo.id,
				index: playerInfo.index,
				nfts: playerNfts,
			});
			if (playerInfo.index > 1 && botCommandId) {
				actionLog.push({
					type: 'gameCommand',
					commandId: botCommandId,
					ctx: {
						player_index: playerInfo.index,
					}
				})
			}
		};
		let session = new Game({
			content,
			layoutOverride,
			nfts,
			players,
			seed: 1,
			actionLog,
			playerIndex: players[0].index,
		});
		session.gameState.start();
		let	unityPackage = session.gameState.exportPackage();
		if (commandsMode) {
			unityPackage.commands = session.getCommands();
			delete unityPackage.actions;
		} else {
			unityPackage.predict = true;
		}
		setResult([
			{
				filename: 'game_content',
				data: session.getUnityContent(),
			},
			{
				filename: 'game_content_overrides',
				data: session.getContentOverrides(),
			},
			{
				filename: 'game_state',
				data: unityPackage,
			},
		]);
	};

	return (
		<>
			<p>Layout: {layoutPresets ? 'custom ' + JSON.stringify(layoutPresets) : 'using game settings'}</p>
			<div>With commands</div>
			<Switch defaultChecked={commandsMode} onChange={() => setCommandsMode(!commandsMode)} />
			<div></div>
			{result && result.map(file => <DownloadJSON key={file.filename} filename={file.filename} data={file.data}/>)}
			<Button onClick={buildForUnity}>{result ? 'Rebuild' : 'Build'}</Button>
		</>
	);
}
