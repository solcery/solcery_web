import React, { useEffect, useState } from 'react';
import { Table, Button } from 'antd';
import { useHotkey } from '../../../contexts/hotkey';
import { FilterOutlined } from '@ant-design/icons';

const { Column } = Table;

const HeaderField = (props) => {
	const [order, setOrder] = useState(props.value);

	useEffect(() => {
		setOrder(props.value);
	}, [props, props.value]);

	const toggle = (fieldCode) => {
		let newOrder;
		switch (order) {
			case 1:
				newOrder = -1;
				break;
			case -1:
				newOrder = undefined;
				break;
			default:
				newOrder = 1;
				break;
		}
		setOrder(newOrder);
		props.onChange && props.onChange(newOrder);
	};

	let sortName = 'Sort';
	if (order === 1) sortName = 'Sort: A -> Z';
	if (order === -1) sortName = 'Sort: Z -> A';

	return (
		<Button
			style={{
				fontColor: order ? 'white' : 'dimgray',
				color: order ? undefined : 'dimgray',
				backgroundColor: order ? '#104055' : undefined,
			}}
			onClick={toggle}
		>
			{sortName}
		</Button>
	);
};

const HeaderSorter = (props) => {
	const [order, setOrder] = useState(props.value);

	useEffect(() => {
		setOrder(props.value);
	}, [props, props.value]);

	const toggle = (fieldCode) => {
		let newOrder;
		switch (order) {
			case 1:
				newOrder = -1;
				break;
			case -1:
				newOrder = undefined;
				break;
			default:
				newOrder = 1;
				break;
		}
		setOrder(newOrder);
		props.onChange && props.onChange(newOrder);
	};

	let sortName = 'Sort';
	if (order === 1) sortName = 'Sort: A -> Z';
	if (order === -1) sortName = 'Sort: Z -> A';

	return (
		<Button
			style={{
				fontColor: order ? 'white' : 'dimgray',
				color: order ? undefined : 'dimgray',
				backgroundColor: order ? '#104055' : undefined,
			}}
			onClick={toggle}
		>
			{sortName}
		</Button>
	);
};

const HeaderFilter = (props) => {
	const [opened, setOpened] = useState(false);
	const [filterValue, setFilterValue] = useState(props.value);
	const [inputValue, setInputValue] = useState(props.value);
	let filtered = filterValue !== undefined;

	const apply = () => {
		setOpened(false);
		setFilterValue(inputValue);
		props.onChange(inputValue);
	};

	const clear = () => {
		setInputValue(undefined);
		setFilterValue(undefined);
		props.onChange(undefined);
		setOpened(false);
	};

	useHotkey('Escape', () => {
		setOpened(false);
		setInputValue(filterValue);
	})

	return (<>
		{!opened && (
			<Button
				style={{
					color: filtered ? undefined : 'dimgray',
					fontColor: filtered ? 'white' : 'dimgray',
					backgroundColor: filtered ? '#104055' : undefined,
				}}
				onClick={() => setOpened(true)}
			>
				{filtered ? (
					<div style={{ display: 'flex' }}>
						<props.field.type.filter.render type={props.field.type} defaultValue={filterValue} />
						<FilterOutlined style={{ marginLeft: '8px', marginTop: 'auto', marginBottom: 'auto' }} />
					</div>
				) : (
					<div>
						Filter
						<FilterOutlined style={{ marginLeft: '8px', marginTop: '4px' }} />
					</div>
				)}
			</Button>
		)}
		{opened && (
			<div
				style={{
					width: '300px',
					display: 'flex',
				}}
			>
				<props.field.type.filter.render
					key={props.field.code + props.value}
					type={props.field.type}
					defaultValue={props.value}
					onChange={setInputValue}
					onPressEnter={apply}
				/>
				<Button onClick={apply}>APPLY</Button>
				<Button onClick={clear}>CLEAR</Button>
			</div>
		)}
	</>);
};

export const HeaderCell = (props) => {
	let field = props.field;
	let doc = props.doc;
	return (
		<div>
			<div style={{ wordWrap: 'break-word', fontSize: '16px', height: '30px', marginBottom: '10px' }}>
				<p>{field.name}</p>
			</div>
			{(props.sorter || props.filter) && <div style={{ height: '30px', marginTop: '10px', display: 'flex' }}>
				{props.sorter && (
					<HeaderSorter value={props.sorter.value} onChange={props.sorter.onChange} field={field} />
				)}

				{props.filter && (
					<HeaderFilter value={props.filter.value} onChange={props.filter.onChange} field={field}/>
				)}
			</div>}
			{doc && !field.readonly && <div>
				<field.type.valueRender
					defaultValue={doc.fields[field.code]}
					type={field.type}
					path={{
						fieldPath: [field.code],
					}}
					onChange={value => doc.setField(value, [ field.code ])}
				/>
				<Button onClick={() => props.onHeaderFieldApplied(field.code)}>Apply</Button>
			</div>}
		</div>
	);
};

