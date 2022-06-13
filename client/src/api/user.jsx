const commands = {};

commands.login = {
	name: 'login',
	params: {
		login: true,
		password: true,
	},
};

commands.getSession = {
	name: 'getSession',
	params: {
		session: true,
	},
};

commands.create = {
	name: 'create',
	params: {
		login: true,
		password: true,
	},
};

commands.update = {
	name: 'update',
	params: {
		id: true,
		fields: true, // List of updated fields
	},
};

export const userAPI = {
	name: 'user',
	commands,
};
