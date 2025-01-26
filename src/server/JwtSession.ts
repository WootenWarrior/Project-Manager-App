import jwt from "jsonwebtoken";
import dotenv from 'dotenv';

dotenv.config();

const secretKey = process.env.JWT_SESSION_PRIVATE_KEY;
const expiryTime = "1h";

interface Payload {
  userId: string;
  email: string;
}

export const generateToken = (payload: Payload, expiresIn: string = expiryTime): string => {
  if (!secretKey) {
    throw new Error("JWT_SESSION_PRIVATE_KEY is not defined.");
  }
  return jwt.sign(payload, secretKey, { expiresIn });
};

export const verifyToken = (token: string): Payload | null => {
  try{
    if (!secretKey) {
      throw new Error("JWT_SESSION_PRIVATE_KEY is not defined.");
    }
    return jwt.verify(token, secretKey) as Payload;
  } 
  catch(error){
    console.error("Invalid token:", error);
    return null;
  }
};