'use strict';

var assert     = require('assert'),
    vkApiCalls = require('./');

var VK = vkApiCalls({
  clientId     : 'CLIENT_ID',
  clientSecret : 'CLIENT_SECRET',
  redirectUri  : 'REDIRECT_URI'
});


describe('vkApiCalls', function () {

  describe('#getToken', function () {
    it('should return undefined while token is not set', function () {
      assert.equal('undefined', typeof VK.getToken());
    }); 

    it('and return token when it is set', function () {
      VK.setToken('THE_TOKEN', 1000);
      assert.equal('THE_TOKEN', VK.getToken());
    });

  });

  describe('#renderAuthUrl', function () {
    it('should return a string', function () {
      assert.equal('string', typeof VK.renderAuthUrl());
    });
  });

})