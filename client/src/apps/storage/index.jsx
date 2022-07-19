import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button } from 'antd';
import { Template } from '../../content/template';
import { useProject } from '../../contexts/project';
import { useUser } from '../../contexts/user';
import { notify } from '../../components/notification';
import { useCookies } from 'react-cookie';
import { FilterOutlined } from '@ant-design/icons';

const { Column } = Table;

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

	const onKeyDown = (event) => {
		if (event.keyCode === 27) {
			setOpened(false);
			setInputValue(filterValue);
		}
	};

	useEffect(() => {
		document.addEventListener('keydown', onKeyDown);
		return () => {
			document.removeEventListener('keydown', onKeyDown);
		};
	});

	return (
		<>
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
		</>
	);
};

const HeaderCell = (props) => {
	return (
		<div>
			<div style={{ wordWrap: 'break-word', fontSize: '16px', height: '30px', marginBottom: '10px' }}>
				<p>{props.field.name}</p>
			</div>
			<div style={{ height: '30px', marginTop: '10px', display: 'flex' }}>
				{props.field.type.sorter && (
					<HeaderSorter onChange={props.onSorterChange} value={props.sorter} field={props.field} />
				)}
				{props.field.type.filter && (
					<HeaderFilter value={props.filter} field={props.field} onChange={props.onFilterChange} />
				)}
			</div>
		</div>
	);
};

export default function StorageViewer({ templateCode, moduleName }) {
	const [cookies, setCookie, removeCookie] = useCookies();
	const { sageApi } = useProject();
	const navigate = useNavigate();

	const [objects, setObjects] = useState();
	const [template, setTemplate] = useState();
	const [filter, setFilter] = useState({});
	const [sorter, setSorter] = useState({});
	const [currentPage, setCurrentPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);
	const { fastCopy, doubleClickToOpenObject } = useUser();

	const filterCookieName = `${moduleName}.filter`;
	const sorterCookieName = `${moduleName}.sorter`;

	const setFieldFilter = (fieldCode, filterValue) => {
		if (filterValue === undefined) {
			delete filter[fieldCode];
		} else {
			filter[fieldCode] = filterValue;
		}
		if (Object.keys(filter).length > 0) {
			setCookie(filterCookieName, filter, { path: '/' });
		} else {
			removeCookie(filterCookieName);
		}
		setCurrentPage(1);
		setCookie(`${moduleName}.pagination.current`, 1, { path: '/' });
		setFilter(Object.assign({}, filter));
	};

	const load = useCallback(() => {
		sageApi.template.getAllObjects({ template: templateCode }).then(setObjects);
		sageApi.template.getSchema({ template: templateCode }).then((data) => setTemplate(new Template(data)));
	}, [templateCode, sageApi.template]);

	useEffect(() => {
		if (cookies[`${moduleName}.pagination.current`])
			setCurrentPage(parseInt(cookies[`${moduleName}.pagination.current`]));
		if (cookies[`${moduleName}.pagination.pageSize`])
			setPageSize(parseInt(cookies[`${moduleName}.pagination.pageSize`]));
	}, [moduleName, cookies]);

	useEffect(() => {
		setFilter(cookies[filterCookieName] ?? {});
		setSorter(cookies[sorterCookieName] ?? {});
	}, [moduleName, cookies, filterCookieName, sorterCookieName]);

	useEffect(() => {
		load();
	}, [load]);

	const setFieldSorter = (fieldCode, value) => {
		sorter[fieldCode] = value;
		setCookie(sorterCookieName, sorter, { path: '/' });
		setSorter(JSON.parse(JSON.stringify(sorter)));
	};

	const onPaginationChange = (current, pageSize) => {
		setCurrentPage(current);
		setCookie(`${moduleName}.pagination.current`, current, { path: '/' });
		setPageSize(pageSize);
		setCookie(`${moduleName}.pagination.pageSize`, pageSize, { path: '/' });
	};

	if (!template || !objects || !filter) return <>NO DATA</>;
	let tableData = objects
		.filter((object) => {
			for (let field of Object.values(template.fields)) {
				let filterValue = filter[field.code];
				if (filterValue === undefined) continue;
				let fieldFilter = field.type.filter;
				if (!fieldFilter) continue;
				if (!field.type.filter.eq(object.fields[field.code], filterValue)) return false;
			}
			return true;
		})
		.map((object) => {
			return {
				_id: object._id,
				key: object._id,
				fields: Object.assign({}, object.fields),
			};
		})
		.sort((a, b) => {
			for (let [fieldCode, sortOrder] of Object.entries(sorter)) {
				if (fieldCode !== 'creationTime') {
					//TODO:
					let fieldSorter = template.fields[fieldCode].type.sorter;
					let res = fieldSorter(a.fields[fieldCode], b.fields[fieldCode]) * sortOrder;
					if (res !== 0) {
						return res;
					}
				}
			}
			let timeSorter = template.fields.creationTime.type.sorter;
			if (timeSorter) {
				return timeSorter(a.fields.creationTime, b.fields.creationTime);
			}
			return 0;
		});

	const pagination = {
		current: currentPage,
		pageSize: pageSize,
		onChange: onPaginationChange,
		showSizeChanger: true,
	};
	return (
		<>
			<Table
				key={`${moduleName}.${templateCode}`}
				dataSource={tableData}
				pagination={pagination}
				onRow={
					doubleClickToOpenObject ?
					function (record, rowIndex) {
						return { onDoubleClick: (event) => navigate(`${record._id}`) };
					} : undefined
				}
			>
				{Object.values(template.fields)
					.filter((field) => !field.hidden)
					.map((field, fieldIndex) => (
						<Column
							key={`${template.code}.${field.code}`}
							dataIndex={field.code}
							title={
								<HeaderCell
									key={`${moduleName}.${field.code}.header`}
									field={field}
									sorter={sorter[field.code]}
									onSorterChange={(value) => setFieldSorter(field.code, value)}
									filter={filter[field.code]}
									onFilterChange={(value) => setFieldFilter(field.code, value)}
								/>
							}
							render={(_, object) => (
								<field.type.valueRender
									defaultValue={object.fields[field.code]}
									type={field.type}
									path={{
										moduleName,
										templateCode,
										objectId: object._id,
										fieldPath: [field.code],
									}}
								/>
							)}
						/>
					))}
				<Column
					title="Actions"
					key="actions"
					render={(_, object) => (
						<div key={'actions.' + object._id}>
							<Button
								key={'copy.' + object.id}
								onClick={() => {
									sageApi.template
										.cloneObject({
											template: templateCode,
											objectId: object._id,
										})
										.then((res) => {
											if (res.insertedId) {
												if (fastCopy) {
													navigate(`${res.insertedId}`);
												} else {
													notify({
														message: 'Object created',
														color: '#DDFFDD',
														description: res.insertedId,
														url: `${moduleName}.${res.insertedId}`,
													});
													load();
												}
											}
										});
								}}
							>
								Copy
							</Button>
							<Button
								key={'delete.' + object._id}
								onClick={() => {
									if (
										window.confirm('Deleting object [' + object.id + '] ' + object.fields.title + '. Are you sure?')
									) {
										sageApi.template
											.removeObjectById({
												template: templateCode,
												objectId: object._id,
											})
											.then((res) => {
												if (res.deletedCount) {
													notify({
														message: 'Object deleted',
														color: '#DDFFDD',
														description: object._id,
													});
													load();
												}
											});
									}
								}}
							>
								Delete
							</Button>
						</div>
					)}
				/>
			</Table>
			<Button
				onClick={() => {
					sageApi.template.createObject({ template: templateCode }).then((res) => {
						if (res.insertedId) {
							navigate(`${res.insertedId}`);
						}
					});
				}}
			>
				Create
			</Button>
		</>
	);
}
