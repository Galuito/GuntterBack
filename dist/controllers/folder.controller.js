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
exports.createFolder = void 0;
const folder_1 = __importDefault(require("../models/folder"));
const user_1 = __importDefault(require("../models/user"));
/**
 * req.body must only have:
 * req.body.folderName
 * req.body.folderOwner (ObjectId)
 */
const createFolder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.body.folderOwner) {
        return res.status(400).json({ msg: 'User ID not received' });
    }
    const user = yield user_1.default.findOne({ _id: req.body.folderOwner });
    console.log("createFolder executed by: ", user);
    if (!user) {
        return res.status(400).json({ msg: `No user by the ID: ${req.body.folderOwner}` });
    }
    const newFolder = new folder_1.default(req.body);
    yield newFolder.save();
    // Return status 201, alongside with the created new folder for folderOwner
    return res.status(201).json(newFolder);
});
exports.createFolder = createFolder;
