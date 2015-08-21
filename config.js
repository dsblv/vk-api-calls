'use strict'
module.exports = {
  apiVersion        : 5.37,
  authUrl           : 'https://oauth.vk.com/authorize',
  tokenUrl          : 'https://oauth.vk.com/access_token',
  apiUrl            : 'http://api.vk.com/method',

  defaultGotOptions : {
    json    : true,
    headers : {
        'user-agent': 'https://github.com/dsblv/vk-api-calls'
    }
  }
}