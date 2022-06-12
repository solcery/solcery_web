const commands = {};

commands.getAllTemplates = {
	name: 'getAllTemplates',
};

commands.restore = {
	name: 'restore',
	params: {
		src: true,
	},
};

commands.dump = {
	name: 'dump',
};

commands.getContent = {
	name: 'getContent',
};

commands.migrate = {
	name: 'migrate',
	params: {
		objects: true,
	},
};

export const projectAPI = {
	name: 'project',
	commands,
};
