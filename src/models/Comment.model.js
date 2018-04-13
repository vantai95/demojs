const mongoose = require('mongoose');
const { MyError } = require('./MyError.model');
const { User } = require('./user.model');
const { Story } = require('./story.model');
const { validateObjectIds, validateStoryExist, validateUserExist } = require('../helpers/validators');

const commentSchema = new mongoose.Schema({
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    content: { type: String, trim: true, required: true },
    story: { type: String, trim: true, required: true },
    fans: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

const CommentModel = mongoose.model('Comment', commentSchema);

class Comment extends CommentModel {
    static async createComment(idUser, idStory, content) {
        validateObjectIds(idUser, idStory);
        if (!content) {
            throw new MyError('Content should not be empty.', 400, 'CONTENT_NOT_EMPTY');
        }
        const comment = new Comment({ content, author: idUser, story: idStory });
        const updateObject = { $push: { comments: comment._id } };
        const story = await Story.findByIdAndUpdate(idStory, updateObject);
        validateStoryExist(story);
        return comment.save();
    }

    static async removeComment(idUser, idComment) {
        validateObjectIds(idUser, idComment);
        const comment = await Comment.findOneAndRemove({ _id: idComment, author: idUser });
        if (!comment) {
            throw new MyError('Cannot find comment', 404, 'CANNOT_FIND_COMMENT');
        }
        const story = await Story.findByIdAndUpdate(comment.story, { $pull: { comments: idComment } });
        validateStoryExist(story)
        return comment;
    }

    static async likeComment(idUser, idComment) {
        validateObjectIds(idComment, idUser);
        const updateObj = { $addToSet: { fans: idUser } };
        const comment = await Comment.findByIdAndUpdate(idComment, updateObj, { new: true });
        if (!comment) throw new MyError('Cannot find comment', 404, 'CANNOT_FIND_COMMENT');
        return comment;
    }

    static async dislikeComment(idUser, idStory) {
        validateObjectIds(idComment, idUser);
        const updateObj = { $pull: { fans: idUser } };
        const comment = await Comment.findByIdAndUpdate(idComment, updateObj, { new: true });
        if (!comment) throw new MyError('Cannot find comment', 404, 'CANNOT_FIND_COMMENT');
        return comment;
    }
}

module.exports = { Comment };
