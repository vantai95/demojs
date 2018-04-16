const assert = require('assert');
const request = require('supertest');
const { app } = require('../../../src/app');
const { Friend } = require('../../../src/models/friend.model');
const { User } = require('../../../src/models/user.model.js');

describe('POST /friend/cancel/:_id', () => {
    let token1, idUser1, token2, idUser2, idUser3, token3;

    beforeEach('Create users for test', async () => {
        await User.signUp('Teo', 'teo@gmail.com', '321');
        await User.signUp('Ti', 'ti@gmail.com', '321');
        await User.signUp('Tun', 'tun@gmail.com', '321');
        const user1 = await User.signIn('teo@gmail.com', '321');
        const user2 = await User.signIn('ti@gmail.com', '321');
        const user3 = await User.signIn('tun@gmail.com', '321');
        token1 = user1.token;
        idUser1 = user1._id;
        token2 = user2.token;
        idUser2 = user2._id;
        token3 = user3.token;
        idUser3 = user3._id;
        await Friend.sendFriendRequest(idUser1, idUser2);
    });

    it('Can remove friend request', async () => {
        const response = await request(app)
        .post('/friend/cancel/' + idUser2)
        .set({ token: token1 })
        .send({});
        assert.equal(response.body.success, true);
        assert.equal(response.body.receiver._id, idUser2);
        assert.equal(response.body.receiver.name, 'Ti');
        const sender = await User.findById(idUser1).populate('sentRequests');
        const receiver = await User.findById(idUser2).populate('incommingRequests');
        assert.equal(sender.sentRequests.length, 0);
        assert.equal(receiver.incommingRequests.length, 0);
    });

    it('Cannot remove friend request twice', async () => {
        await Friend.removeFriendRequest(idUser1, idUser2);
        const response = await request(app)
        .post('/friend/cancel/' + idUser2)
        .set({ token: token1 })
        .send({});
        assert.equal(response.body.success, false);
        assert.equal(response.status, 404);
        assert.equal(response.body.code, 'CANNOT_FIND_USER');
        const sender = await User.findById(idUser1).populate('sentRequests');
        const receiver = await User.findById(idUser2).populate('incommingRequests');
        assert.equal(sender.sentRequests.length, 0);
        assert.equal(receiver.incommingRequests.length, 0);
    });
    
    it('Cannot remove friend request without token', async () => {
        const response = await request(app)
        .post('/friend/cancel/' + idUser2)
        .send({});
        assert.equal(response.body.success, false);
        assert.equal(response.status, 400);
        assert.equal(response.body.code, 'INVALID_TOKEN');
        const sender = await User.findById(idUser1).populate('sentRequests');
        const receiver = await User.findById(idUser2).populate('incommingRequests');
        assert.equal(sender.sentRequests.length, 1);
        assert.equal(receiver.incommingRequests.length, 1);
    });

    it('Cannot remove friend request with removed user', async () => {
        await User.findByIdAndRemove(idUser1);
        const response = await request(app)
        .post('/friend/cancel/' + idUser2)
        .set({ token: token1 })
        .send({});
        assert.equal(response.body.success, false);
        assert.equal(response.status, 404);
        assert.equal(response.body.code, 'CANNOT_FIND_USER');
        const receiver = await User.findById(idUser2).populate('incommingRequests');
        assert.equal(receiver.incommingRequests.length, 0);
    });
});
