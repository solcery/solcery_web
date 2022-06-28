import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from 'antd';

export const DefaultFilterRender = (props) => {
	const [value, setValue] = useState(props.defaultValue);

	const apply = useCallback(() => {
		props.onChange(value);
	}, [ value ])

	const clear = () => {
		props.onChange(undefined);
	}

	return (
		<props.type.valueRender
			type={props.type}
			defaultValue={props.defaultValue}
			onChange={props.onChange}
			onPressEnter={apply}
			isFilter = { true }
		/>
	);
};
