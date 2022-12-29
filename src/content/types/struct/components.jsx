import { useState } from 'react';
import { FieldRender } from '../FieldRender';

export const ValueRender = (props) => {
	var [value] = useState(props.defaultValue || {});

	const setField = (fieldCode, v) => {
		value[fieldCode] = v;
		if (!props.onChange) return;
		props.onChange(value);
	};


	if (!props.onChange) return <>
		{props.type.fields.map(field => <div key={field.code} style={{ display: 'flex' }}>
			{field.name} : <FieldRender 
				path={[...props.path, field.code ]}
				defaultValue={value[field.code]} 
				type={field.type} />
		</div>)}
	</>

	return <>
		{props.type.fields.map(field => <div key={field.code} style={{ display: 'flex' }}>
			{field.name}:{' '}
			<FieldRender
				path={[...props.path, field.code ]}
				defaultValue={value[field.code]}
				type={field.type}
				onChange={
					!field.readonly && props.onChange
						? (newValue) => {
								setField(field.code, newValue);
						  }
						: undefined
				}
			/>
		</div>)}
	</>
};
