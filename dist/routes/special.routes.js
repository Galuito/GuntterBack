"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Son las rutas que aparentemente solo los usuarios autenticados van a poder acceder 
const express_1 = require("express");
const router = (0, express_1.Router)();
const user_controller_1 = require("../controllers/user.controller");
const folder_controller_1 = require("../controllers/folder.controller");
const note_controller_1 = require("../controllers/note.controller");
const passport_1 = __importDefault(require("passport"));
// User Routes
router.delete('/deleteuser', passport_1.default.authenticate('jwt', { session: false }), user_controller_1.deleteUser);
router.put('/modifyusernames', passport_1.default.authenticate('jwt', { session: false }), user_controller_1.modifyUserNames);
router.put('/modifyuserpassword', passport_1.default.authenticate('jwt', { session: false }), user_controller_1.modifyUserPassword);
router.get('/getuserdata', passport_1.default.authenticate('jwt', { session: false }), user_controller_1.getUserData);
// Delete this one once you are done
router.post('/testerroute', passport_1.default.authenticate('jwt', { session: false }), user_controller_1.testerRoute);
// Folder Routes
router.post('/createfolder', passport_1.default.authenticate('jwt', { session: false }), folder_controller_1.createFolder);
router.put('/modifyfoldername', passport_1.default.authenticate('jwt', { session: false }), folder_controller_1.changeFolderName);
router.get('/getuserfolders', passport_1.default.authenticate('jwt', { session: false }), folder_controller_1.getUserFolders);
router.delete('/deletefolder', passport_1.default.authenticate('jwt', { session: false }), folder_controller_1.deleteFolder);
router.delete('/deleteallfolders', passport_1.default.authenticate('jwt', { session: false }), folder_controller_1.deleteAllFolders);
// Note Routes
router.post('/createnote', passport_1.default.authenticate('jwt', { session: false }), note_controller_1.createNote);
router.get('/getfoldernotes', passport_1.default.authenticate('jwt', { session: false }), note_controller_1.getFolderNotes);
router.get('/getnofoldernotes', passport_1.default.authenticate('jwt', { session: false }), note_controller_1.getNoFolderNotes);
exports.default = router;
