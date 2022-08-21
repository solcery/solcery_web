const commands = {};

// Returns basic game info (Name, string version, supported NFTs etc)
commands.getGameInfo = {};

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

// Returns content version. Latest if not specified.
commands.getContentVersion = {
	params: {
		contentVersion: true,
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
