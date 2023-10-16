import {Request, Response} from 'express'
import Note from '../models/note';
import User from '../models/user';
import jwt from 'jsonwebtoken';

export const createNote = async(req:Request, res:Response) =>{
  return res.status(200).json({msg: "Reached the end"});
}