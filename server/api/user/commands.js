const commands = {};

commands.login = {
	log: true,
	params: {
		login: {
			required: true,
		},
		password: {
			required: true,
		},
	},
};

commands.getSession = {
	params: {
		session: {
			required: true,
		},
	},
};

commands.getById = {
	params: {
		id: {
			required: true,
		},
	},
};

commands.create = {
	log: true,
	private: true,
	params: {
		login: {
			required: true,
		},
		password: {
			required: true,
		},
	},
};

commands.update = {
	log: true,
	private: true,
	params: {
		id: {
			required: true,
		},
		fields: {
			required: true,
		},
	},
};

module.exports = commands;