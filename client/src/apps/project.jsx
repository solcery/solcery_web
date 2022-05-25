import { useState } from "react";
import { Button, Select } from 'antd';
import { useBrickLibrary } from '../contexts/brickLibrary';
import { build } from '../builder';

const { Option } = Select;

export default function Project() {
	const [ target, setTarget ] = useState('web');

	const { brickLibrary } = useBrickLibrary();

	const buildProject = async () => {
		let result = await build({ target, brickLibrary });
		console.log(JSON.stringify(result, undefined, 2));
	}

	return (<>
			<Select defaultValue = 'web' onChange = { setTarget }>
				<Option value='web'>Web</Option>
				<Option value='unity'>Unity</Option>
			</Select>
			<Button onClick={ buildProject }>
				BUILD
			</Button>
		</>);
}
