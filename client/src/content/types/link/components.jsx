import React, { useState, useEffect } from "react";
import { Select } from 'antd';

import { SageAPI } from '../../../api';
const { Option } = Select;

export const ValueRender = (props) => {

	const [ value, setValue ] = useState(undefined);
	const [ objects, setObjects ] = useState(undefined);
	const onChange = (newValue) => {
		setValue(newValue);
		props.onChange && props.onChange(newValue);
	}

	useEffect(() => {
		if (props.defaultValue && props.type) {
			SageAPI.template.getObjectById(props.type.templateCode, props.defaultValue).then(setValue)
		}
	}, [ props.defaultValue, props.type ])

	useEffect(() => { 
		SageAPI.template.getAllObjects(props.type.templateCode).then(res => {
			setObjects(res.map(object => {
				return {
					id: object._id,
					title: object.fields.title,
				}
			}))
		})

	}, [ props.type ]);

	if (!props.onChange) {
		if (value) {
			return <a href = { `/template.${props.type.templateCode}.${value._id}` }>
					{ value.fields.title }
				</a>;
		} else return <p>None</p>;
	}

	if (!objects) return <></>;
	return <Select onChange = { onChange } defaultValue = { props.defaultValue }>
			<Option key='none' value='None'>
				None
			</Option>
			{objects.map(obj => 
				<Option key = { obj.id } value = { obj.id }>
					{ obj.title }
				</Option>
			)} 
		</Select>;
}


