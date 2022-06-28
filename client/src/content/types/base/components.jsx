import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from 'antd';

export const DefaultFilterRender = (props) => {
	return (
		<props.type.valueRender
			type={props.type}
			defaultValue={props.defaultValue}
			onChange={props.onChange}
			onPressEnter={props.onPressEnter}
			isFilter = { true }
		/>
	);
};
