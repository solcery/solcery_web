import React, { useState } from 'react';
import { Select } from 'antd';

import './style.scss'

export const BrickSelector = (props) => {
	if (!props.position) return;
	if (!props.brickLibrary) return;
	let options = [];

	for (let [ lib, functions ] of Object.entries(props.brickLibrary)) {
		for (let { func, name } of Object.values(functions)) {
			options.push({
				value: JSON.stringify({
					lib,
					func
				}), 
				label: name
			})
		}
	}

	const onBrickSubtypeSelected = (jsonBrick) => {
		if (!props.onSelected) return;
		if (jsonBrick) {
			var brick = JSON.parse(jsonBrick);
		}
		props.onSelected(brick);
	}
	const filterOption = undefined;

	return (<div 
		className={`brick-selector`}
		style={{
			left: props.position.x,
			top: props.position.y
		}}
		onBlur={() => onBrickSubtypeSelected()}
	>
		<Select
			showSearch
			style={{
				width: 400,
			}}
			autoFocus
			defaultOpen
			placeholder="Search..."
			options={options}
			dropdownMatchSelectWidth={false}
			onChange={onBrickSubtypeSelected}
			filterOption={filterOption}			
		/>
	</div>);
}
		