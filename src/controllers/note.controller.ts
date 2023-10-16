import {Request, Response} from 'express'
import Note from '../models/note';
import User from '../models/user';
import Folder from '../models/folder'
import { extractId } from './user.idExtractor';

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
export const createNote = async(req:Request, res:Response) =>{
  const noteName = req.body.noteName || "Nueva Nota";
  const noteDescription = req.body.noteDescription || " ";
  const noteColor = req.body.noteColor || "E2DCC6"; // Hexadecimal for "Color Caqui Claro"
  // FolderId has to be parsed so that the note doesn't get inserted into an unexisting folder

  
  const authorization: string | undefined = req.headers?.authorization;
  const userId = extractId(authorization);
  
  const user = await User.findOne({ _id: userId});
  if(!user){
    return res.status(400).json({msg: `No user by the ID: ${userId}`});
  }
  
  if(req.body.noteFolder){
    const folder = await Folder.findOne({_id:req.body.noteFolder});
    if(!folder){
      console.error("The folder doesn't exist");
      req.body.noteFolder = undefined;
    }
    // @ts-ignore
    else if(!(userId == folder.folderOwner)){
      return res.status(400).json({msg: "The user is not the owner of the folder"})
    }
  }
  

  // If req.body.noteFolder is undefined then it won't matter because it is not required.
  const noteData = {
    title: noteName,
    desc: noteDescription,
    noteFolder: req.body.noteFolder,
    color: noteColor,
    noteOwner: userId
  }

  const newNote = new Note(noteData);
  await newNote.save();

  // Return status 201, alongside with the created new folder for folderOwner
  return res.status(201).json(newNote);
}

// GET NOTES FROM FOLDER
export const getFolderNotes = async (req: Request, res: Response)=>{
  if(!req.body.folderId){
    return res.status(400).json({msg:"No folder ID was passed"});
  }

  const folder = await Folder.findOne({_id:req.body.folderId})
  if(!folder){
    return res.status(400).json({msg: "There's no folder by the sent ID"});
  }

  const notes = await Note.find({noteFolder:req.body.folderId});

  return res.status(200).json(notes);
}

// GET NOTES THAT HAVE NO FOLDER
export const getNoFolderNotes = async (req: Request, res: Response) =>{
  const authorization: string | undefined = req.headers?.authorization;
  const userId = extractId(authorization);

  const user = await User.findOne({_id:userId})
  if(!user){
    return res.status(400).json({msg: "No user by the sent ID"})
  }

  const notes = await Note.find({noteOwner:userId, noteFolder:null})

  return res.status(200).json(notes);
}

// DELETE ONE NOTE BY ITS ID
export const deleteNoteById = async (req: Request, res: Response) =>{
  if(!req.body.noteId){
    return res.status(400).json({msg: "No note ID was sent"})
  }

  await Note.deleteOne({_id:req.body.noteId});
  return res.status(200).json({msg: "Note deleted"});
}

// DELETE ALL FOLDER NOTES
export const deleteFolderNotes = async (req: Request, res: Response) =>{
  if(!req.body.folderId){
    return res.status(400).json({msg: "No folder ID was sent"})
  }

  const folder = await Folder.findOne({_id:req.body.folderId})
  if(!folder){
    return res.status(400).json({msg: "No folder by the sent ID"})
  }

  await Note.deleteMany({noteFolder:req.body.folderId});
  return res.status(200).json({msg:`All notes from folder  ${folder.folderName} were deleted`})

}

// DELETE ALL USER NOTES
export const deleteUserNotes = async (req: Request, res: Response) =>{
  const authorization: string | undefined = req.headers?.authorization;
  const userId = extractId(authorization);

  const user = await User.findOne({_id:userId})
  if(!user){
    return res.status(400).json({msg: "No user by the sent ID"})
  }

  await Note.deleteMany({noteOwner:userId});
  return res.status(200).json({msg:`All notes from user ${user.username} were deleted`})
}

// MODIFY NOTE TITLE
export const modifyNoteTitle = async (req: Request, res: Response) =>{
  if(!req.body.noteId){
    return res.status(400).json({msg: "No noteId was sent"});
  }
  if(!req.body.newTitle){
    return res.status(400).json({msg: "No title was sent"});
  }

  const note = await Note.findOne({_id:req.body.noteId});
  if(!note){
    return res.status(400).json({msg: "The note does not exist"});
  }

  const modifiedNote = await note.modifyTitle(req.body.newTitle);
  if(modifiedNote){
    return res.status(200).json({msg:`User ${note.noteOwner} modified note successfully with new title: ${req.body.newTitle}`});
  }else{
    return res.status(500).json({msg:"Something went wrong modifying the note title"})
  }
}

// MODIFY NOTE DESCRIPTION (CONTENT)
export const modifyNoteContent = async (req: Request, res: Response) =>{
  if(!req.body.noteId){
    return res.status(400).json({msg: "No noteId was sent"});
  }
  if(!req.body.newContent){
    req.body.newContent = " ";
  }

  const note = await Note.findOne({_id:req.body.noteId});
  if(!note){
    return res.status(400).json({msg: "The note does not exist"});
  }

  const modifiedNote = await note.modifyContent(req.body.newContent);
  if(modifiedNote){
    return res.status(200).json({msg:`User ${note.noteOwner} modified note successfully with new content: [NOT PRINTED]`});
  }else{
    return res.status(500).json({msg:"Something went wrong modifying the note content"})
  }
}

// MODIFY NOTE FOLDER
export const modifyNoteFolder = async (req: Request, res: Response) =>{
  if(!req.body.noteId){
    return res.status(400).json({msg: "No noteId was sent"});
  }

  // Folder can be undefined to retire it from all folders and put it in general.
  // Because of how this will be handled I consider it better to branch it into two possible scenarios

  const note = await Note.findOne({_id:req.body.noteId});
  if(!note){
    return res.status(400).json({msg: "The note does not exist"});
  }

  if(!req.body.newFolder){
    // In case none is sent.
    const modifiedNote = await note.removeFolder();
    if(modifiedNote){
      return res.status(200).json({msg:`User ${note.noteOwner} removed folder from note ${modifiedNote}`});
    }else{
      return res.status(500).json({msg:"Something went wrong modifying the note folder"})
    }

  }
  else{
    // In case a folder is sent
    const folder = await Folder.findOne({_id:req.body.newFolder});
    if(!folder){
      return res.status(400).json({msg:"There's no folder by the sent ID"})
    }
    const modifiedNote = await note.changeFolder(req.body.newFolder);
    if(modifiedNote){
      return res.status(200).json({msg:`User ${note.noteOwner} changed folder from note ${modifiedNote}`});
    }else{
      return res.status(500).json({msg:"Something went wrong modifying the note folder"})
    }
  }
}


// MODIFY NOTE COLOR
export const modifyNoteColor = async (req: Request, res: Response) =>{
  if(!req.body.noteId){
    return res.status(400).json({msg: "No noteId was sent"});
  }
  if(!req.body.newColor){
    return res.status(400).json({msg: "No color was sent"});
  }

  const note = await Note.findOne({_id:req.body.noteId});
  if(!note){
    return res.status(400).json({msg: "The note does not exist"});
  }

  const modifiedNote = await note.modifyColor(req.body.newColor);
  if(modifiedNote){
    return res.status(200).json({msg:`User ${note.noteOwner} modified the color of note ${note.title}`});
  }else{
    return res.status(500).json({msg:"Something went wrong modifying the note color"})
  }
}