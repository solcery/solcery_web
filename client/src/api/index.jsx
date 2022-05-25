import { project } from './project';
import { template } from './template';
const API_PATH = '/api';

export const SageAPI = {
	project: project,
	template: template,
};

export const apiCall = (moduleName, command, data) => {
	let url = new URLSearchParams();
	url = `${API_PATH}/${moduleName}`;
	let request = {
	    method: 'POST',
	    headers: {
	      'Content-Type': 'application/json'
	    },
	    body: JSON.stringify({ command, data })
	};
	return fetch(url, request).then((response) => response.json());
}
