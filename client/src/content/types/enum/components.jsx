import React from "react";
import { Select } from 'antd';

const { Option } = Select;

export const ValueRender = (props) => {
	if (!props.onChange) {
		var defaultValue = props.defaultValue ? props.defaultValue : 0;
		return <p>{ props.type.values[defaultValue] }</p>;
	}
	return (
		<div>
			<Select defaultValue = { props.defaultValue ? props.defaultValue : 0 } onChange = { props.onChange }>
				{props.type.values.map((value, index) => 
					<Option key = { index } value = { index }>
						{ value }
					</Option>
				)} 
			</Select>
		</div>
	);
}
