import jwt from 'jsonwebtoken';

// Interface for TypeScript
interface JwtPayLoad{
  id: string;
  email: string;
}

/**
 * 
 * This function extracts the userId from the authorization header and returns undefined if it were to
 * be an incorrect userId, it is used in every special route to get the userId
 * 
 * The authorization header should never be undefined, why? you may ask, because if any of these controllers
 * are reached that means that the passport authentication was done correctly, therefore, there was an authorization
 * header :)
 */
export function extractId(authorization: string | undefined){
  if (authorization) {
    // Extracts the JWT from the bearer
    const receivedJwt = authorization.split(" ")[1];
    // Decodes the encoded header
    const decodedToken = jwt.decode(receivedJwt) as JwtPayLoad;
    
    // Extracts the ID from the decoded token
    if(decodedToken.id){
      // console.log("Correct JWT returning existing userId")
      return decodedToken.id;
    
    }else{
      console.error('Invalid JWT');
      return undefined;
    }
    
  }
  else {
    console.log("SOMEHOW authorization header is undefined");
    return undefined;
  }
}