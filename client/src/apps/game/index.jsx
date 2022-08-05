import { useEffect, useState, useCallback } from 'react';
import { usePlayer } from '../../contexts/player';
import { Session } from '../../game';
import GameClient from '../../components/gameClient';

import contentWeb from './content_web.json';
import contentUnity from './content_unity.json';
import { Button, Input, Card, Affix, Collapse } from 'antd';

const { Panel } = Collapse;

const EntityRender = ({ entity, gameSession }) => {

	const onLeftClick = () => {
		let command = {
			command_data_type: 0,
			object_id: entity.id,
		}
		gameSession.onPlayerCommand(command)
	}

	const onRightClick = () => {
		let command = {
			command_data_type: 1,
			object_id: entity.id,
		}
		gameSession.onPlayerCommand(command)
	}

	const onDragNDrop = () => {
		
	}

	return <>
		<Card header = 'Actions'>
			<Button onClick={onLeftClick}>Left click </Button>
			<Button onClick={onRightClick}>Right click </Button>
		</Card>
		{Object.entries(entity.attrs).map(([ attr, value ]) => <p key={attr}>{`${attr}: ${value}`}</p>)}
		{JSON.stringify(entity)}
	</>
}

const PlaceRender = ({ place, gameSession }) => {
	const [ filter, setFilter ] = useState();

	const onFilterChange = (event) => {
		setFilter(event.target.value);
	}
	let entities = place.entities;
	if (filter) {
		entities = entities.filter(place => place.caption.toLowerCase().includes(filter.toLowerCase()))
	}

	return <>
		<div>
			<Input onChange={onFilterChange}/>
		</div>
		<Collapse>
		{entities.map(entity => 
			<Panel header={entity.caption} key={entity.id}>
				<EntityRender entity={entity} gameSession={gameSession} />
			</Panel>
		)}
		</Collapse>
	</>;
}


const GameSessionRender = ({ gameSession }) => {
	const [ filter, setFilter ] = useState();

	useEffect(() => {
		if (!gameSession) return;
		console.log(gameSession.step)
	}, [ gameSession, gameSession.step ])



	if (!gameSession) return <></>;

	let stringLog = JSON.stringify(gameSession.log);
	let stringStep = JSON.stringify(gameSession.step);

	let cardTypes = gameSession.getUnityContent().card_types.objects;
	let contentPlaces = gameSession.getUnityContent().places.objects;

	let allEntities = Object.values(gameSession.game.objects).map(entity => {
		let cardType = cardTypes.find(cardType => cardType.id === entity.tplId);
		return {
			id: entity.id,
			tplId: entity.tplId,
			attrs: entity.attrs,
			caption: `[${entity.id}] ${cardType?.name}`,
		}
	})

	let places = contentPlaces.map(place => {
		let entities = allEntities.filter(entity => entity.attrs.place === place.place_id);
		return {
			caption: `[${place.id}] ${place.caption}`,
			id: place.place_id,
			entities
		}
	})
	places.sort((p1, p2) => {
		if (p1.caption && !p2.caption) return -1;
		if (p2.caption && !p1.caption) return 1;
		return p1.id - p2.id;
	});

	const onFilterChange = (event) => {
		setFilter(event.target.value);
	}
	if (filter) {
		places = places.filter(place => place.caption.toLowerCase().includes(filter.toLowerCase()))
	}


	return <>
		<Affix offsetTop={0}>
			<Card>
				<p>Game state </p>
				<p>Current step: {gameSession.step}</p>
				<p>Log: {stringLog}</p>
			</Card>
		</Affix>
		<div>
			<Input onChange={onFilterChange}/>
		</div>
		<Collapse>
			{places.map(place => 
				<Panel header={place.caption} key={place.id}>
					<PlaceRender place={place} gameSession={gameSession} />
				</Panel>
			)}
		</Collapse>
	</>
}

export const GameTest = () => {
	const { publicKey, nfts } = usePlayer();
	const [ log, setLog ] = useState([]);
	const [ revision, setRevision] = useState(0);
	const [ gameSession, setGameSession ] = useState();

	const onCommand = useCallback(command => {
		log.push(command);
		console.log(log)
		gameSession.updateLog([ ...log ]);
		setRevision(revision+1);
	}, [ gameSession ]);

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
		setGameSession(session);
	}

	useEffect(() => {
		if (gameSession && !gameSession.onCommand) {
			gameSession.onCommand = onCommand;
		}
	}, [ gameSession ])

	useEffect(() => {
		if (!publicKey || !nfts) return;
		if (gameSession) return;
		newGame();
	}, [ publicKey, nfts ])

	if (!gameSession) return <>Loading</>;
	return <GameSessionRender gameSession={gameSession}/>;
	// return (<GameClient gameSession={gameSession}/>);
}