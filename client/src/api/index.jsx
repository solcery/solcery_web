import { project } from './project';
import { template } from './template';
const API_PATH = '/api';

export const SageAPI = {
	project: project,
	template: template,
	projectName: 'none'
};

SageAPI.connect = function(projectName) {
	this.projectName = projectName; // TODO: proper check and connect	
}

export const apiCall = (moduleName, command, data = {}) => {
	data.project = SageAPI.projectName; //TODO: rework API
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
