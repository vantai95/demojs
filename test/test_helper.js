process.env.NODE_ENV = 'test';

require('../src/helpers/connectDatabase');
const { Story } = require('../src/models/story.model');
const { User } = require('../src/models/user.model');
const { Comment } = require('../src/models/comment.model');

beforeEach('Remove database for test', async () => {
    await Story.remove({});
    await User.remove({});
    await Comment.remove({});
});
