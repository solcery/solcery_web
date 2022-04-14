import { apiCall } from './index' 

const MODULE_NAME = 'project';
export const project = {}

project.getAllTemplates = () => {
	return apiCall(MODULE_NAME, 'getAllTemplates')
}
