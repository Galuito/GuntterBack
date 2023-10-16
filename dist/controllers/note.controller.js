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
exports.getNoFolderNotes = exports.getFolderNotes = exports.createNote = void 0;
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
    if (!req.body.folder) {
        return res.status(400).json({ msg: "No folder was passed" });
    }
    const folder = yield folder_1.default.findOne({ _id: req.body.folder });
    if (!folder) {
        return res.status(400).json({ msg: "There's no folder by the sent ID" });
    }
    const notes = yield note_1.default.find({ noteFolder: req.body.folder });
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
