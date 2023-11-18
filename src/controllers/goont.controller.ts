import { Request, Response } from "express";
import Goont from "../models/goont";
import User from "../models/user";
import { extractId } from './user.idExtractor';

// CREATE GOONT
/**
 * 
 * This function will receive author, content and image to then assign the values to the 
 * GOONT and then save it as a newly created goont. The image is optional, the other two aren't.
 * 
 * The two received parameters of this function are
 * content OBLIGATORY
 * image (link) OPTIONAL
 */
export const createGoont = async (req: Request, res: Response): Promise<Response> =>{
    const authorization: string | undefined = req.headers?.authorization;
    const userId = extractId(authorization);

    const user = await User.findOne({_id: userId})
    if(!user){
      return res.status(400).json({msg: 'The user does not exist'});
    }

    if(!req.body.content){
      return res.status(400).json({msg: 'Please. Provide with the goont content'});
    }
  
    var goontValues: {
        content: string;
        author: any;
        image: string | null;
      } = {
        content: req.body.content,
        author: userId,
        image: null
    };

    if(req.body.image){
        goontValues['image'] = req.body.image
    }

    // Important that the parameters in the body have the same name as the model
    const newGoont = new Goont(goontValues);
    await newGoont.save();

    user.addGoont(newGoont._id)
  
    return res.status(201).json(newGoont);
}

// DELETE GOONT
export const deleteGoont = async (req: Request, res: Response): Promise<Response> =>{
  const authorization: string | undefined = req.headers?.authorization;
  const userId = extractId(authorization);
  
  if(!req.body.goontId){
    return res.status(400).json({msg: 'Please. Provide with the goont Id'});
  }

  const user = await User.findOne({_id: userId})
  if(!user){
    return res.status(400).json({msg: 'The user does not exist'});
  }

  const goont = await Goont.findOne({_id: req.body.goontId})
  if(!goont){
    return res.status(400).json({msg: "Goont not found!"});
  }

  // @ts-ignore
  const isOwner = await goont.isOwner(userId)
  if(isOwner){
    await Goont.deleteOne({_id: req.body.goontId})
    user.removeGoont(req.body.goontId)
    return res.status(200).json({msg: "Goont deleted from user"});
  }

  return res.status(400).json({msg: "The user doesn't own the goont!"})
}

// MODIFY CONTENT (EDIT GOONT)
/**
 * This will only happen if the user matches with the authorization header.
 * That's why I created isOwner in the goont model
 */
export const modifyContent = async (req: Request, res: Response): Promise<Response> =>{
  const authorization: string | undefined = req.headers?.authorization;
  const userId = extractId(authorization);
  
  if(!req.body.newContent || !req.body.goontId){
    return res.status(400).json({msg: 'Please. Provide with the new content and the goont Id'});
  }

  const user = await User.findOne({_id: userId})
  if(!user){
    return res.status(400).json({msg: 'The user does not exist'});
  }

  const goont = await Goont.findOne({_id: req.body.goontId})
  if(!goont){
    return res.status(400).json({msg: "Goont not found!"});
  }

  // @ts-ignore
  const isOwner = await goont.isOwner(userId)
  if(isOwner){
    await goont.modifyContent(req.body.newContent);
    return res.status(200).json({msg: "Goont modified"});
  }

  return res.status(400).json({msg: "The user doesn't own the goont!"});

}

// LIKE GOONT
export const likeGoont = async (req: Request, res: Response): Promise<Response> =>{
  const authorization: string | undefined = req.headers?.authorization;
  const userId = extractId(authorization);
  
  if(!req.body.goontId){
    return res.status(400).json({msg: 'Please. Provide with the goont Id'});
  }

  const user = await User.findOne({_id: userId})
  if(!user){
    return res.status(400).json({msg: 'The user does not exist'});
  }

  const goont = await Goont.findOne({_id: req.body.goontId})
  if(!goont){
    return res.status(400).json({msg: "Goont not found!"});
  }


  const isLikedByUser = await goont.isLiked(user._id);
  if(isLikedByUser){
    return res.status(400).json({msg: "The goont is already liked by the user"});
  }

  await goont.addLike(user._id);
  return res.status(200).json({msg: `Like added to goont ${goont._id}`})
}

// REMOVE LIKE (Yes, unlike is a verb and is suitable for this case)
export const unlikeGoont = async (req: Request, res: Response): Promise<Response> =>{
  const authorization: string | undefined = req.headers?.authorization;
  const userId = extractId(authorization);
  
  if(!req.body.goontId){
    return res.status(400).json({msg: 'Please. Provide with the goont Id'});
  }

  const user = await User.findOne({_id: userId})
  if(!user){
    return res.status(400).json({msg: 'The user does not exist'});
  }

  const goont = await Goont.findOne({_id: req.body.goontId})
  if(!goont){
    return res.status(400).json({msg: "Goont not found!"});
  }


  const isLikedByUser = await goont.isLiked(user._id);
  if(!isLikedByUser){
    return res.status(400).json({msg: "The goont is not liked by the user"});
  }

  await goont.removeLike(user._id);
  return res.status(200).json({msg: `Like removed from goont ${goont._id}`})
}

// REPLY TO GOONT
/**
 * This function will be utilized to reply to a goont creating what is found in the model as a "comment", comments do not appear in
 * the normal feed by the rules of our Guntter Application. Appart from this, they'll behave as a normal goont, being able to have an
 * image, content, and everything.
 * 
 * The received parameters are:
 * parentGoontId
 * content
 * image
 */
export const createReply = async (req: Request, res: Response): Promise<Response> =>{
  const authorization: string | undefined = req.headers?.authorization;
  const userId = extractId(authorization);
  
  if(!req.body.parentGoontId){
    return res.status(400).json({msg: 'Please. Provide with the parent goont Id'});
  }

  const user = await User.findOne({_id: userId})
  if(!user){
    return res.status(400).json({msg: 'The user does not exist'});
  }

  const goont = await Goont.findOne({_id: req.body.parentGoontId})
  if(!goont){
    return res.status(400).json({msg: "Parent goont not found!"});
  }

  if(!req.body.content){
    return res.status(400).json({msg: 'Please. Provide with the goont content'});
  }

  var goontValues: {
      content: string;
      author: any;
      image: string | null;
      isComment: boolean;
      parentGoont: any;
    } = {
      content: req.body.content,
      author: userId,
      image: null,
      isComment: true,
      parentGoont: goont._id
  };

  if(req.body.image){
      goontValues['image'] = req.body.image
  }

  // Important that the parameters in the body have the same name as the model
  const newGoont = new Goont(goontValues);
  await newGoont.save();

  user.addGoont(newGoont._id)

  return res.status(201).json(newGoont);
}

// GET ALL GOONTS
export const getAllGoonts = async (req: Request, res: Response): Promise<Response> =>{
  const authorization: string | undefined = req.headers?.authorization;
  const userId = extractId(authorization);

  const user = await User.findOne({_id: userId})
  if(!user){
    return res.status(400).json({msg: 'The user does not exist'});
  }

  const allGoonts = await Goont.find({isComment:false}, {likes:false, isComment:false, isEdited:false, __v:false})
  .populate({
    path:'author',
    select: 'username fullname profilePicture _id'
  })

  return res.status(200).json({msg:"All goonts sent", allGoonts:allGoonts})
}

// GET FEED GOONTS
/**
 * Get's the goonts from the user and its following array users
 * 
 * This should return a json with N number of JSONS inside, those jsons are going to contain each
 * goont's information, this information being:
 * PFP (link), fullname, username, content, image, likes.
 * ALSO it will be important to provide with the date so that the FrontEnd can sort them by date.
 * 
 * With the knowledge I gained from doing the two other controllers, I consider that this function will be much
 * easier than I imagined
 */
export const getFeed = async (req: Request, res: Response): Promise<Response> =>{
  const authorization: string | undefined = req.headers?.authorization;
  const userId = extractId(authorization);

  const user = await User.findOne({_id: userId})
  if(!user){
    return res.status(400).json({msg: 'The user does not exist'});
  }

  const followingList = [...user.following, userId];
  const feedGoonts = await Goont.find({author: {$in: followingList}, isComment:false}, { likes:false, isComment:false, isEdited:false, __v:false})
  .populate({
    path:'author',
    select: 'username fullname profilePicture _id'
  })
  return res.status(200).json({msg:"Feed goonts sent", feedGoonts:feedGoonts});
}

// GET PROFILE GOONTS
/**
 * 
 * Gets every goont from a user that isn't a comment, this is the easiest to implement, therefore, I'm
 * starting with this one.
 */
export const getUserGoonts = async (req: Request, res: Response): Promise<Response> =>{
  const authorization: string | undefined = req.headers?.authorization;
  const userId = extractId(authorization);

  const user = await User.findOne({_id: userId})
  if(!user){
    return res.status(400).json({msg: 'The user does not exist'});
  }

  // I though that I had to do magic to solve this problem, but turns out mongoDB is beautiful <3
  const goonts = await Goont.find({author:userId, isComment:false}, { likes:false, isComment:false, isEdited:false, __v:false})
  .populate({
    path:'author',
    select: 'username fullname profilePicture _id'
  });

  return res.status(200).json({msg:"User goonts sent", goonts:goonts})
}

// GET GOONT REPLIES
// Gets every goont that is a reply to a goont (Goonts which parent goont is the received goontId)
export const getGoontReplies = async (req: Request, res: Response): Promise<Response> =>{
  const authorization: string | undefined = req.headers?.authorization;
  const userId = extractId(authorization);

  if(!req.body.goontId){
    return res.status(400).json({msg: "Please. Send the goontId"})
  }

  const user = await User.findOne({_id: userId})
  if(!user){
    return res.status(400).json({msg: 'The user does not exist'});
  }

  const goont = await Goont.findOne({_id: req.body.goontId});
  if(!goont){
    return res.status(404).json({msg: 'Goont not found!'})
  }

  const replyGoonts = await Goont.find({parentGoont:req.body.goontId}, { likes:false, isComment:false, isEdited:false, __v:false})
  .populate({
    path: 'author',
    select: 'username fullname profilePicture _id'
  });

  return res.status(200).json({msg:"Reply goonts sent", replyGoonts:replyGoonts})
}