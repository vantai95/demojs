const mongoose = require('mongoose');
const { hash, compare } = require('bcrypt');
const { sign, verify } = require('../helpers/jwt');
const { MyError } = require('./MyError.model');
const { validateObjectIds, validateUserExist } = require('../helpers/validators');

const userSchema = new mongoose.Schema({
    email: { type: String, trim: true, required: true, unique: true },
    password: { type: String, trim: true, required: true },
    name: { type: String, trim: true, required: true },
    stories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Story' }],
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    incommingRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    sentRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
});

const UserModel = mongoose.model('User', userSchema);

class User extends UserModel {
    static async signUp(name, email, plainPassword) {
        if (!plainPassword) throw new MyError('Invalid user info.', 400, 'INVALID_USER_INFO');
        const password = await hash(plainPassword, 8);
        try {
            const user = new User({ name, email, password });
            await user.save();
            return user;
        } catch (error) {
            if (error.code) throw new MyError('Email existed.', 400, 'EMAIL_EXISTED');
            throw new MyError('Invalid user info.', 400, 'INVALID_USER_INFO');
        }
    }

    static async signIn(email, password) {
        const user = await User.findOne({ email })
        .populate({ path: 'stories', populate: { path: 'comments' } });
        if (!user) throw new MyError('Invalid user info', 400, 'INVALID_USER_INFO');
        const isSame = await compare(password, user.password);
        if (!isSame) throw new MyError('Invalid user info', 400, 'INVALID_USER_INFO');
        const userInfo = user.toObject();
        const token = await sign({ _id: userInfo._id });
        userInfo.token = token;
        delete userInfo.password;
        return userInfo;
    }

    static async checkSignInStatus(token) {
        const { _id } = await verify(token);
        validateObjectIds(_id);
        const user = await User.findById(_id)
        .populate({ path: 'stories', populate: { path: 'comments' } });
        validateUserExist(user);
        const userInfo = user.toObject();
        const newToken = await sign({ _id: userInfo._id });
        userInfo.token = newToken;
        delete userInfo.password;
        return userInfo;
    }
}

module.exports = { User };
