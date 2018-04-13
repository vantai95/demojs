const assert = require('assert');
const request = require('supertest');
const { app } = require('../../../src/app');
const { Story } = require('../../../src/models/story.model.js');
const { User } = require('../../../src/models/user.model.js');

describe('POST /story/dislike/:_id', () => {
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
        idStory = story._id;
        await Story.likeStory(idUser2, idStory);
    });

    it('Can dislike a story', async () => {
        const response = await request(app)
        .post(`/story/dislike/${idStory}`)
        .set({ token: token2 })
        .send({});
        assert.equal(response.body.success, true);
        assert.equal(response.body.story.fans.length, 0);
        const story = await Story.findById(idStory);
        assert.equal(story.fans.length, 0);
    });

    it('Cannot dislike story without token', async () => {
        const response = await request(app)
        .post(`/story/dislike/${idStory}`)
        .send({});
        assert.equal(response.body.success, false);
        assert.equal(response.body.code, 'INVALID_TOKEN');
        const story = await Story.findById(idStory);
        assert.equal(story.fans.length, 1);
    });

    it('Cannot dislike story with wrong story id', async () => {
        const response = await request(app)
        .post(`/story/dislike/abcd`)
        .set({ token: token2 })
        .send({});
        assert.equal(response.body.success, false);
        assert.equal(response.body.code, 'INVALID_ID');
        const story = await Story.findById(idStory);
        assert.equal(story.fans.length, 1);
    });

    it('Cannot dislike a removed story', async () => {
        const story = await Story.findByIdAndRemove(idStory);
        const response = await request(app)
        .post(`/story/dislike/${idStory}`)
        .set({ token: token2 })
        .send({});
        assert.equal(response.body.success, false);
        assert.equal(response.body.code, 'CANNOT_FIND_STORY');
    });

    it('Cannot dislike a story, you havent liked it before', async () => {
        const response = await request(app)
        .post(`/story/dislike/${idStory}`)
        .set({ token: token1 })
        .send({});
        assert.equal(response.body.success, false);
        assert.equal(response.body.code, 'CANNOT_FIND_STORY');
    });
});