const apiConfig = {
	modules: [
		{
			name: 'project',
			path: './project',
		},
		{
			name: 'user',
			path: './user',
		},
		{
			name: 'template',
			path: './template',
		},
		{
			name: 'game',
			path: './game',
		},
	],
	auth: './player/auth',
}

module.exports = apiConfig;
