import { projectAPI } from './project';
import { userAPI } from './user';
import { templateAPI } from './template';
const API_PATH = '/api/';

const makeRequest = (data) => {
	if (!data) throw new Error('API request error: no data provided for API call!');
	let url = new URLSearchParams();
	url = `${API_PATH}`;
	let request = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(data),
	};
	return fetch(url, request).then(response => {
		return response.json().then(res => {
			return res.data
		})
	});
};

let apiModules = [projectAPI, templateAPI, userAPI];

export class SageAPIConnection {
	session = undefined;
	constructor(projectName) {
		this.projectName = projectName;
		for (let apiModule of apiModules) {
			if (this[apiModule.name]) throw new Error('Error building SageAPIConnection, name conflict!');
			this[apiModule.name] = {};
			for (let [commandName, command] of Object.entries(apiModule.commands)) {
				this[apiModule.name][commandName] = (data = {}) => {
					let requestData = {
						project: this.projectName,
						module: apiModule.name,
						command: commandName,
						params: {},
					};
					if (command.params) {
						for (let param of Object.keys(command.params)) {
							requestData.params[param] = data[param];
						}
					}
					if (command.private) {
						requestData.session = this.session;
					}
					return makeRequest(requestData);
				};
			}
		}
	}
}
