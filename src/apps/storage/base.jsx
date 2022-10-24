import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Pagination } from 'antd';
import { Template } from '../../content/template';
import { useProject } from '../../contexts/project';
import { useContent } from '../../contexts/content';
import { useHotkey } from '../../contexts/hotkey';
import { useUser } from '../../contexts/user';
import { useCookies } from 'react-cookie';
import { FilterOutlined } from '@ant-design/icons';
import { HeaderCell } from './components/header';
import { ActionsBar } from './components/actionsBar';
import Document from './../../content/document';

const { Column } = Table;

export default function StorageViewerBase({ template, objects, fields, onEnableEditMode }) {
	const [cookies, setCookie, removeCookie] = useCookies();
	const { engine } = useProject();
	const { updateContent } = useContent();
	const navigate = useNavigate();

	const [filter, setFilter] = useState();
	const [sorter, setSorter] = useState();
	const [currentPage, setCurrentPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);
	const { doubleClickToOpenObject } = useUser();

	const filterCookieName = `${template.code}.filter`;
	const sorterCookieName = `${template.code}.sorter`;

	useEffect(() => {
		if (cookies[`${template.code}.pagination.current`])
			setCurrentPage(parseInt(cookies[`${template.code}.pagination.current`]));
		if (cookies[`${template.code}.pagination.pageSize`])
			setPageSize(parseInt(cookies[`${template.code}.pagination.pageSize`]));
		setFilter(Object.assign({}, cookies[filterCookieName]));
		setSorter(Object.assign({}, cookies[sorterCookieName]));
	}, [ template.code, cookies, filterCookieName, sorterCookieName ]);


	const setFieldFilter = (fieldCode, filterValue) => {
		if (filterValue === undefined) {
			delete filter[fieldCode];
		} else {
			filter[fieldCode] = filterValue;
		}
		if (Object.keys(filter).length > 0) {
			setCookie(filterCookieName, filter, { path: '/' });
		} else {
			removeCookie(filterCookieName, { path: '/' });
		}
		setCurrentPage(1);
		setCookie(`${template.code}.pagination.current`, 1, { path: '/' });
		setFilter(Object.assign({}, filter));
	};

	const setFieldSorter = (fieldCode, value) => {
		sorter[fieldCode] = value;
		setCookie(sorterCookieName, sorter, { path: '/' });
		setSorter(JSON.parse(JSON.stringify(sorter)));
	};

	if (!template || !objects || !filter || !sorter) return <>NO DATA</>;

	let templateObjects = objects
		.filter(object => {
			for (let field of Object.values(template.fields)) {
				if (field.hidden) continue;
				if (filter[field.code] === undefined) continue;
				if (!field.type.filter) continue;
				if (!field.type.filter.eq(object.fields[field.code], filter[field.code])) return false;
			}
			return true;
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

	const startIndex = pageSize * (currentPage - 1);
	const endIndex = Math.min(startIndex + pageSize, templateObjects.length);
	const tableData = templateObjects.slice(startIndex, endIndex).map(obj => ({
		id: obj._id,
		key: obj._id,
		fields: obj.fields,
	}));

	let columns = [];
	for (let field of fields) {
		columns.push({
			key: `${template.code}.${field.code}`,
			title: <HeaderCell
				key={`${template.code}.${field.code}.header`}
				field={field}
				sorter={{
					value: sorter[field.code],
					onChange: (value) => setFieldSorter(field.code, value)
				}}
				filter={{
					value: filter[field.code],
					onChange: (value) => setFieldFilter(field.code, value)
				}}
			/>,
			render: (_, object) => <field.type.valueRender
				defaultValue={object.fields[field.code]}
				type={field.type}
				path={{
					moduleName: template.code,
					objectId: object.id,
					templateCode: template.code,
					fieldPath: [ field.code ],
				}}
			/>	
		})
	}

	columns.push({
		title: 'Actions',
		key: 'actions',
		render: (_, object) => <ActionsBar 
			object={object}
			templateCode={template.code}
			onAction={updateContent}
		/>
	})

	var pagination = {
		current: currentPage,
		pageSize: pageSize,
		onChange: (current, pageSize) => {
			setCurrentPage(current);
			setCookie(`${template.code}.pagination.current`, current, { path: '/' });
			setPageSize(pageSize);
			setCookie(`${template.code}.pagination.pageSize`, pageSize, { path: '/' });
		},
		showSizeChanger: true,
		total: templateObjects.length,
	};

	return (<>
		<Button onClick={() => onEnableEditMode(tableData)}>EDIT MODE</Button>
		<Table
			key={`storage.${template.code}`}
			dataSource={tableData}
			pagination={false}
			columns={columns}
			onRow={
				doubleClickToOpenObject ?
				function (record, rowIndex) {
					return { onDoubleClick: (event) => navigate(`${record.id}`) };
				} : undefined
			}
		/>
		<Button
			onClick={() => {
				engine.template(template.code).createObject().then(insertedId => {
					navigate(`${insertedId}`);
				});
			}}
		>
			NEW OBJECT
		</Button>
		<Pagination style={{ position: 'absolute', right: '30px' }} {...pagination}/>
	</>);
}
