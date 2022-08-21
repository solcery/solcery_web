const commands = {};

commands.restore = {
	log: true,
	private: true,
	params: {
		src: {
			required: true
		},
	},
};

commands.getContent = {
	params: {
		objects: true,
		templates: true,
	}
};

commands.getLogs = {
	params: {
		query: true,
	}
};

commands.migrate = {
	log: true,
	private: true,
	params: {
		objects: true,
		templates: true,
	},
};

commands.getConfig = {};

commands.setConfig = {
	log: true,
	private: true,
	params: {
		fields: {
			required: true
		},
	},
};

commands.release = {
	private: true,
	params: {
		gameProjectId: { required: true },
		contentWeb: { required: true },
		contentUnity: { required: true },
		contentMeta: { required: true }
	}
}

commands.sync = {
	private: true,
	log: true,
	params: {}
};

module.exports = commands;
