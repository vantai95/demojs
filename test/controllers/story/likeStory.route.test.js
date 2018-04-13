const assert = require('assert');
const request = require('supertest');
const { app } = require('../../../src/app');
const { Story } = require('../../../src/models/story.model.js');
const { User } = require('../../../src/models/user.model.js');

describe('POST /story/like/:_id', () => {
    let token1, idUser1, token2, idUser2, idStory;

    beforeEach('Create story and get token for test', async () => {
        await User.signUp('Teo', 'teo@gmail.com', '321');
        await User.signUp('Ti', 'ti@gmail.com', '321');
        const user1 = await User.signIn('teo@gmail.com', '321');
        const user2 = await User.signIn('ti@gmail.com', '321');
        token1 = user1.token;
        idUser1 = user1._id;
        token2 = user2.token;
        idUser2 = user2._id;
        const story = await Story.createStory('abcd', idUser1);
        idStory = story._id
    });


    it('Can like a story', async () => {
        const response = await request(app)
        .post(`/story/like/${idStory}`)
        .set({ token: token2 })
        .send({});
        assert.equal(response.status, 200);
        assert.equal(response.body.success, true);
        assert.equal(response.body.story.fans[0], idUser2);
        const story = await Story.findOne({});
        assert.equal(story.fans[0].toString(), idUser2);
    });

    it('Cannot like story without token', async () => {
        const response = await request(app)
        .post(`/story/like/${idStory}`)
        .send({});
        assert.equal(response.status, 400);
        assert.equal(response.body.success, false);
        assert.equal(response.body.story, null);
        assert.equal(response.body.code, 'INVALID_TOKEN');
        const story = await Story.findOne({});
        assert.equal(story.fans.length, 0);
    });

    it('Cannot like story with invalid token format', async () => {
        const response = await request(app)
        .post(`/story/like/${idStory}`)
        .set({ token: 'x.y' })
        .send({});
        assert.equal(response.status, 400);
        assert.equal(response.body.success, false);
        assert.equal(response.body.story, null);
        assert.equal(response.body.code, 'INVALID_TOKEN');
        const story = await Story.findOne({});
        assert.equal(story.fans.length, 0);
    });

    it('Cannot like story with wrong story id', async () => {
        const response = await request(app)
        .post(`/story/like/${idStory}x`)
        .set({ token: token2 })
        .send({});
        assert.equal(response.status, 400);
        assert.equal(response.body.success, false);
        assert.equal(response.body.story, null);
        assert.equal(response.body.code, 'INVALID_ID');
        const story = await Story.findOne({});
        assert.equal(story.fans.length, 0);
    });
    it('Cannot like story twice', async () => {
        await Story.likeStory(idUser2, idStory);
        const response = await request(app)
        .post(`/story/like/${idStory}`)
        .set({ token: token2 })
        .send({});
        console.log(response.body);
        assert.equal(response.status, 404);
        assert.equal(response.body.success, false);
        assert.equal(response.body.story, null);
        assert.equal(response.body.code, 'CANNOT_FIND_STORY');
        const story = await Story.findOne({});
        assert.equal(story.fans.length, 1);
    });
    it('Cannot like a removed story', async () => {
        await Story.findByIdAndRemove(idStory);
        const response = await request(app)
        .post(`/story/like/${idStory}`)
        .set({ token: token2 })
        .send({});
        assert.equal(response.status, 404);
        assert.equal(response.body.success, false);
        assert.equal(response.body.story, null);
        assert.equal(response.body.code, 'CANNOT_FIND_STORY');
    });
});
