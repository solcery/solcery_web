import { useState, useEffect } from 'react';
import { useProject } from '../../../contexts/project';
import { SolceryAPIConnection } from '../../../api';
import { Select } from 'antd';
const { Option } = Select;

const filterOption = (inputValue, option) => {
	return option.toLowerCase().includes(inputValue.toLowerCase());
}

export const ValueRender = (props) => {
	const [objects, setObjects] = useState(undefined);
	const [ api, setApi ] = useState();
	const { sageApi, projectId } = useProject();

	useEffect(() => {
		if (props.type.project) {
			setApi(new SolceryAPIConnection(props.type.project, { modules: [ 'template' ]}));
			return;
		}
		setApi(sageApi)
	}, [ sageApi, props.type ]);

	const onChange = (newValue) => {
		props.onChange && props.onChange(newValue);
	};

	useEffect(() => {
		if (!api) return;
		api.template.getAllObjects({ template: props.type.templateCode }).then((res) => {
			setObjects(
				res
					.filter((object) => object.fields.name !== undefined)
					.map((object) => {
						return {
							id: object._id,
							title: object.fields.name,
						};
					})
			);
		});
	}, [props.type, api]);

	if (!props.onChange) {
		if (!props.defaultValue) return <>None</>;
		if (!objects) return <>Loading ...</>;
		let obj = objects.find((obj) => obj.id === props.defaultValue);
		if (obj) {
			if (props.isFilter) {
				return <>{obj.title}</>;
			}
			return <a href={`/${props.type.project ?? projectId}/template/${props.type.templateCode}/${props.defaultValue}`}>{obj.title}</a>; //TODO
		} else {
			return <>{`Missing object ${props.defaultValue}`}</>;
		}
	}

	if (!objects) return <>Loading ...</>;
	return (
		<Select
			showSearch
			style={{
				width: 200,
			}}
			dropdownMatchSelectWidth={false}
			onChange={onChange}
			defaultValue={props.defaultValue}
			filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
			filterSort={(optionA, optionB) => optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())}
		>
			<Option value={undefined}>None</Option>
			{objects.map(obj => (
				<Option key={obj.id} value={obj.id}>
					{obj.title}
				</Option>
			))}
		</Select>
	);
};
