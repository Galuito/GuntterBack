// Son las rutas que aparentemente solo los usuarios autenticados van a poder acceder 
import {Router} from 'express';
const router = Router();

import { checkUsername, deleteUser, followUser, getUserData, modifyUser, modifyUserPassword, testerController, unfollowUser } from '../controllers/user.controller';
import passport from 'passport';
import { createGoont, createReply, deleteGoont, likeGoont, modifyContent, unlikeGoont } from '../controllers/goont.controller';

// Use this to test things sent and received
router.post('/testerroute', passport.authenticate('jwt', {session: false}), testerController);

// User Routes
// - DELETE ROUTE
router.delete('/deleteuser', passport.authenticate('jwt', {session: false}), deleteUser);

// - MODIFY ROUTES
router.put('/modifyuser', passport.authenticate('jwt', {session: false}), modifyUser);
router.put('/modifyuserpassword', passport.authenticate('jwt', {session: false}), modifyUserPassword);

// - GET ROUTES
router.post('/checkusername', passport.authenticate('jwt', {session: false}), checkUsername);
router.post('/getuserdata', passport.authenticate('jwt', {session: false}), getUserData);
router.put('/followuser', passport.authenticate('jwt', {session: false}), followUser);
router.put('/unfollowuser', passport.authenticate('jwt', {session: false}), unfollowUser);


// Goont Routes

// - CREATE ROUTES
router.post('/creategoont', passport.authenticate('jwt', {session: false}), createGoont);
router.post('/replygoont', passport.authenticate('jwt', {session: false}), createReply);

// - MODIFY ROUTES
router.put('/modifygoont', passport.authenticate('jwt', {session: false}), modifyContent);
router.put('/likegoont', passport.authenticate('jwt', {session: false}), likeGoont);
router.put('/unlikegoont', passport.authenticate('jwt', {session: false}), unlikeGoont);

// - DELETE ROUTES
router.delete('/deletegoont', passport.authenticate('jwt', {session: false}), deleteGoont);

export default router;