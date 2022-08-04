const commands = {}

commands.start = {
	private: true,
	params: {
		project: {
			required: true
		},
		version : true,
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
