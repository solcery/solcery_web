import { useState } from 'react'
import { useParams } from 'react-router-dom';
import { Button, Input } from 'antd';
import { SageAPI } from '../../api';
import { constructedBrickToBrick } from '../migrators/constructedBrickToBrick';



const { TextArea } = Input;

const migrators = {
	brick: constructedBrickToBrick,
};

export default function TemplateUtils() {
	
	let { templateCode } = useParams();
	const [ payload, setPayload ] = useState()

	const applyPayload = () => {
		console.log(payload)
		let data = JSON.parse(payload);
		let schema = data.schema;
		let result = [];
		for (let obj of data.objects) {
			let object = {}
			for (let field of Object.keys(obj)) {
				if (schema[field]) {
					let fieldname = schema[field].name ?? field;
					let value = obj[field];
					if (schema[field].migrator) {
						value = migrators[schema[field].migrator](value);
					}
					object[fieldname] = value;
				}
			}
			result.push(object)
		}
		console.log(result)
		SageAPI.template.createMany(templateCode, result).then((res) => { 
			console.log(res)
		});
	}
	
	return (
		<>
			<TextArea rows={10} onChange = { e => setPayload(e.target.value) }/>
			<Button onClick={ applyPayload }>Apply</Button>
		</>
	);
}
