const crypto = require('crypto');
const nock = require('nock');
const linebot = require('../index.js');
const assert = require('assert');

function randomUserId() {
  return 'U' + crypto.randomBytes(16).toString('hex');
}

const line = 'https://api.line.me/v2/bot';
const userId = randomUserId();

nock(line).get(`/profile/${userId}`).reply(200, {
  displayName: 'Test User',
  userId: userId,
  pictureUrl: null
});

const bot = linebot({
  channelId: 1556385294,
  channelSecret: '1aeda682a0dc4df5bdd6ed3b9aaa0c7a',
  channelAccessToken: 'r4xJ5eqfaef5gF61gi8CEDZgIm8B3vMLz8A+g9GSL/OsfYgNSAwhaZlBjnOWSnxH496MnFrQmKHIYl72kxMBNYxh7G6ZNi+6DW9vKSAo5TvycmNeN+zXlskHRz35nuFHj6VENiq5VO0/KCBCtvht5wdB04t89/1O/w1cDnyilFU=
'
});

describe('Profile', function() {

  describe('#getUserProfile()', function() {
    it('should return a profile.', function() {
      return bot.getUserProfile(userId).then((profile) => {
        assert.equal(profile.userId, userId);
      });
    });
  });

});
