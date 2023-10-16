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
exports.deleteUserFolders = exports.deleteFolder = exports.getUserFolders = exports.changeFolderName = exports.createFolder = void 0;
const folder_1 = __importDefault(require("../models/folder"));
const user_1 = __importDefault(require("../models/user"));
const user_idExtractor_1 = require("./user.idExtractor");
// CREATE FOLDER
/**
 * req.body must only have:
 * req.body.folderName (OPTIONAL if not passed it'll be "New Folder")
 * The folder owner is extracted from the Authorization header and is then inserted into a creation JSON
 */
const createFolder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const folderName = req.body.folderName || 'Nueva Coleccion';
    const authorization = (_a = req.headers) === null || _a === void 0 ? void 0 : _a.authorization;
    const userId = (0, user_idExtractor_1.extractId)(authorization);
    const user = yield user_1.default.findOne({ _id: userId });
    if (!user) {
        return res.status(400).json({ msg: `No user by the ID: ${userId}` });
    }
    console.log("createFolder executed by:", user.username);
    const folderData = {
        folderOwner: userId,
        folderName: folderName
    };
    const newFolder = new folder_1.default(folderData);
    yield newFolder.save();
    // Return status 201, alongside with the created new folder for folderOwner
    return res.status(201).json(newFolder);
});
exports.createFolder = createFolder;
// UPDATE FOLDER NAME
/**
 * req.body must have:
 * req.body.folderId
 * req.body.newFolderName
 */
const changeFolderName = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.body.folderId) {
        return res.status(400).json({ msg: "No Folder Id was received." });
    }
    if (!req.body.newFolderName) {
        return res.status(400).json({ msg: "No New Folder Name was received" });
    }
    const folder = yield folder_1.default.findOne({ _id: req.body.folderId });
    if (!folder) {
        return res.status(400).json({ msg: `No folder with id ${req.body.folderId}` });
    }
    // folder id
    const modifiedFolder = yield folder.modifyName(req.body.newFolderName);
    if (modifiedFolder) {
        return res.status(200).json({ msg: `Folder ${modifiedFolder} modified successfully with Name: ${req.body.newFolderName}` });
    }
    else {
        return res.status(500).json({ msg: "Something went wrong modifying the user" });
    }
});
exports.changeFolderName = changeFolderName;
// READ ALL USER FOLDERS
/**
 * For this one you don't have to pass nothing to the body, it'll be done using the authorization
 */
const getUserFolders = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    const authorization = (_b = req.headers) === null || _b === void 0 ? void 0 : _b.authorization;
    const userId = (0, user_idExtractor_1.extractId)(authorization);
    const user = yield user_1.default.findOne({ _id: userId });
    if (!user) {
        return res.status(400).json({ msg: `No user by the ID: ${userId}` });
    }
    const folders = yield folder_1.default.find({ folderOwner: userId });
    res.status(200).json(folders);
});
exports.getUserFolders = getUserFolders;
// DELETE ONE FOLDER BY ID
const deleteFolder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _c;
    if (!req.body.folderId) {
        return res.status(400).json({ msg: "No folder ID was received" });
    }
    const authorization = (_c = req.headers) === null || _c === void 0 ? void 0 : _c.authorization;
    const userId = (0, user_idExtractor_1.extractId)(authorization);
    const folder = yield folder_1.default.findOne({ _id: req.body.folderId });
    if (!folder) {
        return res.status(400).json({ msg: `No folder by the ID:${req.body.folderId}` });
    }
    // Una string si puede ser comparada a un objectId pero TypeScript se puso poppy y dijo que no se puede ¬¬
    // @ts-ignore
    if (folder.folderOwner == userId) {
        yield folder_1.default.deleteOne({ _id: req.body.folderId });
        return res.status(200).json({ msg: `Deleted Folder with folderId: ${req.body.folderId}` });
    }
    else {
        return res.status(400).json({ msg: "This user is not the owner of the folder to delete" });
    }
});
exports.deleteFolder = deleteFolder;
// DELETE ALL FOLDERS BY USER ID
const deleteUserFolders = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _d;
    const authorization = (_d = req.headers) === null || _d === void 0 ? void 0 : _d.authorization;
    const userId = (0, user_idExtractor_1.extractId)(authorization);
    const user = yield user_1.default.findOne({ _id: userId });
    if (!user) {
        return res.status(400).json({ msg: `No user by the ID: ${userId}` });
    }
    yield folder_1.default.deleteMany({ folderOwner: userId });
    return res.status(200).json({ msg: `All folders from user ${user.username} were deleted` });
});
exports.deleteUserFolders = deleteUserFolders;
