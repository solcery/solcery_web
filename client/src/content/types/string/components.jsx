import { useState, useEffect, useRef } from 'react';
import { Input, Button } from 'antd';
import { Link, useLocation } from 'react-router-dom';

export const ValueRender = (props) => {
	let valueRenderRef = useRef();
	const { pathname } = useLocation(); //TODO

	useEffect(() => {
		if (props.isFilter) {
			setTimeout(() => valueRenderRef.current?.focus(), 100);
		}
	});

	if (!props.onChange) {
		if (props.type.isPrimaryTitle && props.object) {
			return <Link to={`${pathname}.${props.object._id}`}>{props.defaultValue}</Link>;
		} else {
			return <>{props.defaultValue}</>;
		}
	};

	return props.type.textArea ? (
		<Input.TextArea
			style={props.type.width && { width: `${props.type.width}px` }}
			type="text"
			ref = { valueRenderRef }
			rows={props.type.textArea.rows ?? 5}
			defaultValue={props.defaultValue}
			onPressEnter={props.onPressEnter}
			onChange={(event) => {
				props.onChange && props.onChange(event.target.value);
			}}
		/>
	) : (
		<Input
			style={props.type.width && { width: `${props.type.width}px` }}
			type="text"
			ref = { valueRenderRef }
			defaultValue={props.defaultValue}
			onPressEnter={props.onPressEnter}
			onChange={(event) => {
				props.onChange && props.onChange(event.target.value);
			}}
		/>
	);
};
