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
exports.modifyNoteColor = exports.modifyNoteFolder = exports.modifyNoteContent = exports.modifyNoteTitle = exports.deleteUserNotes = exports.deleteFolderNotes = exports.deleteNoteById = exports.getNoFolderNotes = exports.getFolderNotes = exports.createNote = void 0;
const note_1 = __importDefault(require("../models/note"));
const user_1 = __importDefault(require("../models/user"));
const folder_1 = __importDefault(require("../models/folder"));
const user_idExtractor_1 = require("./user.idExtractor");
/**
 * The description essentially needs to be empty with at least one blank character, this will be taken
 * into consideration in the future when making the change description function, so that, if nothing were
 * to be passed then 1 white space would be inserted into the description and it wouldn't be empty
 * therefore, not breaking the Schema designed in the models
 */
// CREATE NOTE
/**
 * req.body must only have:
 * folder ObjectId (OPTIONAL)
 * noteName (OPTIONAL)
 * noteDescription (OPTIONAL)
 * noteColor (OPTIONAL)
 */
const createNote = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const noteName = req.body.noteName || "Nueva Nota";
    const noteDescription = req.body.noteDescription || " ";
    const noteColor = req.body.noteColor || "E2DCC6"; // Hexadecimal for "Color Caqui Claro"
    // FolderId has to be parsed so that the note doesn't get inserted into an unexisting folder
    const authorization = (_a = req.headers) === null || _a === void 0 ? void 0 : _a.authorization;
    const userId = (0, user_idExtractor_1.extractId)(authorization);
    const user = yield user_1.default.findOne({ _id: userId });
    if (!user) {
        return res.status(400).json({ msg: `No user by the ID: ${userId}` });
    }
    if (req.body.noteFolder) {
        const folder = yield folder_1.default.findOne({ _id: req.body.noteFolder });
        if (!folder) {
            console.error("The folder doesn't exist");
            req.body.noteFolder = undefined;
        }
        // @ts-ignore
        else if (!(userId == folder.folderOwner)) {
            return res.status(400).json({ msg: "The user is not the owner of the folder" });
        }
    }
    // If req.body.noteFolder is undefined then it won't matter because it is not required.
    const noteData = {
        title: noteName,
        desc: noteDescription,
        noteFolder: req.body.noteFolder,
        color: noteColor,
        noteOwner: userId
    };
    const newNote = new note_1.default(noteData);
    yield newNote.save();
    // Return status 201, alongside with the created new folder for folderOwner
    return res.status(201).json(newNote);
});
exports.createNote = createNote;
// GET NOTES FROM FOLDER
const getFolderNotes = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.body.folderId) {
        return res.status(400).json({ msg: "No folder ID was passed" });
    }
    const folder = yield folder_1.default.findOne({ _id: req.body.folderId });
    if (!folder) {
        return res.status(400).json({ msg: "There's no folder by the sent ID" });
    }
    const notes = yield note_1.default.find({ noteFolder: req.body.folderId });
    return res.status(200).json(notes);
});
exports.getFolderNotes = getFolderNotes;
// GET NOTES THAT HAVE NO FOLDER
const getNoFolderNotes = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    const authorization = (_b = req.headers) === null || _b === void 0 ? void 0 : _b.authorization;
    const userId = (0, user_idExtractor_1.extractId)(authorization);
    const user = yield user_1.default.findOne({ _id: userId });
    if (!user) {
        return res.status(400).json({ msg: "No user by the sent ID" });
    }
    const notes = yield note_1.default.find({ noteOwner: userId, noteFolder: null });
    return res.status(200).json(notes);
});
exports.getNoFolderNotes = getNoFolderNotes;
// DELETE ONE NOTE BY ITS ID
const deleteNoteById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.body.noteId) {
        return res.status(400).json({ msg: "No note ID was sent" });
    }
    yield note_1.default.deleteOne({ _id: req.body.noteId });
    return res.status(200).json({ msg: "Note deleted" });
});
exports.deleteNoteById = deleteNoteById;
// DELETE ALL FOLDER NOTES
const deleteFolderNotes = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.body.folderId) {
        return res.status(400).json({ msg: "No folder ID was sent" });
    }
    const folder = yield folder_1.default.findOne({ _id: req.body.folderId });
    if (!folder) {
        return res.status(400).json({ msg: "No folder by the sent ID" });
    }
    yield note_1.default.deleteMany({ noteFolder: req.body.folderId });
    return res.status(200).json({ msg: `All notes from folder  ${folder.folderName} were deleted` });
});
exports.deleteFolderNotes = deleteFolderNotes;
// DELETE ALL USER NOTES
const deleteUserNotes = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _c;
    const authorization = (_c = req.headers) === null || _c === void 0 ? void 0 : _c.authorization;
    const userId = (0, user_idExtractor_1.extractId)(authorization);
    const user = yield user_1.default.findOne({ _id: userId });
    if (!user) {
        return res.status(400).json({ msg: "No user by the sent ID" });
    }
    yield note_1.default.deleteMany({ noteOwner: userId });
    return res.status(200).json({ msg: `All notes from user ${user.username} were deleted` });
});
exports.deleteUserNotes = deleteUserNotes;
// MODIFY NOTE TITLE
const modifyNoteTitle = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.body.noteId) {
        return res.status(400).json({ msg: "No noteId was sent" });
    }
    if (!req.body.newTitle) {
        return res.status(400).json({ msg: "No title was sent" });
    }
    const note = yield note_1.default.findOne({ _id: req.body.noteId });
    if (!note) {
        return res.status(400).json({ msg: "The note does not exist" });
    }
    const modifiedNote = yield note.modifyTitle(req.body.newTitle);
    if (modifiedNote) {
        return res.status(200).json({ msg: `User ${note.noteOwner} modified note successfully with new title: ${req.body.newTitle}` });
    }
    else {
        return res.status(500).json({ msg: "Something went wrong modifying the note title" });
    }
});
exports.modifyNoteTitle = modifyNoteTitle;
// MODIFY NOTE DESCRIPTION (CONTENT)
const modifyNoteContent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.body.noteId) {
        return res.status(400).json({ msg: "No noteId was sent" });
    }
    if (!req.body.newContent) {
        req.body.newContent = " ";
    }
    const note = yield note_1.default.findOne({ _id: req.body.noteId });
    if (!note) {
        return res.status(400).json({ msg: "The note does not exist" });
    }
    const modifiedNote = yield note.modifyContent(req.body.newContent);
    if (modifiedNote) {
        return res.status(200).json({ msg: `User ${note.noteOwner} modified note successfully with new content: [NOT PRINTED]` });
    }
    else {
        return res.status(500).json({ msg: "Something went wrong modifying the note content" });
    }
});
exports.modifyNoteContent = modifyNoteContent;
// MODIFY NOTE FOLDER
const modifyNoteFolder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.body.noteId) {
        return res.status(400).json({ msg: "No noteId was sent" });
    }
    // Folder can be undefined to retire it from all folders and put it in general.
    // Because of how this will be handled I consider it better to branch it into two possible scenarios
    const note = yield note_1.default.findOne({ _id: req.body.noteId });
    if (!note) {
        return res.status(400).json({ msg: "The note does not exist" });
    }
    if (!req.body.newFolder) {
        // In case none is sent.
        const modifiedNote = yield note.removeFolder();
        if (modifiedNote) {
            return res.status(200).json({ msg: `User ${note.noteOwner} removed folder from note ${modifiedNote}` });
        }
        else {
            return res.status(500).json({ msg: "Something went wrong modifying the note folder" });
        }
    }
    else {
        // In case a folder is sent
        const folder = yield folder_1.default.findOne({ _id: req.body.newFolder });
        if (!folder) {
            return res.status(400).json({ msg: "There's no folder by the sent ID" });
        }
        const modifiedNote = yield note.changeFolder(req.body.newFolder);
        if (modifiedNote) {
            return res.status(200).json({ msg: `User ${note.noteOwner} changed folder from note ${modifiedNote}` });
        }
        else {
            return res.status(500).json({ msg: "Something went wrong modifying the note folder" });
        }
    }
});
exports.modifyNoteFolder = modifyNoteFolder;
// MODIFY NOTE COLOR
const modifyNoteColor = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.body.noteId) {
        return res.status(400).json({ msg: "No noteId was sent" });
    }
    if (!req.body.newColor) {
        return res.status(400).json({ msg: "No color was sent" });
    }
    const note = yield note_1.default.findOne({ _id: req.body.noteId });
    if (!note) {
        return res.status(400).json({ msg: "The note does not exist" });
    }
    const modifiedNote = yield note.modifyColor(req.body.newColor);
    if (modifiedNote) {
        return res.status(200).json({ msg: `User ${note.noteOwner} modified the color of note ${note.title}` });
    }
    else {
        return res.status(500).json({ msg: "Something went wrong modifying the note color" });
    }
});
exports.modifyNoteColor = modifyNoteColor;
