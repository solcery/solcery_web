import { useState } from 'react';
import { DatePicker } from 'antd';
import moment from 'moment';

export const ValueRender = (props) => {
	let format = props.type.excludeTime ? 'MMMM Do YYYY' : 'MMMM Do YYYY HH:mm';
	let defaultValue = props.defaultValue && moment(props.defaultValue)
	if (!props.onChange) return <p>{defaultValue && defaultValue.format(format)}</p>;
	return <DatePicker 
		format = {format}
		showTime={!props.type.excludeTime && { format: 'HH:mm' }}
		defaultValue={defaultValue} 
		onChange={props.onChange}
		width = {400}
	/>;
};
