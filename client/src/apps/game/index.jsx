import { useEffect, useState } from 'react';
import { usePlayer } from '../../contexts/player';
import { Session } from '../../game';
import GameClient from '../../components/gameClient';

import contentWeb from './content_web.json';
import contentUnity from './content_unity.json';
import { Collapse } from 'antd';

const { Panel } = Collapse;

 // <Collapse defaultActiveKey={['1']} onChange={onChange}>
 //      <Panel header="This is panel header 1" key="1">
 //        <p>{text}</p>
 //      </Panel>
 //      <Panel header="This is panel header 2" key="2">
 //        <p>{text}</p>
 //      </Panel>
 //      <Panel header="This is panel header 3" key="3">
 //        <p>{text}</p>
 //      </Panel>
 //    </Collapse>

const GameEntityRender = (props) => {


	return <>
		{JSON.stringify(props.entity)}

	</>
}


const GameSessionRender = ({ gameSession }) => {
	if (!gameSession) return <></>;

	let stringLog = JSON.stringify(gameSession.log);
	let stringStep = JSON.stringify(gameSession.step);

	const makeTurn = () => {

	}

	console.log(gameSession.getUnityContent())
	let cardTypes = gameSession.getUnityContent().card_types.objects;
	let entities = Object.values(gameSession.game.objects).map(entity => {
		console.log(entity)
		let cardType = cardTypes.find(cardType => cardType.id === entity.tplId);
		console.log(cardType)
		return {
			id: entity.id,
			tplId: entity.tplId,
			attrs: entity.attrs,
			name: cardType?.name
		}
	})

	console.log(entities)

	return <>
		<p>Game state </p>
		<p>Current step: {gameSession.step}</p>
		<p>Log: {stringLog}</p>
		<Collapse>
			{Object.values(gameSession.game.objects).map((entity, index) => 
				<Panel key={index}>

				</Panel>
			)}
		</Collapse>
	</>
}

export const GameTest = () => {
	const { publicKey, nfts } = usePlayer();
	const [ gameSession, setGameSession ] = useState();

	const newGame = () => {
		let content = {
			web: contentWeb,
			unity: contentUnity,
		}
		let layoutPresets = [ 'core', 'tech demo', 'starting creatures' ];
		let session = new Session({
			content,
			layoutPresets,
			nfts
		});
		session.start();
		console.log(session)
		setGameSession(session)
	}

	useEffect(() => {
		if (!publicKey || !nfts) return;
		if (gameSession) return;
		newGame();
	}, [ publicKey, nfts ])

	useEffect(() => {
		console.log(gameSession)
	}, [ gameSession ])

	if (!gameSession) return <>Loading</>;
	return <GameSessionRender gameSession={gameSession}/>;
	// return (<GameClient gameSession={gameSession}/>);
}