import React from 'react';
import { InputNumber } from 'antd';

export const ValueRender = (props) => {
	if (!props.onChange) return <>{props.defaultValue}</>;
	return (
		<InputNumber
			precision={0}
			defaultValue={props.defaultValue}
			onChange={props.onChange}
			onPressEnter={props.onPressEnter}
		/>
	);
};
