import React, { useState, useEffect, useCallback, useRef } from 'react';
import { BrickHandle } from '../BrickHandle';
import { SType } from 'content/types';

import './style.scss';

export const getBrickLibColor = (lib) => {
	return `var(--brick-color-${lib})`;
}

export function Root(props) {
	let brick = props.data;

	let className = 'brick-root';
	if (props.selected) {
		className += ' selected';
	}
	let param = {
		code: 'value',
		name: 'value',
		type: SType.from('SBrick<action>'),
	}
	return (<>
		<div
			className={className}
			style={{ backgroundColor: getBrickLibColor('action')}}
		>
			Root
			<BrickHandle brick={brick} param={param}/>
		</div>
	</>);
}
