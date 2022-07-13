const commands = {};

commands.getAllObjects = {
	params: {
		template: {
			required: true,
		},
	},
};

commands.getSchema = {
	params: {
		template: {
			required: true,
		},
	},
};

commands.setSchema = {
	private: true,
	params: {
		template: {
			required: true,
		},
		schema: {
			required: true,
		},
	},
};

commands.getObjectById = {
	params: {
		template: {
			required: true,
		},
		objectId: {
			required: true,
		},
	},
};

commands.updateObjectById = {
	private: true,
	params: {
		template: {
			required: true,
		},
		objectId: {
			required: true,
		},
		fields: {
			required: true,
		},
	},
};

commands.createObject = {
	private: true,
	params: {
		template: {
			required: true,
		},
	},
};

commands.cloneObject = {
	private: true,
	params: {
		template: {
			required: true,
		},
		objectId: {
			required: true,
		},
	},
};

commands.removeObjectById = {
	private: true,
	params: {
		template: {
			required: true,
		},
		objectId: {
			required: true,
		},
	},
};

export const templateAPI = {
	name: 'template',
	commands,
};
