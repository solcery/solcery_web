import { useState } from 'react'
import { ArrayComponent } from 'components/ArrayComponent';
import { useBrickLibrary } from 'contexts/brickLibrary';
import { Select, Input } from 'antd';

const { Option } = Select;

import './style.scss';

export function BrickTypeSelector(props) {
	const { brickLibrary } = useBrickLibrary();

	if (!brickLibrary) return;

	const onChange = (value) => {
		props.onChange(value)
	}

	if (!props.onChange) {
		if (!props.defaultValue) return;
		return <div 
			className='brick-type-option'
			style={{ backgroundColor: brickType.color }}
		>
			{brickType.name}
		</div>
	};
	const options = brickLibrary.getTypes();
	return <Select 
		defaultValue={props.defaultValue} 
		onChange={props.onChange} 
		placeholder='Select brick type...' 
		className='brick-type-selector'
	>
		{options.map(brickType => <Option key={brickType.code} value={brickType.code}>
			<div className='brick-type-option'style={{ backgroundColor: brickType.color }}>{brickType.name}</div>
		</Option>)}
	</Select>
}

function ParamSignature(props) {
	const [ param, setParam ] = useState(props.defaultValue ?? {})
	const { brickLibrary } = useBrickLibrary();

	const onParamChanged = (prop, value) => {
		param[prop] = value;
		if (!props.onChange) return;
		props.onChange(param);
	}

	if (!props.onChange) {
		let backgroundColor = brickLibrary.getTypeColor(param.type);
		return <div className='brick-type-option'style={{ backgroundColor }}>
			{param.name}
		</div>
	}

	return <div style = {{ display: 'flex' }}>
		Name: <Input 
			onChange={event => onParamChanged('name', event.target.value)}
			style={{ width: 200 }}
			defaultValue={param.name}
		/>
		Type: <BrickTypeSelector
			onChange={value => onParamChanged('type', value)}
			defaultValue={param.type}
		/>
	</div>
}

export function ParamsSelector(props) {
	if (props.onChange) {
		var onChange = (value) => {
			if (!props.onChange) return;
			if (!value) {
				props.onChange(value);
				return;
			}
			props.onChange(value.filter(v => v.name && v.type));
		}
	}

	return <ArrayComponent 
		className='brick-params-selector'
		defaultValue={props.defaultValue}
		ItemComponent={ParamSignature}
		onChange={onChange}
	/>
}