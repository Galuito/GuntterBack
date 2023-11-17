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
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const goontSchema = new mongoose_1.Schema({
    content: {
        type: String,
        required: true,
        maxlength: 160, // Setting a specific character limit for the goonts 
    },
    author: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    likes: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    likesInt: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    image: {
        type: String,
        required: false
    },
    parentGoont: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Goont',
        required: false
    },
    isComment: {
        type: Boolean,
        default: false
    },
    isEdited: {
        type: Boolean,
        default: false
    }
});
goontSchema.methods.modifyContent = function (newContent) {
    return __awaiter(this, void 0, void 0, function* () {
        this.content = newContent;
        this.isEdited = true;
        yield this.save();
        return 'Goont modified correctly';
    });
};
goontSchema.methods.isOwner = function (userId) {
    return __awaiter(this, void 0, void 0, function* () {
        return this.author == userId;
    });
};
goontSchema.methods.addLike = function (userId) {
    return __awaiter(this, void 0, void 0, function* () {
        this.likes.push(userId);
        this.likesInt = this.likesInt + 1;
        yield this.save();
        console.log(`Like added successfully to goont ${this._id}`);
        return 'like added';
    });
};
goontSchema.methods.removeLike = function (userId) {
    return __awaiter(this, void 0, void 0, function* () {
        this.likes.pull(userId);
        this.likesInt = this.likesInt - 1;
        yield this.save();
        console.log(`Like removed successfully from goont ${this._id}`);
        return 'like removed';
    });
};
// This returns if the user already likes this goont to see if it can like it again or dislike it.
goontSchema.methods.isLiked = function (userToCheck) {
    return __awaiter(this, void 0, void 0, function* () {
        return this.likes.includes(userToCheck);
    });
};
exports.default = (0, mongoose_1.model)('Goont', goontSchema);
