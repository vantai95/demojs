const assert = require('assert');
const { compare } = require('bcrypt');
const { User } = require('../../src/models/user.model');
const { Story } = require('../../src/models/story.model');
const { verify, sign } = require('../../src/helpers/jwt');

describe('Model User.createStory', () => {
    let userId;
    beforeEach('Create user for test', async () => {
        const user = await User.signUp('Teo', 'teo@gmail.com', '123');
        userId = user._id;
    });

    it('Can create story', async () => {
        await Story.createStory('abcd', userId);
        const story = await Story.findOne({}).populate('author');
        assert.equal(story.content, 'abcd');
        assert.equal(story.author._id, userId.toString());
        const user = await User.findById(userId).populate('stories');
        assert.equal(user.stories[0].content, 'abcd');
    });

    it('Cannot create story without content', async () => {
        const error = await Story.createStory('', userId).catch(error => error);
        assert.equal(error.code, 'INVALID_STORY_INFO');
        const story = await Story.findOne({}).populate('author');
        assert.equal(story, null);
        const user = await User.findById(userId);
        assert.equal(user.stories.length, 0);
    })
    it('Cannot create story with invalid userId', async () => {
        const error = await Story.createStory('', '123').catch(error => error);
        assert.equal(error.code, 'INVALID_ID');
        const story = await Story.findOne({}).populate('author');
        assert.equal(story, null);
        const user = await User.findById(userId);
        assert.equal(user.stories.length, 0);
    });
    it('Cannot create story with removed userId', async () => {
        await User.findByIdAndRemove(userId);
        const error = await Story.createStory('abcd', userId).catch(e => e);
        assert.equal(error.code, 'CANNOT_FIND_USER');
        const story = await Story.findOne({}).populate('author');
        assert.equal(story, null);
        const user = await User.findById(userId);
        assert.equal(user, null);
    });
});

describe('Model User.updateStory', () => {
    let userId1, userId2, idStory;
    beforeEach('Create user for test', async () => {
        const user1 = await User.signUp('Teo', 'teo@gmail.com', '123');
        const user2 = await User.signUp('Ti', 'ti@gmail.com', 'abc');
        userId1 = user1._id;
        userId2 = user2._id;
        const story = await Story.createStory('abcd', userId1);
        idStory = story._id;
    });
    it('Can update story', async () => {
        const story = await Story.updateStory(idStory, userId1, 'xyz');
        assert.equal(story.content, 'xyz');
        const story1 = await Story.findOne({});
        assert.equal(story1.content, 'xyz');
    });
    it('Cannot update story with other\'s userId', async () => {
        const error = await Story.updateStory(idStory, userId2, 'xyz').catch(e => e);
        assert.equal(error.code, 'CANNOT_FIND_STORY');
        const story1 = await Story.findOne({});
        assert.equal(story1.content, 'abcd');
    });

    it('Cannot update story without content', async () => {
        const error = await Story.updateStory(idStory, userId1, '').catch(e => e);
        assert.equal(error.code, 'CONTENT_NOT_EMPTY');
        const story1 = await Story.findOne({});
        assert.equal(story1.content, 'abcd');
    });

    it('Cannot update story with invalid userId', async () => {
        const error = await Story.updateStory(idStory, 'abcd', '').catch(e => e);
        assert.equal(error.code, 'INVALID_ID');
        const story1 = await Story.findOne({});
        assert.equal(story1.content, 'abcd');
    });

    it('Cannot update story with invalid idStory', async () => {
        const error = await Story.updateStory('abcd', userId1, '').catch(e => e);
        assert.equal(error.code, 'INVALID_ID');
        const story1 = await Story.findOne({});
        assert.equal(story1.content, 'abcd');
    });

    it('Cannot update removed story', async () => {
        await Story.findByIdAndRemove(idStory);
        const error = await Story.updateStory(idStory, userId1, 'xyz').catch(e => e);
        assert.equal(error.code, 'CANNOT_FIND_STORY');
        const story1 = await Story.findOne({});
        assert.equal(story1, null);
    });
});

describe('Model User.removeStory', () => {
    let userId1, userId2, idStory;
    beforeEach('Create user for test', async () => {
        const user1 = await User.signUp('Teo', 'teo@gmail.com', '123');
        const user2 = await User.signUp('Ti', 'ti@gmail.com', 'abc');
        userId1 = user1._id;
        userId2 = user2._id;
        const story = await Story.createStory('abcd', userId1);
        idStory = story._id;
    });

    it('Can remove story', async () => {
        await Story.removeStory(idStory, userId1);
        const story = await Story.findOne({});
        assert.equal(story, null);
        const user = await User.findById(userId1);
        assert.equal(user.stories.length, 0);
    });

    it('Cannot remove story with other\'s userId', async () => {
        const error = await Story.removeStory(idStory, userId2).catch(e => e);
        assert.equal(error.code, 'CANNOT_FIND_STORY');
        const story = await Story.findById(idStory);
        assert.equal(story.content, 'abcd');
    });

    it('Cannot remove story with invalid userId', async () => {
        const error = await Story.removeStory(idStory, 'abcd').catch(e => e);
        assert.equal(error.code, 'INVALID_ID');
        const story = await Story.findById(idStory);
        assert.equal(story.content, 'abcd');
    });

    it('Cannot remove story with invalid idStory', async () => {
        const error = await Story.removeStory('xyz', userId1).catch(e => e);
        assert.equal(error.code, 'INVALID_ID');
        const story = await Story.findById(idStory);
        assert.equal(story.content, 'abcd');
    });

    it('Cannot remove a removed story', async () => {
        await Story.findByIdAndRemove(idStory);
        const error = await Story.removeStory(idStory, userId1).catch(e => e);
        assert.equal(error.code, 'CANNOT_FIND_STORY');
        const story = await Story.findById(idStory);
        assert.equal(story, null);
    });
});

