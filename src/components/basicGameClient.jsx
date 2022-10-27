import { useEffect, useState, useCallback } from 'react';
import { Button, Input, Card, Affix, Collapse } from 'antd';
const { Panel } = Collapse;

const EntityRender = ({ entity, gameSession, onCommand }) => {

	const onLeftClick = () => {
		let command = {
			command_data_type: 0,
			object_id: entity.id,
		}
		gameSession.onPlayerCommand(command)
		onCommand(command)
	}

	const onRightClick = () => {
		let command = {
			command_data_type: 1,
			object_id: entity.id,
		}
		gameSession.onPlayerCommand(command)
		onCommand(command)
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

const PlaceRender = ({ place, gameSession, onCommand }) => {
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
				<EntityRender entity={entity} gameSession={gameSession} onCommand={onCommand} />
			</Panel>
		)}
		</Collapse>
	</>;
}


export default function BasicGameClient({ gameSession, step }) {
	const [ filter, setFilter ] = useState();
	const [ stringLog, setStringLog ] = useState('[]');

	useEffect(() => {
		setStringLog(JSON.stringify(gameSession.log));
	}, [step, gameSession.log])

	if (!gameSession) return <></>;

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
			caption: `[${place.place_id}] ${place.caption}`,
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

	const onCommand = () => {
		setStringLog(JSON.stringify(gameSession.log))
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
					<PlaceRender place={place} gameSession={gameSession}  onCommand={onCommand} />
				</Panel>
			)}
		</Collapse>
	</>
}