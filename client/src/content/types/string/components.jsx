import React from "react";
import { Input } from 'antd';

export const ValueRender = (props) => {
	if (!props.onChange) return <>{ props.defaultValue }</>;

	return <><Input 
		style = {{ width: `${ props.type.width ? props.type.width : 200 }px` }}
		type = "text" 
		defaultValue={ props.defaultValue }
		onChange={ (event) => { props.onChange && props.onChange(event.target.value) } }
	/></>;
}
