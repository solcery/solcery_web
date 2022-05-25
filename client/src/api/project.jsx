import { apiCall } from './index' 

const MODULE_NAME = 'project';
export const project = {}

project.getAllTemplates = () => {
	return apiCall(MODULE_NAME, 'getAllTemplates')
}

project.removeAllTemplates = () => {
	return apiCall(MODULE_NAME, 'removeAllTemplates')
}

project.removeAllObjects = () => {
	return apiCall(MODULE_NAME, 'removeAllObjects')
}

project.createManyTemplates = ({ templates }) => {
	return apiCall(MODULE_NAME, 'createManyTemplates', { templates })
}

project.importContent = ({ objects }) => {
	return apiCall(MODULE_NAME, 'importContent', { objects })
}