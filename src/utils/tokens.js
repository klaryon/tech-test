var bcrypt = require("bcrypt");

const Token = require("../models/token");

const BCRYPT_SALT_ROUNDS = 12;

const checkToken = async (userId, token) =>
    Token.findOne({ userId })
    .then(async (doc) => {
        if (!doc) 
        throw new Error("Token is expired");
        if (!await bcrypt.compare(token, doc.token))
        throw new Error("Token is not valid");
        return doc;
    });

const getToken = async (userId) =>
    Token.findOne({ userId })
        .then(async (token) => {
        if (token) token.deleteOne();
        let resetToken = crypto.randomBytes(32).toString("hex");
        return bcrypt.hash(resetToken, BCRYPT_SALT_ROUNDS)
            .then((hash) => Token.create({
            userId,
            token: hash,
            })
            .then(() => resetToken));
        });

module.exports = { checkToken, getToken }; 
