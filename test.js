'use strict';

var assert     = require('assert'),
    stream     = require('stream'),
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
      
      VK.setSession({
        access_token : 'THE_TOKEN',
        expires_in   : 1000,
        user_id      : 1337
      });

      assert.equal('THE_TOKEN', VK.getToken());
    });

  });

  describe('#renderAuthUrl', function () {
    it('should return a string', function () {
      assert.equal('string', typeof VK.renderAuthUrl());
    });
  });


  describe('#collectStream', function () {
    it('should return stream', function () {
      assert.equal(true, VK.collectStream() instanceof stream.Readable);
    });
  });

})