const express = require('express');
const { Story } = require('../models/story.model');
const { mustBeUser } = require('./user.middleware');

const storyRouter = express.Router();

storyRouter.use(mustBeUser);

storyRouter.get('/', (req, res) => {
    Story.find({})
    .then(stories => res.send({ success: true, stories }))
    .catch(error => res.status(500).send({ success: false, message: error.message }));
});

storyRouter.post('/', (req, res) => {
    Story.createStory(req.body.content, req.idUser)
    .then(story => res.status(201).send({ success: true, story }))
    .catch(res.onError);
});

storyRouter.put('/:_id', (req, res) => {
    Story.updateStory(req.params._id, req.idUser, req.body.content)
    .then(story => res.send({ success: true, story }))
    .catch(res.onError);
});

storyRouter.delete('/:_id', (req, res) => {
    Story.removeStory(req.params._id, req.idUser)
    .then(story => res.send({ success: true, story }))
    .catch(res.onError);
});

storyRouter.post('/like/:_id', (req, res) => {
    Story.likeStory(req.idUser, req.params._id)
    .then(story => res.send({ success: true, story }))
    .catch(res.onError);
});

storyRouter.post('/dislike/:_id', (req, res) => {
    Story.dislikeStory(req.idUser, req.params._id)
    .then(story => res.send({ success: true, story }))
    .catch(res.onError);
});

module.exports = { storyRouter };
