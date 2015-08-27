module.exports = {
	apiVersion: 5.37,
	authUrl: 'https://oauth.vk.com/authorize',
	tokenUrl: 'https://oauth.vk.com/access_token',
	apiUrl: 'https://api.vk.com/method',
	delay: 666,
	afterError: 60000,

	defaultGotOptions: {
		json: true,
		timeout: 30000,
		headers: {
			'user-agent': 'https://github.com/dsblv/vk-api-calls'
		}
	}
};
