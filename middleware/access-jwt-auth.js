require('dotenv/config');
const jwt = require('jsonwebtoken');
const { StatusCodes } = require('http-status-codes');
const UserSchemaModel = require('../model/user-schema');

const authenticateAccessToken = async(req, res, next) => {
    const authHeader = req.headers.authorization; // OR const authHeader = req.headers['authorization'];

    // if there is no authHeader or authHeader does not starts with 'Bearer'
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(StatusCodes.UNAUTHORIZED).send('No authorization header found.'); // status code 401
    }
    // Authorization: Bearer accessToken_sequence       // Get the supplied access token from the authHeader
    // if it exist by splitting it using space ' ' and selecting the second part (i.e. index 1)
    const accessJWT = authHeader ? authHeader.split(' ')[1] : undefined; //same as the code below
    // const accessJWT = authHeader && authHeader.split(' ')[1]
    if (accessJWT == null) return res.status(StatusCodes.UNAUTHORIZED).send('Invalid credentials. No access token supplied.');
    // Token not yet received
    try {
        // 'decodeToken' contains "userId", "name" and others that are created using the jwt.sign() method
        const decodeToken = jwt.verify(accessJWT, process.env.ACCESS_JWT_SECRET);
        // Confirm if the decodeToken 'userId' exist in the database and select the "_id" and "username"
        const result = await UserSchemaModel.findById(decodeToken.userId).select('_id username');
        const { _id: userId, username: name } = result // destructuring the "result" object to get 
        // the '_id' and 'username' properties and creating an alias (a new name) for each of them.
        req.user = { userId, name }; // will be called anywhere the 'authenticationToken' middleware is used
        next();
    } catch (err) {
        res.status(StatusCodes.UNAUTHORIZED).send('Authentication failed... ' + err);
        console.error('Authentication failed... ' + err)
    }
}

module.exports = authenticateAccessToken