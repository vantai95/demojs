const assert = require('assert');
const request = require('supertest');
const { app } = require('../../../src/app');
const { Friend } = require('../../../src/models/friend.model');
const { User } = require('../../../src/models/user.model.js');

describe('POST /friend/request/:_id', () => {
    let token1, idUser1, token2, idUser2, idUser3, token3;

    beforeEach('Create story and get token for test', async () => {
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
    });

    it('Can send friend request', async () => {
        const response = await request(app)
        .post('/friend/request/' + idUser2)
        .set({ token: token1 })
        .send({});
        assert.equal(response.body.success, true);
        assert.equal(response.body.receiver._id, idUser2);
        assert.equal(response.body.receiver.name, 'Ti');
        const sender = await User.findById(idUser1).populate('sentRequests');
        const receiver = await User.findById(idUser2).populate('incommingRequests');
        assert.equal(sender.sentRequests[0].name, 'Ti');
        assert.equal(receiver.incommingRequests[0].name, 'Teo');
    });

    it('Cannot send friend request twice', async () => {
        await Friend.sendFriendRequest(idUser1, idUser2);
        const response = await request(app)
        .post('/friend/request/' + idUser2)
        .set({ token: token1 })
        .send({});
        const { body, status } = response;
        assert.equal(status, 404);
        assert.equal(body.code, 'CANNOT_FIND_USER');
    });
    
    it('Cannot send friend request to user that have sent request to you', async () => {
        await Friend.sendFriendRequest(idUser2, idUser1);
        const response = await request(app)
        .post('/friend/request/' + idUser2)
        .set({ token: token1 })
        .send({});
        const { body, status } = response;
        assert.equal(status, 404);
        assert.equal(body.code, 'CANNOT_FIND_USER');
    });
    it('Cannot send friend request without token', async () => {
        const response = await request(app)
        .post('/friend/request/' + idUser2)
        .send({});
        const { body, status } = response;
        assert.equal(status, 400);
        assert.equal(body.code, 'INVALID_TOKEN');
    });
    it('Cannot send friend request with removed user', async () => {
        await User.findByIdAndRemove(idUser1);
        const response = await request(app)
        .post('/friend/request/' + idUser2)
        .set({ token: token1 })
        .send({});
        const { body, status } = response;
        assert.equal(status, 404);
        assert.equal(body.code, 'CANNOT_FIND_USER');
    });
    it('Cannot send friend request to removed user', async () => {
        await User.findByIdAndRemove(idUser2);
        const response = await request(app)
        .post('/friend/request/' + idUser2)
        .set({ token: token1 })
        .send({});
        const { body, status } = response;
        assert.equal(status, 404);
        assert.equal(body.code, 'CANNOT_FIND_USER');
    });
});