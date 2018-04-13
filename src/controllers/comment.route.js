const express = require('express');
const { Comment } = require('../models/comment.model');
const { mustBeUser } = require('./user.middleware');

const commentRouter = express.Router();

commentRouter.use(mustBeUser);

commentRouter.post('/', (req, res) => {
    const { content, idStory } = req.body;
    Comment.createComment(req.idUser, idStory, content)
    .then(comment => res.status(201).send({ success: true, comment }))
    .catch(res.onError);
});

commentRouter.delete('/:_id', (req, res) => {
    Comment.removeComment(req.idUser, req.params._id)
    .then(comment => res.send({ success: true, comment }))
    .catch(res.onError);
});

commentRouter.post('/like/:_id', (req, res) => {
    Comment.likeComment(req.idUser, req.params._id)
    .then(comment => res.send({ success: true, comment }))
    .catch(res.onError);
});

commentRouter.post('/dislike/:_id', (req, res) => {
    Comment.dislikeComment(req.idUser, req.params._id)
    .then(comment => res.send({ success: true, comment }))
    .catch(res.onError);
});

module.exports = { commentRouter };
