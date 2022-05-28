import { useState } from "react";
import { Input, Button } from 'antd';

export const ValueRender = ({ defaultValue, type, onChange }) => {
	if (!onChange) return <>{ defaultValue }</>;

	return <Input 
		style = {{ width: `${ type.width ? type.width : 200 }px` }}
		type = "text" 
		defaultValue={ defaultValue }
		onChange={ (event) => { onChange && onChange(event.target.value) } }
	/>;
}

export const FilterRender = ({ defaultValue, onChange }) => {
	const [ value, setValue ] = useState(defaultValue);
	return (<div>
		<Input 
			style = { { width: '200px' }}
			defaultValue={ defaultValue }
			onChange={ (event) => { onChange && setValue(event.target.value) } }
		/>
		<Button onClick={() => onChange(value)}>APPLY</Button>
	</div>);
}
