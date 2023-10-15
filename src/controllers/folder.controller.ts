import {Request, Response} from 'express'
import Folder, {IFolder} from '../models/folder';
import User from '../models/user';

/**
 * req.body must only have:
 * req.body.folderName
 * req.body.folderOwner (ObjectId)
 */
export const createFolder = async (req: Request, res: Response) =>{
  if (!req.body.folderOwner){
    return res.status(400).json({msg:'User ID not received'});
  }

  const user = await User.findOne({ _id: req.body.folderOwner});
  console.log("createFolder executed by: ", user);

  if(!user){
    return res.status(400).json({msg: `No user by the ID: ${req.body.folderOwner}`});
  }

  const newFolder = new Folder(req.body);
  await newFolder.save();

  // Return status 201, alongside with the created new folder for folderOwner
  return res.status(201).json(newFolder);
}