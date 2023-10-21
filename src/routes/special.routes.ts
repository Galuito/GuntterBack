// Son las rutas que aparentemente solo los usuarios autenticados van a poder acceder 
import {Router} from 'express';
const router = Router();

import { deleteUser, getUserData, modifyUserNames, modifyUserPassword, testerRoute } from '../controllers/user.controller';
import {changeFolderName, createFolder, deleteUserFolders, deleteFolder, getUserFolders} from '../controllers/folder.controller';
import { createNote, deleteFolderNotes, deleteNoteById, deleteUserNotes, getFolderNotes, getNoFolderNotes, modifyNoteColor, modifyNoteContent, modifyNoteFolder, modifyNoteTitle } from '../controllers/note.controller';
import passport from 'passport';

// User Routes
router.delete('/deleteuser', passport.authenticate('jwt', {session: false}), deleteUser);

router.put('/modifyusernames', passport.authenticate('jwt', {session: false}), modifyUserNames);
router.put('/modifyuserpassword', passport.authenticate('jwt', {session: false}), modifyUserPassword);

// Were get requests but had to be changed at the last hour >:(
router.post('/getuserdata', passport.authenticate('jwt', {session: false}), getUserData);

// Delete this one once you are done
router.post('/testerroute', passport.authenticate('jwt', {session: false}), testerRoute);


// Folder Routes
router.post('/createfolder', passport.authenticate('jwt', {session: false}), createFolder);

router.put('/modifyfoldername', passport.authenticate('jwt', {session: false}), changeFolderName);

// Were get requests but had to be changed at the last hour >:(
router.post('/getuserfolders', passport.authenticate('jwt', {session: false}), getUserFolders);

router.delete('/deletefolder', passport.authenticate('jwt', {session: false}), deleteFolder);
router.delete('/deleteallfolders', passport.authenticate('jwt', {session: false}), deleteUserFolders);

// Note Routes
router.post('/createnote',passport.authenticate('jwt', {session: false}), createNote);

// Were get requests but had to be changed at the last hour >:(
router.post('/getfoldernotes',passport.authenticate('jwt', {session: false}), getFolderNotes);
router.post('/getnofoldernotes',passport.authenticate('jwt', {session: false}), getNoFolderNotes);

router.delete('/deletenoteid',passport.authenticate('jwt', {session: false}), deleteNoteById);
router.delete('/deletefoldernotes',passport.authenticate('jwt', {session: false}), deleteFolderNotes);
router.delete('/deleteusernotes',passport.authenticate('jwt', {session: false}), deleteUserNotes);

router.put('/modifynotetitle', passport.authenticate('jwt', {session: false}), modifyNoteTitle);
router.put('/modifynotecontent', passport.authenticate('jwt', {session: false}), modifyNoteContent);
router.put('/modifynotefolder', passport.authenticate('jwt', {session: false}), modifyNoteFolder);
router.put('/modifynotecolor', passport.authenticate('jwt', {session: false}), modifyNoteColor);

export default router;