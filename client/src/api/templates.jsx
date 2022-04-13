import { apiCall } from './index' 

const MODULE_NAME = 'templates';
export const templates = {}

templates.getAll = () => {
	return apiCall(MODULE_NAME, 'getAll')
}
