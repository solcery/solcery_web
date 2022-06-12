import { useState } from 'react';
import { Button } from 'antd';

export const DefaultFilterRender = ({ defaultValue, onChange, type }) => {
	const [value, setValue] = useState(defaultValue);
	return (
		<div>
			<type.valueRender
				type={type}
				defaultValue={defaultValue}
				onChange={setValue}
				onPressEnter={() => onChange(value)}
			/>
			<Button onClick={() => onChange(value)}>APPLY</Button>
			<Button onClick={() => onChange(undefined)}>CLEAR</Button>
		</div>
	);
};
