import argon2 from "argon2";

const hashPassword = async (password) => {
    return await argon2.hash(password, {
        type: argon2.argon2id,
    });
};

const verifyPassword = async (passwordHash, password) => {
    return await argon2.verify(passwordHash, password);
};

export{
    hashPassword,
    verifyPassword,
}