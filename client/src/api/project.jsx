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

commands.getLogs = {};

commands.migrate = {
	private: true,
	params: {
		objects: {
			required: true
		},
	},
};

export const projectAPI = {
	name: 'project',
	commands,
};
