import { notify } from '../components/notification';
const API_PATH = 'path';

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
					message: 'API error',
					description: res.data,
					type: 'error',
				});
			}
		}, (err) => {
			notify({
				message: 'API error',
				description: 'No response from server',
				type: 'error',
			});
		});
	});
};

export class SolceryAPIConnection {

	setSession(session) {
		this.session = session;
	}

	constructor(projectId, config) {
		this.projectId = projectId;
		if (!config) {
			throw new Error('Error building SageAPIConnection, no config provided!');
		}
		if (config.auth) {
			this.auth = require(`${config.auth}`);
		}
		for (let moduleName of config.modules) {
			let commands = require(`./${moduleName}/commands`);
			if (this[moduleName]) {
				throw new Error('Error building SageAPIConnection, name conflict!');
			}
			this[moduleName] = {};
			for (let [commandName, command] of Object.entries(commands)) {
				this[moduleName][commandName] = (data = {}) => {
					let requestData = {
						project: this.projectId,
						module: moduleName,
						command: commandName,
						params: {},
					};
					if (command.params) {
						for (let [paramName, param] of Object.entries(command.params)) {
							if (param.required && data[paramName] === undefined) {
								throw new Error(`SageAPI error: Missing param '${paramName}' for command '${commandName}'!`);
							}
							requestData.params[paramName] = data[paramName];
						}
					}
					if (command.private) {
						if (!this.auth) {
							throw new Error(`SageAPI error: Attempt to execute private command without auth provided!`);
						}
						this.auth(this.session, requestData);
					}
					return makeRequest(API_PATH, requestData);
				};
			}
		}
	}
}

export class SolceryAPI {
	commands = {};

	constructor(config) {
		if (!config) throw new Error('Error building SolceryAPIConnection, no config provided!');
		if (!config.url) throw new Error('Error building SolceryAPIConnection, no url provided!');
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
		engine.template('some_template').object('object_id').update({ name: 'New name' })
		// session.engine('polygon').getContent({ templates: true, objects: true });
		// this.test().engine('test').getConfig();
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
