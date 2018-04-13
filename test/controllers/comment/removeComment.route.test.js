const assert = require('assert');
const request = require('supertest');
const { app } = require('../../../src/app');
const { Story } = require('../../../src/models/story.model.js');
const { Comment } = require('../../../src/models/comment.model');
const { User } = require('../../../src/models/user.model.js');

describe('DELETE /comment/:id', () => {
    let token1, idUser1, token2, idUser2, idStory, idComment;

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
        const comment = await Comment.createComment(idUser1, idStory, 'Hello');
        idComment = comment._id;
    });

    it('Can remove comment', async () => {
        const response = await request(app).delete('/comment/' + idComment).set({ token: token1 });
        const { success, comment } = response.body;
        assert.equal(success, true);
        assert.equal(comment.content, 'Hello');
        const countComment = await Comment.count({ });
        assert.equal(countComment, 0);
        const story = await Story.findById(idStory);
        assert.equal(story.comments.length, 0);
    });

    it('Cannot remove comment without token', async () => {
        const response = await request(app)
        .delete('/comment/' + idComment)
        .set({ token: '' })
        .send({ idStory: 'abcdasdcaso', content: '' });
        assert.equal(response.status, 400);
        assert.equal(response.body.success, false);
        assert.equal(response.body.code, 'INVALID_TOKEN');
        const countComment = await Comment.count({ });
        assert.equal(countComment, 1);
        const story = await Story.findById(idStory);
        assert.equal(story.comments.length, 1);
    });

    it('Cannot remove comment for removed story', async () => { // can xem lai
        await Story.findByIdAndRemove(idStory);
        const response = await request(app)
        .delete('/comment/' + idComment)
        .set({ token: token1 });
        assert.equal(response.status, 404);
        assert.equal(response.body.success, false);
        assert.equal(response.body.code, 'CANNOT_FIND_STORY');
        const countComment = await Comment.count({ });
        assert.equal(countComment, 0);
        const story = await Story.findById(idStory);
        assert.equal(story, null);
    });

    it('Cannot remove comment with other\'s token', async () => {
        const response = await request(app)
        .delete('/comment/' + idComment)
        .set({ token: token2 });
        assert.equal(response.status, 404);
        assert.equal(response.body.success, false);
        assert.equal(response.body.code, 'CANNOT_FIND_COMMENT');
        const countComment = await Comment.count({ });
        assert.equal(countComment, 1);
        const story = await Story.findById(idStory).populate('comments');
        assert.equal(story.comments[0].content, 'Hello');
    });

    it('Cannot remove comment with invalid comment id', async () => {
        const response = await request(app)
        .delete('/comment/' + idComment + 'x')
        .set({ token: token2 });
        assert.equal(response.status, 400);
        assert.equal(response.body.success, false);
        assert.equal(response.body.code, 'INVALID_ID');
        const countComment = await Comment.count({ });
        assert.equal(countComment, 1);
        const story = await Story.findById(idStory).populate('comments');
        assert.equal(story.comments[0].content, 'Hello');
    });

    it('Cannot remove a removed comment', async () => {
        await Comment.removeComment(idUser1, idComment);
        const response = await request(app)
        .delete('/comment/' + idComment)
        .set({ token: token2 });
        assert.equal(response.status, 404);
        assert.equal(response.body.success, false);
        assert.equal(response.body.code, 'CANNOT_FIND_COMMENT');
        const countComment = await Comment.count({ });
        assert.equal(countComment, 0);
        const story = await Story.findById(idStory).populate('comments');
        assert.equal(story.comments.length, 0);
    });
});
