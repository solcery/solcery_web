const commands = {};

commands.start = {
	private: true,
	params: {
		game: {
			required: true
		},
	},
};

commands.get = {
	private: true,
	params: {},
};


commands.action = {
	private: true,
	params: {
		game: {
			required: true
		},
	},
}

module.exports = commands;
