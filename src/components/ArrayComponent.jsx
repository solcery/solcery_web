import { useState, useEffect } from 'react';
import { Button } from 'antd';
import { v4 as uuid } from 'uuid';

export function ArrayComponent(props) {

	const [ items, setItems ] = useState(props.defaultValue ?? []);
	const [ itemUuids, setItemUuids ] = useState(); 

	useEffect(() => {
		setItemUuids(items.map(item => uuid()));
	}, [ items ])

	const update = (items) => {
		if (!props.onChange) return;
		props.onChange(items);
	}

	const onItemChanged = (uuid, value) => {
		let index = itemUuids.find(item => item === uuid);
		if (index < 0) return;
		items[index] = value;
		update(items)
	}

	const onItemRemoved = (uuid) => {
		let index = itemUuids.find(item => item === uuid);
		if (index < 0) return;
		items.splice(index, 1);
		itemUuids.splice(index, 1);
		setItemUuids([...itemUuids])
		update(items)
	};

	const onItemAdded = () => {
		items.push({});
		itemUuids.push(uuid());
		setItemUuids([...itemUuids])
		update(items);
	};

	if (!itemUuids) return;
	return <div className={props.className} style={props.style}>
		{itemUuids.map((uuid, index) => <div key={uuid}>
			{props.onChange && <Button onClick={() => onItemRemoved(uuid)}>-</Button>}
			<props.itemComponent 
				defaultValue={items[index]}
				onChange={props.onChange ? (value) => onItemChanged(uuid, value) : undefined} 
			/>
		</div>)}
		{props.onChange && <Button onClick={() => onItemAdded()}>+</Button>}
	</div>
}