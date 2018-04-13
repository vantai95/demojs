const assert = require('assert');
const request = require('supertest');
const { app } = require('../../../src/app');
const { Story } = require('../../../src/models/story.model.js');
const { User } = require('../../../src/models/user.model.js');
const { Comment } = require('../../../src/models/comment.model');

describe('POST /comment/dislike/:_id', () => {
    let token1, idUser1, token2, idUser2, idUser3, token3, idStory, idComment;

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
        const story = await Story.createStory('abcd', idUser1);
        idStory = story._id;
        const comment = await Comment.createComment(idUser2, idStory, 'xyz');
        idComment = comment._id;
        await Comment.likeComment(idUser3, idComment);
    });

    it('Can dislike a comment', async () => {
        const response = await request(app)
        .post(`/comment/dislike/${idComment}`)
        .set({ token: token3 })
        .send({});
        assert.equal(response.body.success, true);
        assert.equal(response.body.comment.fans.length, 0);
        const comment = await Comment.findById(idComment);
        assert.equal(comment.fans.length, 0);
    });

    it('Cannot dislike comment without token', async () => {
        const response = await request(app)
        .post(`/comment/dislike/${idComment}`)
        .set({ token: '' })
        .send({});
        assert.equal(response.body.success, false);
        assert.equal(response.body.code, 'INVALID_TOKEN');
        const comment = await Comment.findById(idComment);
        assert.equal(comment.fans.length, 1);
    });

    it('Cannot dislike comment with wrong comment id', async () => {
        const response = await request(app)
        .post(`/comment/dislike/abcdef1213`)
        .set({ token: token3 })
        .send({});
        assert.equal(response.body.success, false);
        assert.equal(response.body.code, 'INVALID_ID');
        const comment = await Comment.findById(idComment);
        assert.equal(comment.fans.length, 1);
    });

    it('Cannot dislike a removed comment', async () => {
        await Comment.findByIdAndRemove(idComment);
        const response = await request(app)
        .post(`/comment/dislike/${idComment}`)
        .set({ token: token2 })
        .send({});
        assert.equal(response.body.success, false);
        assert.equal(response.body.code, 'CANNOT_FIND_COMMENT');
    });

    it('Cannot dislike a comment, you havent liked it before', async () => {
        const response = await request(app)
        .post(`/comment/dislike/${idComment}`)
        .set({ token: token2 })
        .send({});
        assert.equal(response.body.success, false);
        assert.equal(response.body.code, 'CANNOT_FIND_COMMENT');
    });
});