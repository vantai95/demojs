const express = require('express');
const { json } = require('body-parser');

const { storyRouter } = require('./controllers/story.route');
const { commentRouter } = require('./controllers/comment.route');
const { userRouter } = require('./controllers/user.route');
const { friendRouter } = require('./controllers/friend.route');
const app = express();
app.use(json());

app.use((req, res, next) => {
    res.onError = error => res.status(error.statusCode || 500).send({
        success: false,
        message: error.message,
        code: error.code
    });
    next();
});

app.use('/story', storyRouter);
app.use('/user', userRouter);
app.use('/comment', commentRouter);
// app.use('/friend', friendRouter);
app.use('/friend', friendRouter);

app.use((error, req, res, next) => {
    res.status(500).send({ success: false, message: error.message });
});

module.exports = { app };
