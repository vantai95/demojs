const mongoose = require('mongoose');
const { MyError } = require('./MyError.model');
const { User } = require('./user.model');
const { validateObjectIds, validateStoryExist, validateUserExist } = require('../helpers/validators');

const storySchema = new mongoose.Schema({
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    content: { type: String, trim: true, required: true },
    fans: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }]
});

const StoryModel = mongoose.model('Story', storySchema);

class Story extends StoryModel {
    static async createStory(content, userId) {
        validateObjectIds(userId);
        try {
            var story = new Story({ content, author: userId });
            await story.save();
            const user = await User.findByIdAndUpdate(userId, { $push: { stories: story._id } });
            validateUserExist(user);
            return story;
        } catch (error) {
            await Story.findByIdAndRemove(story);
            if (error instanceof MyError) throw error;
            throw new MyError('Invalid story info.', 400, 'INVALID_STORY_INFO');
        }
    }

    static async updateStory(idStory, idUser, content) {
        validateObjectIds(idStory, idUser);
        if (!content) {
            throw new MyError('Content should not be empty.', 400, 'CONTENT_NOT_EMPTY');
        }
        const story = await Story.findOneAndUpdate({ _id: idStory, author: idUser }, { content }, { new: true });
        validateStoryExist(story);
        return story;
    }

    static async removeStory(idStory, idUser) {
        validateObjectIds(idStory, idUser);
        const story = await Story.findOneAndRemove({ _id: idStory, author: idUser });
        validateStoryExist(story);
        // await Comment.remove({ story: idStory });
        const user = await User.findByIdAndUpdate(idUser, { $pull: { stories: idStory } });
        validateUserExist(user);
        return story;
    }

    static async likeStory(idUser, idStory) {
        validateObjectIds(idStory, idUser);
        const updateObj = { $addToSet: { fans: idUser } };
        const story = await Story.findByIdAndUpdate(idStory, updateObj, { new: true });
        validateStoryExist(story);
        return story;
    }

    static async dislikeStory(idUser, idStory) {
        validateObjectIds(idStory, idUser);
        const updateObj = { $pull: { fans: idUser } };
        const queryObj = { _id: idStory, fans: { $all: [idUser] } };
        const story = await Story.findOneAndUpdate(queryObj, updateObj, { new: true });
        validateStoryExist(story);
        return story;
    }
}

module.exports = { Story };
