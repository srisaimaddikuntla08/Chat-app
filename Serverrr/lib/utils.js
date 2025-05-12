import jwt from "jsonwebtoken"

export const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "1h" }); // 1 hour expiry
};