// Son las rutas que aparentemente solo los usuarios autenticados van a poder acceder 
import {Router} from 'express';
const router = Router();

import { deleteUser, getUserData, modifyUserNames, modifyUserPassword, testerRoute } from '../controllers/user.controller';
import {changeFolderName, createFolder, deleteAllFolders, deleteFolder, getUserFolders} from '../controllers/folder.controller';
import passport from 'passport';

router.get('/special', passport.authenticate('jwt', {session: false}), (req, res) =>{
  // Placeholder method that isn't inside the controller
  res.status(200).json({msg: 'Success reaching the special route'});
});

// User Routes
router.delete('/deleteuser', passport.authenticate('jwt', {session: false}), deleteUser);
router.put('/modifyusernames', passport.authenticate('jwt', {session: false}), modifyUserNames);
router.put('/modifyuserpassword', passport.authenticate('jwt', {session: false}), modifyUserPassword);
router.get('/getuserdata', passport.authenticate('jwt', {session: false}), getUserData);

// Delete this one once you are done
router.post('/testerroute', passport.authenticate('jwt', {session: false}), testerRoute);


// Folder Routes
router.post('/createfolder', passport.authenticate('jwt', {session: false}), createFolder);
router.put('/modifyfoldername', passport.authenticate('jwt', {session: false}), changeFolderName);
router.get('/getuserfolders', passport.authenticate('jwt', {session: false}), getUserFolders);
router.delete('/deletefolder', passport.authenticate('jwt', {session: false}), deleteFolder);
router.delete('/deleteallfolders', passport.authenticate('jwt', {session: false}), deleteAllFolders);

// Note Routes


export default router;