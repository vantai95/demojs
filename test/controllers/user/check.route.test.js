const assert = require('assert');
const { compare } = require('bcrypt');
const { User } = require('../../../src/models/user.model');
const request = require('supertest');
const { app } = require('../../../src/app');
const { verify, sign } = require('../../../src/helpers/jwt');

describe('POST /user/check', () => {
    let token, _id;

    beforeEach('Get token for test', async () => {
        await User.signUp('Teo', 'teo@gmail.com', '321');
        const user = await User.signIn('teo@gmail.com', '321');
        token = user.token;
        _id = user._id;
    });

    it('Can pass sign in status with token', async () => {
        const response = await request(app).get('/user/check').set({ token });
        assert.equal(response.body.success, true);
        const { name, email } = response.body.user;
        assert.equal(name, 'Teo');
        assert.equal(email, 'teo@gmail.com');
        const { _id } = await verify(response.body.user.token);
        assert.equal(_id, response.body.user._id);
    });

    it('Cannot pass sign in status with invalid token', async () => {
        const response = await request(app).get('/user/check').set({ token: '123' });
        assert.equal(response.body.success, false);
        assert.equal(response.status, 400);
        assert.equal(response.body.code, 'INVALID_TOKEN');
    });

    it('Cannot pass sign in status with valid token but _id', async () => {
        const token = await sign({ _id: '123' });
        const response = await request(app).get('/user/check').set({ token });
        assert.equal(response.body.success, false);
        assert.equal(response.status, 400);
        assert.equal(response.body.code, 'INVALID_ID');
    });

    it('Cannot pass sign in status with token of removed user.', async () => {
        await User.findByIdAndRemove(_id);
        const response = await request(app).get('/user/check').set({ token });
        assert.equal(response.body.success, false);
        assert.equal(response.status, 404);
        assert.equal(response.body.code, 'CANNOT_FIND_USER');
    });
});
