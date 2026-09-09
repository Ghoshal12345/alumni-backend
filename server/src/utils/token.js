import { randomBytes, createHash } from "node:crypto";

const generateVerificationToken = () => {
    const token = randomBytes(32).toString("hex");

    const tokenHash = createHash("sha256")
        .update(token)
        .digest("hex");

    return {
        token,
        tokenHash,
    };
};

const hashToken = (token) => {
    return createHash("sha256")
        .update(token)
        .digest("hex");
};

export {
    generateVerificationToken,
    hashToken,
};


// this token generation uses crypto (SHA 256) to create a secure token for verification purposes. The `generateVerificationToken` function generates a random token and its corresponding hash, while the `hashToken` function hashes a given token using SHA-256.