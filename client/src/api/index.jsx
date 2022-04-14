import { project } from './project';
import { template } from './template';
const API_PATH = '/api';

export const SageAPI = {
	project: project,
	template: template,
};

const appendParams = (value, url, path = []) => {
	if (value instanceof Object) {
		Object.entries(value).forEach(([key, value]) => { 
			appendParams(value, url, path.concat([ key ]))
		})
		return;
	};
	if (!path.length) throw new Error('toUrl error');
	
	let name = path.shift();
	if (path.length > 0) {
		name = name + `[${ path.join('][') }]`
	}
	url.append(name, value)
}

export const apiCall = (moduleName, command, params) => {
	let url = new URLSearchParams();
	url.append('command', command)
	if (params) appendParams(params, url);
	url = `${API_PATH}/${moduleName}?` + url.toString();
	return fetch(url).then((response) => response.json());
}

export const postApiCall = (moduleName, command, params) => {
	let url = new URLSearchParams();
	url.append('command', command);
	params.command = command
	url = `${API_PATH}/${moduleName}?` + url.toString();
	return fetch(url, {
		method: "POST",
		body: JSON.stringify(params),
		headers: {
			'Content-Type': 'application/json'
		},
	}).then((response) => response.json());
}
