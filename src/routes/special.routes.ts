// Son las rutas que aparentemente solo los usuarios autenticados van a poder acceder 
import {Router} from 'express';
const router = Router();

import { deleteUser, getUserData, modifyNames, modifyPassword, testerRoute } from '../controllers/user.controller';
import {createFolder} from '../controllers/folder.controller';
import passport from 'passport';

router.get('/special', passport.authenticate('jwt', {session: false}), (req, res) =>{
  // Placeholder method that isn't inside the controller
  res.status(200).json({msg: 'Success reaching the special route'});
});

// User Routes
// Delete this one once you are done
router.post('/testerroute', passport.authenticate('jwt', {session: false}), testerRoute);
router.delete('/deleteuser', passport.authenticate('jwt', {session: false}), deleteUser);
router.put('/modifyusernames', passport.authenticate('jwt', {session: false}), modifyNames);
router.put('/modifyuserpassword', passport.authenticate('jwt', {session: false}), modifyPassword);

router.get('/getuserdata', passport.authenticate('jwt', {session: false}), getUserData);

// Folder Routes
router.post('/createfolder', passport.authenticate('jwt', {session: false}), createFolder);

export default router;