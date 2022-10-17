import { notify } from '../components/notification';
import { api } from '../config';
const API_PATH = api.url;

const makeRequest = (url, data) => {
	if (!data) throw new Error('API request error: no data provided for API call!');
	let request = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Origin': 'http://localhost'
		},
		body: JSON.stringify(data),
	};
	return fetch(url, request).then((response) => {
		return response.json().then((res) => {
			if (res.status) {
				return res.data; // TODO: status, error
			} else {
				notify({
					message: 'Server error',
					description: res.error,
					type: 'error',
				});
			}
		}, (err) => {
			notify({
				message: 'Server error',
				description: 'No response from server',
				type: 'error',
			});
		});
	});
};

export class SolceryAPI {
	commands = {};

	constructor(config) {
		if (!config) throw new Error('Error building SolceryAPIConnection, no config provided!');
		if (!config.url) throw new Error('Error building SolceryAPIConnection, no url provided!');
		this.config = config;
	}

	async connect() {
		let apiInfo = await makeRequest(this.config.url, {
			command: 'help'
		})
		for (let [command, commandData] of (Object.entries(apiInfo.commands))) {
			this.commands[command] = commandData;
		}
	}

	static async create(config) {
    	let api = new SolceryAPI(config);
    	await api.connect();
    	return api;
 	}

 	call(commandName, params = {}) {
 		let requestData = {
 			command: commandName,
 		}
 		let commandData = this.commands[commandName];
 		if (!commandData) throw new Error(`API Error: No command '${commandName}'`);
 		if (commandData.params) {
			for (let [paramName, param] of Object.entries(commandData.params)) {
				if (param.required && params[paramName] === undefined) {
					throw new Error(`SageAPI error: Missing param '${paramName}' for command '${commandName}'!`);
				}
				requestData[paramName] = params[paramName];
			}
		}
		return makeRequest(this.config.url, requestData);
 	}
}
