const assert = require('assert');
const request = require('supertest');
const { app } = require('../../../src/app');
const { Story } = require('../../../src/models/story.model.js');
const { Comment } = require('../../../src/models/comment.model');
const { User } = require('../../../src/models/user.model.js');

describe('PUT /comment', () => {
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

    it('Can create comment', async () => {
        const response = await request(app)
        .post('/comment')
        .set({ token: token1 })
        .send({ idStory, content: 'xyz' });
        assert.equal(response.status, 201);
        assert.equal(response.body.success, true);
        const { author, story, content } = response.body.comment;
        assert.equal(content, 'xyz')
        assert.equal(story, idStory);
        assert.equal(author, idUser1);
        const { comments } = await Story.findById(idStory).populate('comments');
        assert.equal(comments[0].content, 'xyz');
    });

    it('Cannot create comment without content', async () => {
        const response = await request(app)
        .post('/comment')
        .set({ token: token1 })
        .send({ idStory, content: '' });
        assert.equal(response.status, 400);
        assert.equal(response.body.success, false);
        assert.equal(response.body.code, 'CONTENT_NOT_EMPTY');
    });

    it('Cannot create comment with invalid story id', async () => {
        const response = await request(app)
        .post('/comment')
        .set({ token: token1 })
        .send({ idStory: 'abcdasdcaso', content: '' });
        assert.equal(response.status, 400);
        assert.equal(response.body.success, false);
        assert.equal(response.body.code, 'INVALID_ID');
    });

    it('Cannot create comment without token', async () => {
        const response = await request(app)
        .post('/comment')
        .set({ token: '' })
        .send({ idStory: 'abcdasdcaso', content: '' });
        assert.equal(response.status, 400);
        assert.equal(response.body.success, false);
        assert.equal(response.body.code, 'INVALID_TOKEN');
    });

    it('Cannot create comment for removed story', async () => {
        await Story.findByIdAndRemove(idStory);
        const response = await request(app)
        .post('/comment')
        .set({ token: token1 })
        .send({ idStory: idStory, content: 'zz' });
        assert.equal(response.status, 404);
        assert.equal(response.body.success, false);
        assert.equal(response.body.code, 'CANNOT_FIND_STORY');
    });
});
