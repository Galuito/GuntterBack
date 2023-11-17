"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Son las rutas que aparentemente solo los usuarios autenticados van a poder acceder 
const express_1 = require("express");
const router = (0, express_1.Router)();
const user_controller_1 = require("../controllers/user.controller");
const passport_1 = __importDefault(require("passport"));
const goont_controller_1 = require("../controllers/goont.controller");
// Use this to test things sent and received
router.post('/testerroute', passport_1.default.authenticate('jwt', { session: false }), user_controller_1.testerController);
// User Routes
// - DELETE ROUTE
router.delete('/deleteuser', passport_1.default.authenticate('jwt', { session: false }), user_controller_1.deleteUser);
// - MODIFY ROUTES
router.put('/modifyuser', passport_1.default.authenticate('jwt', { session: false }), user_controller_1.modifyUser);
router.put('/modifyuserpassword', passport_1.default.authenticate('jwt', { session: false }), user_controller_1.modifyUserPassword);
// - GET ROUTES
router.post('/checkusername', passport_1.default.authenticate('jwt', { session: false }), user_controller_1.checkUsername);
router.post('/getuserdata', passport_1.default.authenticate('jwt', { session: false }), user_controller_1.getUserData);
router.put('/followuser', passport_1.default.authenticate('jwt', { session: false }), user_controller_1.followUser);
router.put('/unfollowuser', passport_1.default.authenticate('jwt', { session: false }), user_controller_1.unfollowUser);
// Goont Routes
// - CREATE ROUTES
router.post('/creategoont', passport_1.default.authenticate('jwt', { session: false }), goont_controller_1.createGoont);
router.post('/replygoont', passport_1.default.authenticate('jwt', { session: false }), goont_controller_1.createReply);
// - MODIFY ROUTES
router.put('/modifygoont', passport_1.default.authenticate('jwt', { session: false }), goont_controller_1.modifyContent);
router.put('/likegoont', passport_1.default.authenticate('jwt', { session: false }), goont_controller_1.likeGoont);
router.put('/unlikegoont', passport_1.default.authenticate('jwt', { session: false }), goont_controller_1.unlikeGoont);
// - DELETE ROUTES
router.delete('/deletegoont', passport_1.default.authenticate('jwt', { session: false }), goont_controller_1.deleteGoont);
exports.default = router;
