const apiConfig = {
	modules: [
		{
			name: 'game',
			path: './game',
		},
		{
			name: 'template',
			path: './template',
		},

	],
	auth: './player/auth',
}

module.exports = apiConfig;
