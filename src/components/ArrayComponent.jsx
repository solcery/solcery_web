import { useState, useEffect } from 'react';
import { Button } from 'antd';
import { v4 as uuid } from 'uuid';

export function ArrayComponent(props) {

	const { quantity, elementProps, ItemComponent, style } = props;

	if (quantity === undefined) return;
	if (!elementProps) return;

	const items = Array.from(Array(quantity).keys());

	return <div style={style}>
		{items.map((key, index) => <div key={key} style={{ display: 'flex' }}>
			<ItemComponent {...elementProps(index)} />
			<Button onClick={() => props.onItemRemoved(index)}>-</Button>
		</div>)}
		<Button style= {{ width: '100%' }} onClick={() => props.onItemAdded()}>+</Button>
	</div>
}