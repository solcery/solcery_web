const commands = {};


commands.startNewGame = {
	private: true,
	params: {
		nfts: true,
		contentVersion: true,
	},
};

commands.getPlayerOngoingGame = {
	private: true,
	params: {},
};

commands.getVersion = {
	params: {
		contentVersion: {
			required: true
		},
	},
};

// commands.get = {
// 	params: {
// 		project: {
// 			required: true
// 		},
// 		game: {
// 			required: true
// 		},
// 	},
// };

// commands.leave = {
// 	private: true,
// 	params: {
// 		project: {
// 			required: true
// 		},
// 		game: {
// 			required: true
// 		},
// 	}
// }

// commands.action = {
// 	params: {
// 		project: {
// 			required: true
// 		},
// 		game: {
// 			required: true
// 		},
// 	},
// }

module.exports = commands;
