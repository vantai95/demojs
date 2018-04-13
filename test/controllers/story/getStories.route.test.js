const assert = require('assert');
const request = require('supertest');
const { app } = require('../../../src/app');
const { Story } = require('../../../src/models/story.model.js');

xdescribe('GET /story', () => {
    it('Can get all stories', async () => {
        const story1 = new Story({ content: 'st1' });
        const story2 = new Story({ content: 'st2' });
        await story1.save();
        await story2.save();
        const response = await request(app).get('/story');
        const { success, stories } = response.body;
        assert.equal(success, true);
        assert.equal(stories.length, 2);
        assert.equal(stories[0].content, 'st1');
        assert.equal(stories[1].content, 'st2');
    });
});
