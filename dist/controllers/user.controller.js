"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.fuzzySearchUsers = exports.unfollowUser = exports.followUser = exports.getUserData = exports.modifyUserPassword = exports.modifyUser = exports.checkUsername = exports.deleteUser = exports.signIn = exports.signUp = exports.testerController = void 0;
const user_1 = __importDefault(require("../models/user"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("../config/config"));
const user_idExtractor_1 = require("./user.idExtractor");
const fuzzy = __importStar(require("fuzzy"));
// Expira en 1209600 Segundos o 14 dias
function createtoken(user) {
    return jsonwebtoken_1.default.sign({ id: user.id, email: user.email }, config_1.default.jwtSecret, {
        expiresIn: 604800
    });
}
// This is a tester controller that is used to print request and response data so that everything
// behaves correctly, and the correct data is being sent/received
const testerController = (req, res) => {
    var _a;
    console.log("Received body: ", req.body);
    // console.log("Received headers: ",req.headers);
    console.log("Authorization header: ", req.headers.authorization);
    // Use optional chaining to safely access req.headers.authorization
    const authorization = (_a = req.headers) === null || _a === void 0 ? void 0 : _a.authorization;
    const userId = (0, user_idExtractor_1.extractId)(authorization);
    console.log("Extracted ID:", userId);
    return res.status(200).json({ msg: "Reached the end" });
};
exports.testerController = testerController;
// CREATE USER
/**
 *
 * Simple sign up function that creates a user, please pass the following parameters in the body.
 * OBLIGATORY
 * email => string
 * username => string
 * password => string
 * fullname => string
 *
 * OPTIONAL
 * bio => string
 * PFP => string
 */
const signUp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.body.email || !req.body.password || !req.body.username || !req.body.fullname) {
        return res.status(400).json({ msg: 'Please. Provide with all the fields of a User (email, password, username and fullname)' });
    }
    // This checks wether if the user or email is already used to avoid creating a user with
    // an already existing credential
    const foundUsers = yield user_1.default.find({
        $or: [
            { email: req.body.email },
            { username: req.body.username }
        ]
    });
    // If the returned array is lenght 0 that means there's no found user, therefore, the user 
    // may be created
    if (!(foundUsers.length === 0)) {
        return res.status(400).json({ msg: "The username or email are already used" });
    }
    // Important that the parameters in the body have the same name as the model
    const newUser = new user_1.default(req.body);
    yield newUser.save();
    return res.status(201).json(newUser);
});
exports.signUp = signUp;
// GENERATE JWT FROM USER
/**
 *
 * This is a simple signIn function that returns a json web token so that the user is able to browse the
 * application and see its notes
 */
const signIn = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.body.password) {
        return res.status(400).json({ msg: 'Please. Send your password' });
    }
    if (req.body.email) {
        const user = yield user_1.default.findOne({ email: req.body.email });
        if (!user) {
            return res.status(400).json({ msg: 'The user does not exist' });
        }
        const isMatch = yield user.comparePassword(req.body.password);
        if (isMatch) {
            return res.status(200).json({ token: createtoken(user) });
        }
    }
    else if (req.body.username) {
        const user = yield user_1.default.findOne({ username: req.body.username });
        if (!user) {
            return res.status(400).json({ msg: 'The user does not exist' });
        }
        const isMatch = yield user.comparePassword(req.body.password);
        if (isMatch) {
            return res.status(200).json({ token: createtoken(user) });
        }
    }
    else {
        return res.status(400).json({ msg: 'Please. Send email or username' });
    }
    // Code should never reach this far, the code should at least return in the last else statement
    return res.status(400).json({
        msg: 'The email or password are incorrect'
    });
});
exports.signIn = signIn;
//DELETE USER
/**
 *
 * This function extracts the JWT from the header passes it to the extracId function and then operates based
 * on the result, if there is no userId and the result is undefined it returns an error
 *
 * The function now handles the user password, it is sent the password and if it doesn't match
 * then the deletion does not proceed
 *
 */
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    // Checks the authorization header and manages if it were to be undefined
    const authorization = (_a = req.headers) === null || _a === void 0 ? void 0 : _a.authorization;
    const userId = (0, user_idExtractor_1.extractId)(authorization);
    if (!req.body.password) {
        return res.status(400).json({ msg: "Please. Send the password" });
    }
    try {
        // If there is an authorization header and it passed the verification.
        if (userId) {
            const user = yield user_1.default.findOne({ _id: userId });
            if (!user) {
                return res.status(400).json({ msg: "User does not exist" });
            }
            const isMatch = yield user.comparePassword(req.body.password);
            if (isMatch) {
                yield user_1.default.deleteOne({ _id: userId });
                return res.status(200).json({ msg: `Deleted User with username: ${user.username}` });
            }
            else {
                return res.status(400).json({ msg: "Password did not match" });
            }
        }
        else {
            console.log("User ID is undefined");
            return res.status(400).json({ msg: "A problem arised with the UserId" });
        }
    }
    catch (error) {
        console.error('Error arised in deleteUser controller:', error);
        return res.status(500).json({ msg: `Something went wrong ${error}` });
    }
});
exports.deleteUser = deleteUser;
function isUsernameAvailable(newUsername, currentUsername) {
    return __awaiter(this, void 0, void 0, function* () {
        // Query the database to check if the new username is already in use
        const existingUser = yield user_1.default.findOne({ username: newUsername });
        // If no user with the new username is found or the found user is the current user, the username is available
        return !existingUser || (existingUser.username === currentUsername);
    });
}
const checkUsername = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.body.newUsername || !req.body.username) {
        return res.status(400).json({ msg: "Please. Pass the usernames to check" });
    }
    const isAvailable = yield isUsernameAvailable(req.body.newUsername, req.body.username);
    if (isAvailable) {
        return res.status(200).json({ isValidUsername: true, msg: "Username is Available." });
    }
    return res.status(400).json({ isValidUsername: false, msg: "Username is not Available." });
});
exports.checkUsername = checkUsername;
// UPDATE USER VALUES 
/**
 *
 * Everything is located in the request body
 * Empty values are handled by the function, so even if you pass only one or none it will work
 * as it should
 * req.body.newUsername
 * req.body.newFullname
 * req.body.newBio
 *
 * This function is able to handle multiple changes and submit them in the end, even if the
 * username is not valid, it will work, only that it'll return that the username change failed
 * but everything else worked fine
 *
 * THIS FUNCTION CAN TAKE SOME SECONDS TO EXECUTE
 */
const modifyUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    // Checks the authorization header and manages if it were to be undefined
    const authorization = (_b = req.headers) === null || _b === void 0 ? void 0 : _b.authorization;
    const userId = (0, user_idExtractor_1.extractId)(authorization);
    // Makes sure that the user passes the parameters for the modifyNames user method
    if (!req.body.newUsername && !req.body.newFullname && !req.body.newBio) {
        return res.status(400).json({ msg: "No parameters passed. No changes to the user", missingParams: "newUsername, newFullname, newBio" });
    }
    try {
        if (userId) {
            const user = yield user_1.default.findOne({ _id: userId });
            if (!user) {
                return res.status(400).json({ msg: 'The user does not exist' });
            }
            var modifiedFields = {
                username: "unchanged",
                bio: "unchanged",
                fullname: "unchanged"
            };
            var changeFail = false;
            // I need to return flags as to what was changed correctly
            if (req.body.newUsername) {
                const isAvailable = yield isUsernameAvailable(req.body.newUsername, user.username);
                if (isAvailable) {
                    yield user.modifyUsername(req.body.newUsername);
                    modifiedFields['username'] = "Changed Successfully!";
                }
                else {
                    modifiedFields['username'] = "Error! Unavailable.";
                    changeFail = true;
                }
            }
            if (req.body.newBio) {
                yield user.modifyBio(req.body.newBio);
                modifiedFields['bio'] = "Changed Successfully!";
            }
            if (req.body.newFullname) {
                yield user.modifyFullname(req.body.newFullname);
                modifiedFields['fullname'] = "Changed Successfully!";
            }
            if (changeFail) {
                // Partial Success Status
                return res.status(207).json({ msg: "Partial Success on the changes", modifiedFields });
            }
            return res.status(200).json({ msg: "Changes were done correctly", modifiedFields });
        }
        else {
            console.log("Used Id is undefined");
            return res.status(400).json({ msg: "A problem arised with the JWT" });
        }
    }
    catch (error) {
        console.error('Error decoding JWT:', error);
        return res.status(500).json({ msg: `Something went wrong ${error}` });
    }
});
exports.modifyUser = modifyUser;
// UPDATE USER PASSWORD
/**
 *
 * Don't you dare pass an empty password
 * req.body.newPassword
 */
const modifyUserPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _c;
    // Checks the authorization header and manages if it were to be undefined
    const authorization = (_c = req.headers) === null || _c === void 0 ? void 0 : _c.authorization;
    const userId = (0, user_idExtractor_1.extractId)(authorization);
    if (!req.body.newPassword) {
        return res.status(400).json({ msg: "Please pass the req.body.newPassword" });
    }
    try {
        // If there is an authorization header and it passed the verification.
        if (userId) {
            const user = yield user_1.default.findOne({ _id: userId });
            if (!user) {
                return res.status(400).json({ msg: 'The user does not exist' });
            }
            const modifiedUser = yield user.modifyPassword(req.body.newPassword);
            if (modifiedUser) {
                return res.status(200).json({ msg: `User ${modifiedUser} modified successfully with New Password` });
            }
            else {
                return res.status(500).json({ msg: "Something went wrong modifying the user" });
            }
        }
        else {
            console.log("User Id is undefined");
            return res.status(400).json({ msg: "A problem arised with the JWT" });
        }
    }
    catch (error) {
        console.error('Error decoding JWT:', error);
        return res.status(500).json({ msg: `Something went wrong ${error}` });
    }
});
exports.modifyUserPassword = modifyUserPassword;
// READ USER DATA
const getUserData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _d;
    // Checks the authorization header and manages if it were to be undefined
    const authorization = (_d = req.headers) === null || _d === void 0 ? void 0 : _d.authorization;
    const userId = (0, user_idExtractor_1.extractId)(authorization);
    try {
        // If there is an authorization header and it passed the verification.
        if (userId) {
            const user = yield user_1.default.findOne({ _id: userId });
            if (!user) {
                return res.status(400).json({ msg: 'The user does not exist' });
            }
            return res.status(200).json({
                msg: "User data sent",
                id: `${user._id}`,
                username: `${user.username}`,
                email: `${user.email}`,
                fullname: `${user.fullname}`,
                bio: `${user.bio}`,
                PFP: `${user.profilePicture}`,
                banner: `${user.bannerPicture}`
            });
        }
        else {
            console.log("User Id is undefined");
            return res.status(400).json({ msg: "A problem arised with the JWT" });
        }
    }
    catch (error) {
        console.error('Error decoding JWT:', error);
        return res.status(500).json({ msg: `Something went wrong ${error}` });
    }
});
exports.getUserData = getUserData;
// FOLLOW USER
/**
 * This function will be in charge of adding a user to its following array, it will also add the
 * same user to the target user's followers array
 *
 * The function uses the userId from the authorization header and req.body.targetUser, which is the
 * targetUser ID, before doing anything, it checks if both users exist.
 */
const followUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _e;
    const authorization = (_e = req.headers) === null || _e === void 0 ? void 0 : _e.authorization;
    const userId = (0, user_idExtractor_1.extractId)(authorization);
    if (!req.body.targetUser) {
        return res.status(400).json({ msg: "Please. Send the target user's ID" });
    }
    try {
        // If there is an authorization header and it passed the verification.
        if (userId) {
            const user = yield user_1.default.findOne({ _id: userId });
            if (!user) {
                return res.status(400).json({ msg: 'The user does not exist' });
            }
            const targetUser = yield user_1.default.findOne({ _id: req.body.targetUser });
            if (!targetUser) {
                return res.status(400).json({ msg: 'The target user does not exist' });
            }
            const isFollowing = yield user.isFollowing(req.body.targetUser);
            if (isFollowing) {
                return res.status(400).json({ msg: 'The target user is already followed by the user' });
            }
            user.followUser(req.body.targetUser);
            targetUser.addFollower(userId);
            return res.status(200).json({ msg: "User followed and added successfully" });
        }
        else {
            console.log("User Id is undefined");
            return res.status(400).json({ msg: "A problem arised with the JWT" });
        }
    }
    catch (error) {
        console.error('Error decoding JWT:', error);
        return res.status(500).json({ msg: `Something went wrong ${error}` });
    }
});
exports.followUser = followUser;
// UNFOLLOW USER
/**
 * It will do the same as the previous function but backwards, it will remove the user from both
 * arrays.
 */
const unfollowUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _f;
    const authorization = (_f = req.headers) === null || _f === void 0 ? void 0 : _f.authorization;
    const userId = (0, user_idExtractor_1.extractId)(authorization);
    if (!req.body.targetUser) {
        return res.status(400).json({ msg: "Please. Send the target user's ID" });
    }
    try {
        // If there is an authorization header and it passed the verification.
        if (userId) {
            const user = yield user_1.default.findOne({ _id: userId });
            if (!user) {
                return res.status(400).json({ msg: 'The user does not exist' });
            }
            const targetUser = yield user_1.default.findOne({ _id: req.body.targetUser });
            if (!targetUser) {
                return res.status(400).json({ msg: 'The target user does not exist' });
            }
            const isFollowing = yield user.isFollowing(req.body.targetUser);
            if (!isFollowing) {
                return res.status(400).json({ msg: 'The target user is not followed by the user' });
            }
            user.unfollowUser(req.body.targetUser);
            targetUser.removeFollower(userId);
            return res.status(200).json({ msg: "User unfollowed and removed successfully" });
        }
        else {
            console.log("User Id is undefined");
            return res.status(400).json({ msg: "A problem arised with the JWT" });
        }
    }
    catch (error) {
        console.error('Error decoding JWT:', error);
        return res.status(500).json({ msg: `Something went wrong ${error}` });
    }
});
exports.unfollowUser = unfollowUser;
const fuzzySearchUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _g;
    const authorization = (_g = req.headers) === null || _g === void 0 ? void 0 : _g.authorization;
    const userId = (0, user_idExtractor_1.extractId)(authorization);
    if (!req.body.username) {
        return res.status(400).json({ msg: "Please. Provide with the username to search" });
    }
    const user = yield user_1.default.findOne({ _id: userId });
    if (!user) {
        return res.status(400).json({ msg: 'The user does not exist' });
    }
    const allUsers = yield user_1.default.find({}, 'username fullname profilePicture bio');
    const results = fuzzy.filter(req.body.username, allUsers, { extract: user => user.username });
    // Extract matched users from the fuzzy matching results
    const matchedUsers = results.map(result => result.original);
    return res.status(200).json({ msg: "Users sent", users: matchedUsers });
});
exports.fuzzySearchUsers = fuzzySearchUsers;
