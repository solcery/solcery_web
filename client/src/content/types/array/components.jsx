import React, { useState } from "react";
import { Button } from 'antd';

const ADD_ELEMENT_BUTTON_LABEL = ' + ';
const REMOVE_ELEMENT_BUTTON_LABEL = ' - ';

export const ValueRender = (props) => {

	var [value, setValue] = useState(props.defaultValue || [])
	var [valueSize, setValueSize] = useState(props.defaultValue?.length || 0);

	const onChange = (newValue, index, type) => {
		value[index] = newValue;
		setValue(value)
		var res = value.filter((value) => value)
		props.onChange && props.onChange(res)
	}

	const removeElement = (index) => {
		//TODO
	}

	const addNewElement = () => {
		value.push(undefined)
		setValueSize(valueSize + 1)
		setValue(value)
	}

	if (!props.onChange) return (
		<>
			<p>Array:</p>
			{value.map((val, index) => 
				<div key = { index }>
					[0] => <props.type.valueType.valueRender
						defaultValue = { val }
						type = { props.type.valueType }
					/>
				</div>
			)}
		</>
	);
	return (
		<>
			{value.map((val, index) => 
				<div key={index}>
					<Button onClick = { () => { removeElement(index) } }>
						{ REMOVE_ELEMENT_BUTTON_LABEL }
					</Button>
					<props.type.valueType.valueRender 
						defaultValue = { val }
						type = { props.type.valueType }
						onChange={(newValue) => { 
							onChange(newValue, index) 
						}}
					/>
				</div>
			)}
			<Button onClick = { addNewElement }>
				{ ADD_ELEMENT_BUTTON_LABEL }
			</Button>
		</>
	);
}


// export const TypedataRender = (props: {
//	 defaultValue?: any, 
//	 onChange?: (newValue: any) => void,
// }) => {
//	 const onChange = (newValue: SType) => {
//		 props.onChange && props.onChange(new SArray({ subtype: newValue }))
//	 }
//	 return (
//		 <TypeSelector defaultValue={props.defaultValue && props.defaultValue.subtype} onChange={onChange}/>
//	 )
// }