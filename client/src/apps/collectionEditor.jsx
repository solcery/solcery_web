import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button } from 'antd';
import { Template } from '../content/template';
import { useProject } from '../contexts/project';
import { useCookies } from 'react-cookie';

const { Column } = Table;

export default function CollectionEditor({ templateCode, moduleName }) {
	const [cookies, setCookie, removeCookie] = useCookies();
	const { sageApi } = useProject();
	const navigate = useNavigate();

	const [objects, setObjects] = useState();
	const [template, setTemplate] = useState();
	const [filteredField, setFilteredField] = useState();
	const [filter, setFilter] = useState({});
	const [sorter, setSorter] = useState({});
	const [ currentPage, setCurrentPage ] = useState(1);
	const [ pageSize, setPageSize ] = useState(10);

	const filterCookieName = `${moduleName}.filter`;
	const sorterCookieName = `${moduleName}.sorter`;

	const setFieldFilter = (fieldCode, filterValue) => {
		if (filterValue === undefined) {
			delete filter[fieldCode];
		} else {
			filter[fieldCode] = filterValue;
		}
		if (Object.keys(filter).length > 0) {
			setCookie(filterCookieName, filter);
		} else {
			removeCookie(filterCookieName);
		}
		setCurrentPage(1);
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
	}, [ moduleName ])

	useEffect(() => {
		setFilter(cookies[filterCookieName] ?? {})
		setSorter(cookies[sorterCookieName] ?? {})
	}, [ moduleName ])

	useEffect(() => {
		load();
	}, [load]);

	const onSorterChange = (sorter) => {
		let result = {}
		if (!Array.isArray(sorter)) {
			sorter = [ sorter ]
		}
		for (let sorterEntry of sorter) {
			result[sorterEntry.field] = sorterEntry.order;
		}
		setSorter(result)
		setCookie(sorterCookieName, result)
	}

	const onTableChange = (pagination, filter, sorter) => {
		onSorterChange(sorter)
	};

	const onPaginationChange = (current, pageSize) => {
		setCurrentPage(current)
		setCookie(`${moduleName}.pagination.current`, current);
		setPageSize(pageSize)
		setCookie(`${moduleName}.pagination.pageSize`, pageSize);
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
		});

	const pagination = {
		current: currentPage,
		pageSize: pageSize,
		onChange: onPaginationChange,
		showSizeChanger: true,
	}

	return (
		<>
			<Table
				key = { `${moduleName}.${templateCode}`}
				dataSource={tableData}
				onRow={(record, rowIndex) => {
					return {
						onDoubleClick: (event) => {
							navigate(`../${moduleName}.${record._id}`);
						},
					};
				}}
				onChange={onTableChange}
				pagination={pagination}
			>
				{Object.values(template.fields).map((field, fieldIndex) => (
					<Column
						filtered={filter[field.code] !== undefined}
						title={field.name + (filter[field.code] !== undefined ? `   [ ${filter[field.code]} ]` : '')}
						key={`${moduleName}.${field.code}`}
						dataIndex={field.code}
						filterDropdown={
							field.type.filter && (
								<field.type.filter.render
									key={field.code + filter[field.code]}
									type={field.type}
									defaultValue={filter[field.code]}
									onChange={(value) => {
										setFieldFilter(field.code, value);
										setFilteredField();
									}}
								/>
							)
						}
						onHeaderCell = {
							() => ({
								onDoubleClick: () => setFilteredField(field.code),
							})
						}
						sorter = { field.type.sorter && {
							compare: (a, b) => field.type.sorter(a.fields[field.code], b.fields[field.code]),
							multiple: -fieldIndex,
						}}
						sortOrder = {
							sorter[field.code]
						}
						
						filtered = { filter[field.code] !== undefined }
						onFilterDropdownVisibleChange={(visible) => setFilteredField(visible ? field.code : undefined)}
						filterDropdownVisible={filteredField === field.code}
						render={(_, object) => (
							<field.type.valueRender 
								defaultValue={object.fields[field.code]} 
								type={field.type} 
								object={object} 
								objectId={object._id}
								templateCode={templateCode}
								fieldCode={field.code}
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
												navigate(`../${moduleName}.${res.insertedId}`);
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
							navigate(`../${moduleName}.${res.insertedId}`);
						}
					});
				}}
			>
				Create
			</Button>
		</>
	);
}
