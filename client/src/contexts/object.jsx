import React, { useContext, useEffect, useState, useCallback } from 'react';
import { useProject } from './project';
import { useTemplate } from './template';
import { useParams, Outlet } from 'react-router-dom';
import { SageAPIConnection } from '../api';
import { BrickLibraryProvider } from './brickLibrary';
import { TopMenu } from '../components/TopMenu';
import { UserProvider } from './user';
import { insertTable } from '../utils';

const ObjectContext = React.createContext(undefined);

export function ObjectProvider(props) {
	let { objectId } = useParams();
	let { sageApi } = useProject();
	let { template } = useTemplate();
	let [ object, setObject ] = useState();
	const [ initial, setInitial ] = useState(undefined);
	const [ fieldStatus, setFieldStatus ] = useState(undefined);
	const [ revision, setRevision ] = useState(1)

	useEffect(() => {
		if (!template) return;
		sageApi.template.getObjectById({ template: template.code, objectId }).then(setObject);
	}, [ template, sageApi, objectId ]);


	useEffect(() => {
		if (!object || !template) return;
		let init = {}
		let status = {}
		for (let field of Object.values(template.fields)) {
			init[field.code] = field.type.clone(object.fields[field.code])
			status[field.code] = 'old';
		}
		setInitial(init);
		setFieldStatus(status);
	}, [ object, template ])

	const setField = (value, fieldPath) => {
		let fieldCode = fieldPath[0];
		let field = template.fields[fieldCode]
		insertTable(object.fields, value, ...fieldPath);
		if (field.type.eq(initial[fieldCode], object.fields[fieldCode])) {
			fieldStatus[fieldCode] = 'old';
			setRevision(revision + 1)
		} else {
			let oldStatus = fieldStatus[fieldCode];
			fieldStatus[fieldCode] = 'changed';
			// let validator = template.fields[fieldCode].type.validateField
			// if (validator) {
			// 	if (!validator(value)) status = 'error';
			// }
			if (oldStatus === 'old') {
				setRevision(revision + 1);
			}
		}
	};

	const saveObject = async () => {
		let saveData = {}
		for (let [ fieldCode, value ] of Object.entries(object.fields)) {
			// if (status === 'error') {
			// 	return Promise.reject({ 
			// 		error: 'invalidField',
			// 		fieldCode: fieldCode,
			// 	});
			// }
			// if (status === 'changed') {
				saveData[fieldCode] = value;
			// }
		}
		if (Object.keys(saveData).length === 0) {
			return Promise.reject({ 
				error: 'emptySaveData',
			});
		}
		let res = await sageApi.template.updateObjectById({
			template: template.code,
			objectId: objectId,
			fields: saveData,
		})
		if (res.modifiedCount) {
			return Promise.resolve()
		};
	}
	return (
		<ObjectContext.Provider value={{ object, setField, saveObject, fieldStatus }}>
			<Outlet/>
		</ObjectContext.Provider>
	);
}

export function useObject() {
	const { object, setField, saveObject, fieldStatus } = useContext(ObjectContext);
	return { object, setField, saveObject, fieldStatus };
}
