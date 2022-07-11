import { SType } from '../base';
import { useState, useEffect } from 'react';
import { Button } from 'antd';
import paramSchema from './paramSchema.json';


export const ValueRender = (props) => {
	const [ value, setValue ] = useState(props.defaultValue)
	const [ brickTree, setBrickTree ] = useState(props.defaultValue && props.defaultValue.brickTree);
	const [ brickParams, setBrickParams ] = useState(props.defaultValue && props.defaultValue.brickParams);

	const paramSType = SType.from(paramSchema);
	const brickSType = SType.from('SBrick');

	const onChangeBrickTree = (bt) => {
		setBrickTree(bt)
		if (!props.onChange) return;
		props.onChange({ brickTree: bt, brickParams });
	};

	const onChangeBrickParams = (bp) => {
		setBrickParams(paramSType.clone(bp));
		if (!props.onChange) return;
		props.onChange({ brickTree, brickParams: bp });
	};
	let path = { ... props.path }
// TODO: add path
	return <>
		<div>
			<paramSType.valueRender 
				defaultValue={brickParams} 
				type ={paramSType}
				onChange={onChangeBrickParams}
				path = {{ ...props.path, fieldPath: [ ... props.path.fieldPath, 'brickParams' ] }}
			/> 
			<brickSType.valueRender 
				defaultValue={brickTree}
				brickParams={brickParams} 
				type={brickSType} 
				onChange={onChangeBrickTree}
				path = {{ ...props.path, fieldPath: [ ... props.path.fieldPath, 'brickTree' ] }}
			/> 
		</div>
	</>
};
