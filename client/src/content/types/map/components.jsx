import React, { useState, useEffect } from "react";
import { Button } from 'antd';
const ADD_ELEMENT_BUTTON_LABEL = ' + ';
const REMOVE_ELEMENT_BUTTON_LABEL = ' - ';

export const ValueRender = (props) => {

	var [value, setValue] = useState(props.defaultValue ?? []);

	useEffect(() => {
		var res = value.filter((entry) => entry.key !== undefined && entry.value !== undefined);
		props.onChange && props.onChange(res);
	}, [ value, props.onChange ])
	
	const onChange = (newValue, index, type) => {
		console.log(newValue, index, type)
		value[index][type] = newValue;
		setValue([...value]);
	}
	
	const removeElement = (index) => {
		value.splice(index, 1);
		setValue([...value]);
	}

	const addNewElement = () => {
		value.push({
			key: props.type.keyType.default,
			value: props.type.valueType.default,
		});
		setValue([...value]);
	}
	if (!props.onChange) return (
		<>
			{value.map((entry, index) => 
				<div key={`${index}:${entry.key}:${entry.value}`}>
					<props.type.keyType.valueRender
						defaultValue = { entry.key }
						type = { props.type.keyType }
					/>{ ' => ' } 
					<props.type.valueType.valueRender
						defaultValue = { entry.value }
						type = { props.type.valueType }
					/>
				</div>
			)}
		</>
	);
	return (
		<>
			{value.map((entry, index) => 
				<div key={`${index}:${entry.key}:${entry.value}`}>
					<Button onClick = { () => { removeElement(index) } }>
						{ REMOVE_ELEMENT_BUTTON_LABEL }
					</Button>
					<props.type.keyType.valueRender 
						defaultValue = { entry.key }
						type = { props.type.keyType }
						onChange = { (newValue) => { 
							onChange(newValue, index, 'key') 
						}}
					/> => 
					<props.type.valueType.valueRender 
						defaultValue = { entry.value }
						type = { props.type.valueType }
						onChange = { (newValue) => { 
							onChange(newValue, index, 'value')
						}}
					/>
				</div>
			)}
			<Button onClick = { addNewElement } >
				{ ADD_ELEMENT_BUTTON_LABEL }
			</Button>
		</>);
}
