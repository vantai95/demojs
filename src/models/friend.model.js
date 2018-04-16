const { User } = require('./user.model');
const { validateObjectIds, validateUserExist } = require('../helpers/validators');

class Friend {
    static async sendFriendRequest(idUser, idReceiver) {
        validateObjectIds(idUser, idReceiver);
        const queryObj = {
            _id: idUser,
            friends: { $ne: idReceiver },
            incommingRequests: { $ne: idReceiver },
            sentRequests: { $ne: idReceiver },
        };
        const updateObj = { $push: { sentRequests: idReceiver } };
        const user = await User.findOneAndUpdate(queryObj, updateObj, { new: true });
        validateUserExist(user);
        const receiver = await User.findByIdAndUpdate(
            idReceiver,
            { $push: { incommingRequests: idUser } },
            { fields: { name: 1 } }
        );
        validateUserExist(receiver);
        return receiver;
    }

    static async removeFriendRequest(idUser, idReceiver) {
        validateObjectIds(idUser, idReceiver);
        const user = await User.findByIdAndUpdate(
            idUser,
            { $pull: { sentRequests: idReceiver } }
        );
        validateUserExist(user);
        const queryObj = {
            _id: idReceiver,
            incommingRequests: { $eq: idUser }
        };
        const updateObj = { $pull: { incommingRequests: idUser } };
        const receiver = await User.findOneAndUpdate(queryObj, updateObj, { fields: { name: 1 } });
        validateUserExist(receiver);
        return receiver;
    }

    static async acceptRequest(idUser, idRequestUser) {
        validateObjectIds(idUser, idRequestUser);
        const queryUser = {
            _id: idUser,
            incommingRequests: { $eq: idRequestUser }
        };
        const updateUser = {
            $pull: { incommingRequests: idRequestUser },
            $push: { friends: idRequestUser },
        };
        const user = await User.findOneAndUpdate(queryUser, updateUser);
        validateUserExist(user);
        const queryFriend = {
            _id: idRequestUser,
            sentRequests: { $eq: idUser }
        };
        const updateFriend = {
            $pull: { sentRequests: idUser },
            $push: { friends: idUser },
        };
        const friend = await User.findOneAndUpdate(queryFriend, updateFriend, { feild: { name: 1 } });
        validateUserExist(friend);
        return friend;
    }
    
    static async declineRequest(idUser, idRequestUser) {
        validateObjectIds(idUser, idRequestUser);
        const queryUser = {
            _id: idUser,
            incommingRequests: { $eq: idRequestUser }
        };
        const updateUser = {
            $pull: { incommingRequests: idRequestUser }
        };
        const user = await User.findOneAndUpdate(queryUser, updateUser);
        validateUserExist(user);
        const queryRequestor = {
            _id: idRequestUser,
            sentRequests: { $eq: idUser }
        };
        const updateRequestor = {
            $pull: { sentRequests: idUser }
        };
        const requestor = await User.findOneAndUpdate(queryRequestor, updateRequestor, { feild: { name: 1 } });
        validateUserExist(requestor);
        return requestor;
    }
    
    static async removeFriend(idUser, idFriend) {
        validateObjectIds(idUser, idFriend);
        const queryUser = {
            _id: idUser,
            friends: { $eq: idFriend }
        };
        const updateUser = {
            $pull: { friends: idFriend }
        };
        const user = await User.findOneAndUpdate(queryUser, updateUser);
        validateUserExist(user);
        const queryFriend = {
            _id: idFriend,
            friends: { $eq: idUser }
        };
        const updateFriend = {
            $pull: { friends: idUser }
        };
        const friend = await User.findOneAndUpdate(queryFriend, updateFriend);
        return friend;
    }
}

module.exports = { Friend };