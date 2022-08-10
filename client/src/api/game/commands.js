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

commands.getContentVersion = {
	params: {
		contentVersion: {
			required: true
		},
	},
};

commands.action = {
	private: true,
	params: {
		gameId: {
			required: true
		},
		action: {
			required: true
		},
	},
}

commands.leaveGame = {
	private: true,
	params: {
		gameId: {
			required: true
		},
	}
}

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


module.exports = commands;
