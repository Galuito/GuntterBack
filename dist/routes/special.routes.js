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
const passport_1 = __importDefault(require("passport"));
router.get('/special', passport_1.default.authenticate('jwt', { session: false }), (req, res) => {
    // Placeholder method that isn't inside the controller
    res.status(200).json({ msg: 'Success reaching the special route' });
});
// User Routes
// Delete this one once you are done
router.post('/testerroute', passport_1.default.authenticate('jwt', { session: false }), user_controller_1.testerRoute);
router.delete('/deleteuser', passport_1.default.authenticate('jwt', { session: false }), user_controller_1.deleteUser);
router.put('/modifyusernames', passport_1.default.authenticate('jwt', { session: false }), user_controller_1.modifyNames);
router.put('/modifyuserpassword', passport_1.default.authenticate('jwt', { session: false }), user_controller_1.modifyPassword);
router.get('/getuserdata', passport_1.default.authenticate('jwt', { session: false }), user_controller_1.getUserData);
// Folder Routes
router.post('/createfolder', passport_1.default.authenticate('jwt', { session: false }), folder_controller_1.createFolder);
exports.default = router;
