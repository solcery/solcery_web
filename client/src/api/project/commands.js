const commands = {};

commands.restore = {
	log: true,
	private: true,
	params: {
		src: {
			required: true,
		},
	},
};

commands.getContent = {
	params: {
		objects: true,
		templates: true,
	},
};

commands.getLogs = {
	params: {
		query: true,
	},
};

commands.migrate = {
	log: true,
	private: true,
	params: {
		objects: {
			required: true,
		},
	},
};

commands.release = {
	private: true,
	params: {
		contentWeb: { required: true },
		contentUnity: { required: true }
	}
}

module.exports = commands;
