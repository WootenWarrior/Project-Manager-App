import jwt, { JwtPayload } from "jsonwebtoken";
import dotenv from 'dotenv';

dotenv.config();

const secretKey = process.env.JWT_SESSION_PRIVATE_KEY;
const expiryTime = "1h";

export const generateToken = (payload: JwtPayload, expiresIn: string = expiryTime): string => {
  if (!secretKey) {
    throw new Error("JWT_SESSION_PRIVATE_KEY is not defined.");
  }
  return jwt.sign(payload, secretKey, { expiresIn });
};

export const verifyToken = (token: string): JwtPayload | null => {
  try{
    if (!secretKey) {
      throw new Error("JWT_SESSION_PRIVATE_KEY is not defined.");
    }
    return jwt.verify(token, secretKey) as JwtPayload;
  } 
  catch(error){
    console.error("Invalid token:", error);
    return null;
  }
};