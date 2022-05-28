import React from "react";
import { Input } from 'antd';

export const ValueRender = ({ defaultValue, type, onChange }) => {
	if (!onChange) return <>{ defaultValue }</>;

	return <Input 
		style = {{ width: `${ type.width ? type.width : 200 }px` }}
		type = "text" 
		defaultValue={ defaultValue }
		onChange={ (event) => { onChange && onChange(event.target.value) } }
	/>;
}

export const FilterRender = ({ defaultValue, onChange }) => {
	return <Input 
		style = { { width: '200px' }}
		defaultValue={ defaultValue }
		onChange={ (event) => { onChange && onChange(event.target.value) } }
	/>;
}
