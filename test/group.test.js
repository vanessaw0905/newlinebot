const crypto = require('crypto');
const nock = require('nock');
const linebot = require('../index.js');
const assert = require('assert');

function randomUserId() {
  return 'U' + crypto.randomBytes(16).toString('hex');
}

const line = 'https://api.line.me/v2/bot';
const groupId = randomUserId().replace('U', 'C');
const userId = randomUserId();

nock(line).get(`/group/${groupId}/member/${userId}`).reply(200, {
  displayName: 'Test User',
  userId: userId,
  pictureUrl: null
});

nock(line).get(`/group/${groupId}/members/ids`).reply(200, {
  memberIds: [userId],
  next: 'token2'
});

nock(line).get(`/group/${groupId}/members/ids?start=token2`).reply(200, {
  memberIds: [randomUserId(), randomUserId()],
  next: 'token3'
});

nock(line).get(`/group/${groupId}/members/ids?start=token3`).reply(200, {
  memberIds: [randomUserId(), randomUserId()]
});

nock(line).post(`/group/${groupId}/leave`).reply(200, {});

const bot = linebot({
  channelId: 1556385294,
  channelSecret: '1aeda682a0dc4df5bdd6ed3b9aaa0c7a',
  channelAccessToken: 'r4xJ5eqfaef5gF61gi8CEDZgIm8B3vMLz8A+g9GSL/OsfYgNSAwhaZlBjnOWSnxH496MnFrQmKHIYl72kxMBNYxh7G6ZNi+6DW9vKSAo5TvycmNeN+zXlskHRz35nuFHj6VENiq5VO0/KCBCtvht5wdB04t89/1O/w1cDnyilFU=
'
});

describe('Group', function() {

  describe('#getGroupMemberProfile()', function() {
    it('should return a profile.', function() {
      return bot.getGroupMemberProfile(groupId, userId).then((profile) => {
        assert.equal(profile.userId, userId);
        assert.equal(profile.groupId, groupId);
      });
    });
  });

  describe('#getGroupMember()', function() {
    it('should return a list of member.', function() {
      return bot.getGroupMember(groupId).then((groupMember) => {
        assert.equal(groupMember.memberIds.length, 5);
        assert.equal(groupMember.memberIds[0], userId);
      });
    });
  });

  describe('#leaveGroup()', function() {
    it('should return an empty object.', function() {
      return bot.leaveGroup(groupId).then((result) => {
        assert.deepEqual(result, {});
      });
    });
  });

});
