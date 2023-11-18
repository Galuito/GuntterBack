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
exports.getGoontReplies = exports.getUserGoonts = exports.getFeed = exports.getAllGoonts = exports.createReply = exports.unlikeGoont = exports.likeGoont = exports.modifyContent = exports.deleteGoont = exports.createGoont = void 0;
const goont_1 = __importDefault(require("../models/goont"));
const user_1 = __importDefault(require("../models/user"));
const user_idExtractor_1 = require("./user.idExtractor");
// CREATE GOONT
/**
 *
 * This function will receive author, content and image to then assign the values to the
 * GOONT and then save it as a newly created goont. The image is optional, the other two aren't.
 *
 * The two received parameters of this function are
 * content OBLIGATORY
 * image (link) OPTIONAL
 */
const createGoont = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const authorization = (_a = req.headers) === null || _a === void 0 ? void 0 : _a.authorization;
    const userId = (0, user_idExtractor_1.extractId)(authorization);
    const user = yield user_1.default.findOne({ _id: userId });
    if (!user) {
        return res.status(400).json({ msg: 'The user does not exist' });
    }
    if (!req.body.content) {
        return res.status(400).json({ msg: 'Please. Provide with the goont content' });
    }
    var goontValues = {
        content: req.body.content,
        author: userId,
        image: null
    };
    if (req.body.image) {
        goontValues['image'] = req.body.image;
    }
    // Important that the parameters in the body have the same name as the model
    const newGoont = new goont_1.default(goontValues);
    yield newGoont.save();
    user.addGoont(newGoont._id);
    return res.status(201).json(newGoont);
});
exports.createGoont = createGoont;
// DELETE GOONT
const deleteGoont = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    const authorization = (_b = req.headers) === null || _b === void 0 ? void 0 : _b.authorization;
    const userId = (0, user_idExtractor_1.extractId)(authorization);
    if (!req.body.goontId) {
        return res.status(400).json({ msg: 'Please. Provide with the goont Id' });
    }
    const user = yield user_1.default.findOne({ _id: userId });
    if (!user) {
        return res.status(400).json({ msg: 'The user does not exist' });
    }
    const goont = yield goont_1.default.findOne({ _id: req.body.goontId });
    if (!goont) {
        return res.status(400).json({ msg: "Goont not found!" });
    }
    // @ts-ignore
    const isOwner = yield goont.isOwner(userId);
    if (isOwner) {
        yield goont_1.default.deleteOne({ _id: req.body.goontId });
        user.removeGoont(req.body.goontId);
        return res.status(200).json({ msg: "Goont deleted from user" });
    }
    return res.status(400).json({ msg: "The user doesn't own the goont!" });
});
exports.deleteGoont = deleteGoont;
// MODIFY CONTENT (EDIT GOONT)
/**
 * This will only happen if the user matches with the authorization header.
 * That's why I created isOwner in the goont model
 */
const modifyContent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _c;
    const authorization = (_c = req.headers) === null || _c === void 0 ? void 0 : _c.authorization;
    const userId = (0, user_idExtractor_1.extractId)(authorization);
    if (!req.body.newContent || !req.body.goontId) {
        return res.status(400).json({ msg: 'Please. Provide with the new content and the goont Id' });
    }
    const user = yield user_1.default.findOne({ _id: userId });
    if (!user) {
        return res.status(400).json({ msg: 'The user does not exist' });
    }
    const goont = yield goont_1.default.findOne({ _id: req.body.goontId });
    if (!goont) {
        return res.status(400).json({ msg: "Goont not found!" });
    }
    // @ts-ignore
    const isOwner = yield goont.isOwner(userId);
    if (isOwner) {
        yield goont.modifyContent(req.body.newContent);
        return res.status(200).json({ msg: "Goont modified" });
    }
    return res.status(400).json({ msg: "The user doesn't own the goont!" });
});
exports.modifyContent = modifyContent;
// LIKE GOONT
const likeGoont = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _d;
    const authorization = (_d = req.headers) === null || _d === void 0 ? void 0 : _d.authorization;
    const userId = (0, user_idExtractor_1.extractId)(authorization);
    if (!req.body.goontId) {
        return res.status(400).json({ msg: 'Please. Provide with the goont Id' });
    }
    const user = yield user_1.default.findOne({ _id: userId });
    if (!user) {
        return res.status(400).json({ msg: 'The user does not exist' });
    }
    const goont = yield goont_1.default.findOne({ _id: req.body.goontId });
    if (!goont) {
        return res.status(400).json({ msg: "Goont not found!" });
    }
    const isLikedByUser = yield goont.isLiked(user._id);
    if (isLikedByUser) {
        return res.status(400).json({ msg: "The goont is already liked by the user" });
    }
    yield goont.addLike(user._id);
    return res.status(200).json({ msg: `Like added to goont ${goont._id}` });
});
exports.likeGoont = likeGoont;
// REMOVE LIKE (Yes, unlike is a verb and is suitable for this case)
const unlikeGoont = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _e;
    const authorization = (_e = req.headers) === null || _e === void 0 ? void 0 : _e.authorization;
    const userId = (0, user_idExtractor_1.extractId)(authorization);
    if (!req.body.goontId) {
        return res.status(400).json({ msg: 'Please. Provide with the goont Id' });
    }
    const user = yield user_1.default.findOne({ _id: userId });
    if (!user) {
        return res.status(400).json({ msg: 'The user does not exist' });
    }
    const goont = yield goont_1.default.findOne({ _id: req.body.goontId });
    if (!goont) {
        return res.status(400).json({ msg: "Goont not found!" });
    }
    const isLikedByUser = yield goont.isLiked(user._id);
    if (!isLikedByUser) {
        return res.status(400).json({ msg: "The goont is not liked by the user" });
    }
    yield goont.removeLike(user._id);
    return res.status(200).json({ msg: `Like removed from goont ${goont._id}` });
});
exports.unlikeGoont = unlikeGoont;
// REPLY TO GOONT
/**
 * This function will be utilized to reply to a goont creating what is found in the model as a "comment", comments do not appear in
 * the normal feed by the rules of our Guntter Application. Appart from this, they'll behave as a normal goont, being able to have an
 * image, content, and everything.
 *
 * The received parameters are:
 * parentGoontId
 * content
 * image
 */
const createReply = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _f;
    const authorization = (_f = req.headers) === null || _f === void 0 ? void 0 : _f.authorization;
    const userId = (0, user_idExtractor_1.extractId)(authorization);
    if (!req.body.parentGoontId) {
        return res.status(400).json({ msg: 'Please. Provide with the parent goont Id' });
    }
    const user = yield user_1.default.findOne({ _id: userId });
    if (!user) {
        return res.status(400).json({ msg: 'The user does not exist' });
    }
    const goont = yield goont_1.default.findOne({ _id: req.body.parentGoontId });
    if (!goont) {
        return res.status(400).json({ msg: "Parent goont not found!" });
    }
    if (!req.body.content) {
        return res.status(400).json({ msg: 'Please. Provide with the goont content' });
    }
    var goontValues = {
        content: req.body.content,
        author: userId,
        image: null,
        isComment: true,
        parentGoont: goont._id
    };
    if (req.body.image) {
        goontValues['image'] = req.body.image;
    }
    // Important that the parameters in the body have the same name as the model
    const newGoont = new goont_1.default(goontValues);
    yield newGoont.save();
    user.addGoont(newGoont._id);
    return res.status(201).json(newGoont);
});
exports.createReply = createReply;
// GET ALL GOONTS
const getAllGoonts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _g;
    const authorization = (_g = req.headers) === null || _g === void 0 ? void 0 : _g.authorization;
    const userId = (0, user_idExtractor_1.extractId)(authorization);
    const user = yield user_1.default.findOne({ _id: userId });
    if (!user) {
        return res.status(400).json({ msg: 'The user does not exist' });
    }
    const allGoonts = yield goont_1.default.find({ isComment: false }, { likes: false, isComment: false, isEdited: false, __v: false })
        .populate({
        path: 'author',
        select: 'username fullname profilePicture _id'
    });
    return res.status(200).json({ msg: "All goonts sent", allGoonts: allGoonts });
});
exports.getAllGoonts = getAllGoonts;
// GET FEED GOONTS
/**
 * Get's the goonts from the user and its following array users
 *
 * This should return a json with N number of JSONS inside, those jsons are going to contain each
 * goont's information, this information being:
 * PFP (link), fullname, username, content, image, likes.
 * ALSO it will be important to provide with the date so that the FrontEnd can sort them by date.
 *
 * With the knowledge I gained from doing the two other controllers, I consider that this function will be much
 * easier than I imagined
 */
const getFeed = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _h;
    const authorization = (_h = req.headers) === null || _h === void 0 ? void 0 : _h.authorization;
    const userId = (0, user_idExtractor_1.extractId)(authorization);
    const user = yield user_1.default.findOne({ _id: userId });
    if (!user) {
        return res.status(400).json({ msg: 'The user does not exist' });
    }
    const followingList = [...user.following, userId];
    const feedGoonts = yield goont_1.default.find({ author: { $in: followingList }, isComment: false }, { likes: false, isComment: false, isEdited: false, __v: false })
        .populate({
        path: 'author',
        select: 'username fullname profilePicture _id'
    });
    return res.status(200).json({ msg: "Feed goonts sent", feedGoonts: feedGoonts });
});
exports.getFeed = getFeed;
// GET PROFILE GOONTS
/**
 *
 * Gets every goont from a user that isn't a comment, this is the easiest to implement, therefore, I'm
 * starting with this one.
 */
const getUserGoonts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _j;
    const authorization = (_j = req.headers) === null || _j === void 0 ? void 0 : _j.authorization;
    const userId = (0, user_idExtractor_1.extractId)(authorization);
    const user = yield user_1.default.findOne({ _id: userId });
    if (!user) {
        return res.status(400).json({ msg: 'The user does not exist' });
    }
    // I though that I had to do magic to solve this problem, but turns out mongoDB is beautiful <3
    const goonts = yield goont_1.default.find({ author: userId, isComment: false }, { likes: false, isComment: false, isEdited: false, __v: false })
        .populate({
        path: 'author',
        select: 'username fullname profilePicture _id'
    });
    return res.status(200).json({ msg: "User goonts sent", goonts: goonts });
});
exports.getUserGoonts = getUserGoonts;
// GET GOONT REPLIES
// Gets every goont that is a reply to a goont (Goonts which parent goont is the received goontId)
const getGoontReplies = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _k;
    const authorization = (_k = req.headers) === null || _k === void 0 ? void 0 : _k.authorization;
    const userId = (0, user_idExtractor_1.extractId)(authorization);
    if (!req.body.goontId) {
        return res.status(400).json({ msg: "Please. Send the goontId" });
    }
    const user = yield user_1.default.findOne({ _id: userId });
    if (!user) {
        return res.status(400).json({ msg: 'The user does not exist' });
    }
    const goont = yield goont_1.default.findOne({ _id: req.body.goontId });
    if (!goont) {
        return res.status(404).json({ msg: 'Goont not found!' });
    }
    const replyGoonts = yield goont_1.default.find({ parentGoont: req.body.goontId }, { likes: false, isComment: false, isEdited: false, __v: false })
        .populate({
        path: 'author',
        select: 'username fullname profilePicture _id'
    });
    return res.status(200).json({ msg: "Reply goonts sent", replyGoonts: replyGoonts });
});
exports.getGoontReplies = getGoontReplies;
