const commands = {};

commands.getAllTemplates = {};

commands.restore = {
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
	private: true,
	params: {
		objects: {
			required: true
		},
	},
};

module.exports = commands;
