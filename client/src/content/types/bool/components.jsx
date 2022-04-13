import React from "react";
import { Switch } from 'antd';

export const ValueRender = (props) => {
	if (!props.onChange) return (<p>{ props.defaultValue ? "True" : "False" }</p>);
	return <Switch 
		defaultChecked = { props.defaultValue } 
		onChange = { props.onChange }
	/>;
}
