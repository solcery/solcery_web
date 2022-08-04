const apiConfig = {
	modules: [
		{
			name: 'project',
			path: './project'
		},
		{
			name: 'user',
			path: './user'
		},
		{
			name: 'template',
			path: './template'
		}
	],
	auth: './user/auth',
}

module.exports = apiConfig;
