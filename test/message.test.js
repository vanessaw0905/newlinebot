const crypto = require('crypto');
const nock = require('nock');
const linebot = require('../index.js');
const assert = require('assert');

function randomUserId() {
  return 'U' + crypto.randomBytes(16).toString('hex');
}

const line = 'https://api.line.me/v2/bot';
const userId = randomUserId();
const userId2 = randomUserId();
const userId3 = randomUserId();
const replyToken = 'nHuyWiB7yP5Zw52FIkcQobQuGDXCTA';

nock(line)
  .post('/message/reply', {
    replyToken: replyToken,
    messages: [{ type: 'text', text: 'message' }]
  })
  .reply(200, {});

nock(line)
  .post('/message/reply', {
    replyToken: replyToken,
    messages: [{ type: 'text', text: 'message1' }, { type: 'text', text: 'message2' }]
  })
  .reply(200, {});

nock(line)
  .persist()
  .post('/message/push', {
    to: /^U.*/,
    messages: [{ type: 'text', text: 'message' }]
  })
  .reply(200, {});

nock(line)
  .post('/message/push', {
    to: userId,
    messages: [{ type: 'text', text: 'message1' }, { type: 'text', text: 'message2' }]
  })
  .reply(200, {});

nock(line)
  .post('/message/multicast', {
    to: [userId, userId2, userId3],
    messages: [{ type: 'text', text: 'message' }]
  })
  .reply(200, {});

const content = crypto.randomBytes(16);
nock(line).get('/message/messageId/content').reply(200, content);

const bot = linebot({
  channelId: 1556385294,
  channelSecret: '1aeda682a0dc4df5bdd6ed3b9aaa0c7a',
  channelAccessToken: 'r4xJ5eqfaef5gF61gi8CEDZgIm8B3vMLz8A+g9GSL/OsfYgNSAwhaZlBjnOWSnxH496MnFrQmKHIYl72kxMBNYxh7G6ZNi+6DW9vKSAo5TvycmNeN+zXlskHRz35nuFHj6VENiq5VO0/KCBCtvht5wdB04t89/1O/w1cDnyilFU=
'
});

describe('Message', function() {

  describe('#reply()', function() {
    it('should return an empty object.', function() {
      return bot.reply(replyToken, 'message').then((result) => {
        assert.deepEqual(result, {});
      });
    });
    it('should support message array.', function() {
      return bot.reply(replyToken, ['message1', 'message2']).then((result) => {
        assert.deepEqual(result, {});
      });
    });
  });

  describe('#push()', function() {
    it('should return an empty object.', function() {
      return bot.push(userId, 'message').then((result) => {
        assert.deepEqual(result, {});
      });
    });
    it('should support message array.', function() {
      return bot.push(userId, ['message1', 'message2']).then((result) => {
        assert.deepEqual(result, {});
      });
    });
    it('should resolve as multiple promises.', function () {
      return bot.push([userId, userId2, userId3], 'message').then(function (results) {
        assert.equal(results.length, 3);
      });
    });
  });

  describe('#multicast()', function() {
    it('should return an empty object.', function() {
      return bot.multicast([userId, userId2, userId3], 'message').then((result) => {
        assert.deepEqual(result, {});
      });
    });
  });

  describe('#getMessageContent()', function() {
    it('should return a buffer.', function() {
      return bot.getMessageContent('messageId').then((buffer) => {
        assert.equal(buffer.toString('hex'), content.toString('hex'));
      });
    });
  });

});
