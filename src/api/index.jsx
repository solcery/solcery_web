import { notif } from '../components/notification';

const makeRequest = (url, data) => {
	if (!data) throw new Error('API request error: no data provided for API call!');
	let request = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Origin': 'http://create.solcery.xyz',
		},
		body: JSON.stringify(data),
	};
	return fetch(url, request).then((response) => {
		return response.json().then((res) => {
			if (res.status) {
				return res.data; // TODO: status, error
			} else {
				notif.error('API error', res.data);
			}
		}, (err) => {
			notif.error('API error', 'No response from server');
		});
	});
};

export class SolceryAPI {
	commands = {};

	constructor(config) {
		if (!config) throw new Error('Error building SolceryAPI, no config provided!');
		if (!config.url) throw new Error('Error building SolceryAPI, no url provided!');
		this.config = config;
		this.accessParams = {};
	}

	async connect() {
		let apiInfo = await makeRequest(this.config.url, {
			command: 'help'
		})
		for (let [command, commandData] of (Object.entries(apiInfo))) {
			this.commands[command] = commandData;
		}
		return this;
	}

	setAccessParams(params) {
		this.accessParams = params;
	}


	async createAccessor() {
		let apiPaths = await makeRequest(this.config.url, {
			command: 'help',
			paths: true,
		});
		const api = this;
		const handlePath = (currentPath, path = []) => {
			const currentName = path[path.length - 1];
			const pathProto = {
				params: currentPath.params,
				accessParams: currentPath.access,
				path: [...path],
				setAccessParam: function(param, value) {
					if (!this.accessParams[param]) throw `No access param ${param}`;
					if (!this.access) this.access = {};
					this.access[param] = value;
				}
			}
			if (currentPath.commands) {
				for (let [ commandName, commandData ] of Object.entries(currentPath.commands)) {
					const requireAccess = !commandData.public;
					pathProto[commandName] = function(param) {
						let commandCallParams = Object.assign({}, this.params);
						if (commandData.params) {
							let paramNames = Object.keys(commandData.params);
							if (paramNames.length === 1) {
								let paramName = paramNames[0];
								commandCallParams[paramName] = param;
							} else {
								Object.assign(commandCallParams, param);
							}
						}
						let fullName = [...this.path, commandName].join('.');
						if (!commandData.public) {
							Object.assign(commandCallParams, this.access);
						}
						return api.call(fullName, commandCallParams);
					};
				}
			}
			for (let [propName, propData] of Object.entries(currentPath)) {
				if (propName === 'commands') continue;
				if (propName === 'params') continue;
				if (propName === 'access') continue;
				path.push(propName)
				let layerConstructor = handlePath(propData, path);
				pathProto[propName] = function (...args) {
					let next = layerConstructor(...args);
					Object.assign(next.params, this.params);
					if (this.access) {
						Object.assign(next.params, this.access);
					}
					return next
				}
				path.pop();
			}
			return (param) => {
				let ctx = Object.create(pathProto);
				ctx.params = {};
				ctx._name = currentName

				if (pathProto.params) { //TODO: order
					let paramNames = Object.keys(pathProto.params);
					if (paramNames.length === 1) {
						let paramName = paramNames[0];
						ctx.params[paramName] = param;
					} else {
						Object.assign(ctx.params, param);
					}
				}
				return ctx;
			}
		}
		return handlePath(apiPaths)();
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
