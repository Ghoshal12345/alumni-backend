import jwt from "jsonwebtoken";

const generateAccessToken = (user) => {
    return jwt.sign(
        {
            userId: user._id.toString(),
            role: user.role,
            tokenVersion: user.tokenVersion,
        },
        process.env.JWT_SECRET_KEY,
        {
            expiresIn: "15m",
        }
    );
};

const verifyAccessToken = (token) => {
    return jwt.verify(token, process.env.JWT_SECRET_KEY);
};

export {
    generateAccessToken,
    verifyAccessToken,
};