import React, { useState, useEffect, useRef } from "react";
import { SageAPI } from '../../../api';
import { Select } from 'antd';
const { Option } = Select;

export const ValueRender = (props) => {

	const [ value, setValue ] = useState(undefined);
	const [ objects, setObjects ] = useState(undefined);
	const mountedRef = useRef(true)

	useEffect(() => {
	    return () => { 
	    	mountedRef.current = false
	    }
	 }, [])

	const onChange = (newValue) => {
		setValue(newValue);
		props.onChange && props.onChange(newValue);
	}


	useEffect(() => {
		SageAPI.template.getAllObjects(props.type.templateCode).then(res => {
			if (!mountedRef.current) return null;
			setObjects(res.map(object => {
				return {
					id: object._id,
					title: object.fields.name,
				}
			}))
		})
	}, [ props.type ]);

	if (!objects) return <>Loading</>;
	if (!props.onChange) {
		if (props.defaultValue) {
			let obj = objects.find(obj => obj.id === props.defaultValue);
			if (obj) {
				return <a href = { `/template.${props.type.templateCode}.${props.defaultValue}` }>
						{ obj.title }
					</a>;
			}
			else {
				return <p>{ `Missing object ${props.defaultValue}`}</p>;
			}
		} else return <p>None</p>;
	}

	return <Select 
				showSearch
				style={{
			      width: 200,
			    }}
				onChange = { onChange }
				defaultValue = { props.defaultValue }
				filterOption={(input, option) => option.children.includes(input)}
    			filterSort={(optionA, optionB) => optionA.children
    				.toLowerCase()
    				.localeCompare(optionB.children.toLowerCase())}
			>
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


