const commands = {};

commands.getAllTemplates = {};

commands.restore = {
	log: true,
	private: true,
	params: {
		src: {
			required: true
		},
	},
};

commands.dump = {};

commands.getContent = {};

commands.migrate = {
	log: true,
	private: true,
	params: {
		objects: {
			required: true
		},
	},
};

module.exports = commands;
