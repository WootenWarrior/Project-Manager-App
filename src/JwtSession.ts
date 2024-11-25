import jwt from "jsonwebtoken";

const secretKey = import.meta.env.JWT_SESSION_PRIVATE_KEY;

interface Payload {
    userId: string;
    email: string;
}

export const generateToken = (payload: Payload, expiresIn = "1h"): string => {
    return jwt.sign(payload, secretKey, { expiresIn });
};

export const verifyToken = (token: string): Payload | null => {
    try {
      return jwt.verify(token, secretKey) as Payload;
    } 
    catch (error) {
      console.error("Invalid token:", error);
      return null;
    }
};