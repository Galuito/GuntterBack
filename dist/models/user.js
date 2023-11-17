"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const bcrypt_1 = __importDefault(require("bcrypt"));
// One "small" comment regarding the user schema instead of creating a whole different
// model, the same userSchema model was used to hold the followers and followed users of
// every user, this was done because of the size of this university project, because our users
// won't have more than 50 followers/followed users this won't present a problem, if the 
// application was to be deployed in a real enviroment this would present issues, specifically
// scalability issues because of the amount of data that would have to be loaded every time
// a user is found in the database.
const userSchema = new mongoose_1.Schema({
    username: {
        type: String,
        unique: true,
        required: true,
        lowercase: true,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    fullname: {
        type: String,
        required: true,
        trim: true
    },
    bio: {
        type: String,
        default: "Ready to guntt!",
        maxlength: 70
    },
    profilePicture: {
        type: String,
        default: 'default_profile_picture.jpg'
    },
    bannerPicture: {
        type: String,
        default: 'https://cdn.wallpapersafari.com/19/73/A9lgnE.jpg'
    },
    followers: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    followersInt: {
        type: Number,
        default: 0
    },
    following: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    followingInt: {
        type: Number,
        default: 0
    },
    goonts: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'Goont'
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now
    }
});
userSchema.pre('save', function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = this;
        if (!user.isModified('password'))
            return next();
        // This only executes if there was a change to the password
        // otherwise, nothing happens and next() is executed
        const salt = yield bcrypt_1.default.genSalt(10);
        const hash = yield bcrypt_1.default.hash(user.password, salt);
        user.password = hash;
        next();
    });
});
// User Methods
userSchema.methods.comparePassword = function (password) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield bcrypt_1.default.compare(password, this.password);
    });
};
userSchema.methods.modifyFullname = function (newFullname) {
    return __awaiter(this, void 0, void 0, function* () {
        this.fullname = newFullname;
        yield this.save();
        console.log(`User: ${this.username} was modified (fullname) and saved successfully`);
        return this.username;
    });
};
userSchema.methods.modifyBio = function (newBio) {
    return __awaiter(this, void 0, void 0, function* () {
        this.bio = newBio;
        yield this.save();
        console.log(`User: ${this.username} was modified (bio) and saved successfully`);
        return this.username;
    });
};
userSchema.methods.modifyPFP = function (newPFP) {
    return __awaiter(this, void 0, void 0, function* () {
        this.profilePicture = newPFP;
        yield this.save();
        console.log(`User: ${this.username} was modified (PFP) and saved successfully`);
        return this.username;
    });
};
userSchema.methods.modifyBanner = function (newBanner) {
    return __awaiter(this, void 0, void 0, function* () {
        this.bannerPicture = newBanner;
        yield this.save();
        console.log(`User: ${this.username} was modified (Banner) and saved successfully`);
        return this.username;
    });
};
userSchema.methods.modifyUsername = function (newUsername) {
    return __awaiter(this, void 0, void 0, function* () {
        this.username = newUsername;
        yield this.save();
        console.log(`User: ${this.username} was modified (username) and saved successfully`);
        return this.username;
    });
};
userSchema.methods.modifyPassword = function (newPassword) {
    return __awaiter(this, void 0, void 0, function* () {
        this.password = newPassword;
        yield this.save();
        console.log(`User: ${this.username} was modified (password) and saved successfully`);
        return this.username;
    });
};
//This function will add a user ID to the followers array and add 1 to the followersInt
userSchema.methods.addFollower = function (newFollower) {
    return __awaiter(this, void 0, void 0, function* () {
        this.followers.push(newFollower);
        this.followersInt = this.followersInt + 1;
        yield this.save();
        console.log(`User: ${this.username} was followed by user ${newFollower} successfully`);
        return this.username;
    });
};
userSchema.methods.removeFollower = function (oldFollower) {
    return __awaiter(this, void 0, void 0, function* () {
        this.followers.pull(oldFollower);
        this.followersInt = this.followersInt - 1;
        yield this.save();
        console.log(`User: ${this.username} was unfollowed by user ${oldFollower} successfully`);
        return this.username;
    });
};
// This function will add a user ID to the following array and add 1 to the followingInt
userSchema.methods.followUser = function (userToFollow) {
    return __awaiter(this, void 0, void 0, function* () {
        this.following.push(userToFollow);
        this.followingInt = this.followingInt + 1;
        yield this.save();
        console.log(`User: ${this.username} followed user ${userToFollow} successfully`);
        return this.username;
    });
};
// This function will remove a user ID from the following array and subtract 1 from the followingInt
userSchema.methods.unfollowUser = function (userToUnfollow) {
    return __awaiter(this, void 0, void 0, function* () {
        this.following.pull(userToUnfollow);
        this.followingInt = this.followingInt - 1;
        yield this.save();
        console.log(`User: ${this.username} unfollowed user ${userToUnfollow} successfully`);
        return this.username;
    });
};
userSchema.methods.isFollowing = function (userToCheck) {
    return __awaiter(this, void 0, void 0, function* () {
        return this.following.includes(userToCheck);
    });
};
userSchema.methods.addGoont = function (goontId) {
    return __awaiter(this, void 0, void 0, function* () {
        this.goonts.push(goontId);
        yield this.save();
        console.log(`Goont added successfully to user ${this.username}`);
        return this.username;
    });
};
userSchema.methods.removeGoont = function (goontId) {
    return __awaiter(this, void 0, void 0, function* () {
        this.goonts.pull(goontId);
        yield this.save();
        console.log(`Goont removed successfully from user ${this.username}`);
        return this.username;
    });
};
exports.default = (0, mongoose_1.model)('User', userSchema);
