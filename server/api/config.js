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
		{
			name: 'forge',
			path: './forge',
		},

	],
	auth: './player/auth',
}

module.exports = apiConfig;
