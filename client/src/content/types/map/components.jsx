import React, { useState, useEffect } from "react";
import { Button } from 'antd';

const ADD_ELEMENT_BUTTON_LABEL = ' + ';
const REMOVE_ELEMENT_BUTTON_LABEL = ' - ';

export const ValueRender = (props) => {

	var [value, setValue] = useState(props.defaultValue || [])
	var [valueSize, setValueSize] = useState(props.defaultValue?.length || 0);

	const sendValue = (value) => {
		var res = value.filter((entry) => entry.key !== undefined && entry.value !== undefined);
		props.onChange && props.onChange(res);
	}

	const onChange = (newValue, index, type) => {
		value[index][type] = newValue;
		setValue(value);
		sendValue(value);
	}
	
	const removeElement = (index) => {
		// TODO;
	}

	const addNewElement = () => {
		value.push({
			key: props.type.keyType.default,
			value: props.type.valueType.default,
		});
		setValueSize(valueSize + 1);
		setValue(value);
		sendValue(value);
	}

	if (!props.onChange) return (
		<>
			<p>Map:</p>
			{value.map((val, index) => 
				<div key = { index }>
					<props.type.keyType.valueRender
						defaultValue = { val.key }
						type = { props.type.keyType }
					/>
					 => 
					<props.type.valueType.valueRender
						defaultValue = { val.value }
						type = { props.type.valueType }
					/>
				</div>
			)}
		</>
	);
	return (
		<>
			{value.map((entry, index) => 
				<div key = { index }>
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
