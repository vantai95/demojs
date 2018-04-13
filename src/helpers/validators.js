const mongoose = require('mongoose');
const { MyError } = require('../models/MyError.model');

function validateObjectIds(...ids) {
    ids.forEach(id => {
        try {
            new mongoose.Types.ObjectId(id);
        } catch (error) {
            throw new MyError('Invalid object id', 400, 'INVALID_ID');
        }
    });
}

function validateStoryExist(story) {
    if (!story) {
        throw new MyError('Cannot find story.', 404, 'CANNOT_FIND_STORY');
    }
}

function validateUserExist(user) {
    if (!user) {
        throw new MyError('Cannot find user.', 404, 'CANNOT_FIND_USER');
    }
}

module.exports = { validateObjectIds, validateStoryExist, validateUserExist };
