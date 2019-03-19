const linebot = require('../index.js');
const assert = require('assert');
const crypto = require('crypto');
const fetch = require('node-fetch');
const nock = require('nock');

const line = 'https://api.line.me/v2/bot';

const bot = linebot({
  channelId: 1556385294,
  channelSecret: '1aeda682a0dc4df5bdd6ed3b9aaa0c7a',
  channelAccessToken: 'r4xJ5eqfaef5gF61gi8CEDZgIm8B3vMLz8A+g9GSL/OsfYgNSAwhaZlBjnOWSnxH496MnFrQmKHIYl72kxMBNYxh7G6ZNi+6DW9vKSAo5TvycmNeN+zXlskHRz35nuFHj6VENiq5VO0/KCBCtvht5wdB04t89/1O/w1cDnyilFU=
'
});

const req = {};
req.headers = {
  'Content-Type': 'application/json',
  Authorization: 'Bearer token',
  'X-Line-Signature': 'signature'
};
req.body = {
  events: [{
    replyToken: 'nHuyWiB7yP5Zw52FIkcQobQuGDXCTA',
    type: 'message',
    timestamp: 1462629479859,
    source: {
      type: 'user',
      userId: 'Ud561c38ed3e241991983b1df14fc3ea3'
    },
    message: {
      id: '325708',
      type: 'text',
      text: 'Hello, world'
    }
  }]
};
req.rawBody = JSON.stringify(req.body);
req.headers['X-Line-Signature'] = crypto.createHmac('sha256', 'secret').update(req.rawBody, 'utf8').digest('base64');

describe('linebot', function () {

  describe('#constructor()', function () {
    it('should create a new LineBot instance.', function () {
      assert.equal(linebot.LineBot, bot.constructor);
    });
    it('should have options as specified.', function () {
      assert.equal(bot.options.verify, true);
    });
  });

  describe('#verify()', function () {
    it('should return true when the signature is correct.', function () {
      const res = bot.verify(req.rawBody, req.headers['X-Line-Signature']);
      assert.equal(res, true);
    });
    it('should return false when the signature is incorrect.', function () {
      const res = bot.verify(req.rawBody, 'random signature');
      assert.equal(res, false);
    });
  });

  describe('#parse()', function () {
    it('should raise message event.', function (done) {
      const localBot = linebot({});
      localBot.on('message', function (event) {
        assert.equal(event, req.body.events[0]);
        assert.equal(typeof event.reply, 'function');
        if (event.source) {
          assert.equal(typeof event.source.profile, 'function');
        }
        if (event.message) {
          assert.equal(typeof event.message.content, 'function');
        }
        done();
      });
      localBot.parse(req.body);
    });
  });

  describe('#get()', function () {
    it('should return a promise.', function () {
      const path = '/a/random/path';
      nock(line).get(path).reply(404);
      const res = bot.get(path).then(function (res) {
        assert.equal(res.status, 404);
      });
      assert.equal(res.constructor, Promise);
      return res;
    });
  });

  describe('#post()', function () {
    it('should return a promise.', function () {
      const path = '/a/random/path';
      const body = {
        head: 'This is the head of the body. Do you not like it?'
      };
      nock(line).post(path, body).reply(200);
      const res = bot.post(path, body).then(function (res) {
        assert.equal(res.status, 200);
      });
      assert.equal(res.constructor, Promise);
      return res;
    });
  });

  describe('#parser()', function () {
    it('should return a function that expects 2 arguments.', function () {
      const parser = bot.parser();
      assert.equal(typeof parser, 'function');
      assert.equal(parser.length, 2);
    });
  });

  describe('#listen()', function () {
    it('should expect 3 arguments.', function () {
      assert.equal(typeof bot.listen, 'function');
      assert.equal(bot.listen.length, 3);
    });
    it('should start http server.', function (done) {
      bot.listen('/linewebhook', 3000, function () {
        done();
      });
    });
    it('should handle POST request and return empty object.', function (done) {
      fetch('http://localhost:3000/linewebhook', { method: 'POST', headers: req.headers, body: JSON.stringify(req.body) }).then(function (res) {
        assert.equal(res.status, 200);
        return res.json();
      }).then(function (data) {
        assert.deepEqual(data, {});
        done();
      });
    });
  });

});
