require('dotenv').config();
const mongoose = require('mongoose');
const mongodbConn = require('../dbconnection');
const UserSchemaModel = require('../model/user-schema');
const jwt = require('jsonwebtoken');
const { StatusCodes } = require('http-status-codes');

mongodbConn(); // First connect to the database before performing CRUD operation with the imported schema

const registeredUsers = async(req, res) => {
    try {
        const results = await UserSchemaModel.find({}).select('-password');
        if (!results) {
            res.status(StatusCodes.NOT_FOUND).send('No record found.');
        }
        res.status(StatusCodes.OK).json({
            message: "Records retrieved successfully.",
            results,
            user_count: results.length
        })
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send('Error retrieving registered users. ' + err); // status code 500
        console.error(err);
    }
}

// uses the post method. Tokens are not required during registration
const register = async(req, res) => {
    try {
        /*
        // Use this approach if the "password" field is not already hashed using the Schema.pre() middleware
        const { username, email, password } = req.body; // destructuring of the "req.body" object

        const salt = await bcrypt.genSalt(10); // Generate a 'salt' and use it to hash the password
        const hashedPassword = await bcrypt.hash(password, salt);

        // reconstruct the request body object to have the hashed password
        const requestBody = { username, email, password: hashedPassword }
        const result = await UserSchemaModel.create(requestBody);
        */
        const result = await UserSchemaModel.create(req.body); // password is hashed in the process by the Schema.pre() middleware
        // the 'req.body' object can also be unpacked into a new object as {...req.body} the code becomes:
        // const result = await UserSchemaModel.create({...req.body});
        res.status(StatusCodes.CREATED).json({ // status code 201
            message: "User registered successfully",
            user: {
                username: result.username
            }
        });
    } catch (err) { // catch all the errors that may occur in the 'try' block
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send('Error registering user. ' + err);
        console.error(err);
    }
}

const login = async(req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) { // status code 400
            res.status(StatusCodes.BAD_REQUEST).send('Please provide email and password.');
        }

        const result = await UserSchemaModel.findOne({ email }); // 'result' is the instance of the schema and 
        // it contains the fields (such as username, email, password, createdAt, refreshToken) and schema 
        // instance methods such as comparePassword() and createJWT().

        // if user does not exist
        if (!result) {
            res.status(StatusCodes.UNAUTHORIZED).send('Email is incorrect or does not exist.'); // status code 401
        }
        // Compare candidate "password" with existing password in the database if the user email exist.
        const validPassword = await result.comparePassword(password); // calling the schema instance method
        console.log("Is password valid: ", validPassword);

        if (!validPassword) {
            res.status(StatusCodes.UNAUTHORIZED).send('Email exist but password is not correct.');
        }
        /* 
           // Use this approach if the 'Schema instance method' for comparing password is not declared already
           const validPassword = await bcrypt.compare(password, result.password);
           if (!validPassword) {
              res.status(StatusCodes.UNAUTHORIZED).send('Email exist but password is not correct.');
           }
        */
        // if user exist and authencation is successful
        const { accessToken, refreshToken } = result.createJWT(); // calling the schema instance method on the "result" instance and 
        // catching the returned values from the "createJWT()" schema instance method.

        // save the "refreshToken" in the database schema instance 'result' for future use
        result.refreshToken = refreshToken;
        await result.save(); // save the added refreshToken in the database

        res.status(StatusCodes.OK).json({ // status code 200
            message: "Login successful",
            user: {
                username: result.username
            },
            accessToken,
            refreshToken
        });
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send('Error logging in... ' + err);
        console.error(err);
    }
}

const dashboard = async(req, res) => {
    console.log(req.user); // points to the 'req.user' from the authenticationToken() middleware
    res.status(StatusCodes.OK).json({
        message: `Welcome ${req.user.name}, your id is ${req.user.userId}`
    });
}

const refreshTokenJWT = async(req, res) => {
    // Get the refresh token from the request body
    const { refreshToken } = req.body; // destructuring of the 'req.body' object
    if (!refreshToken || refreshToken === "") {
        res.status(StatusCodes.UNAUTHORIZED).send('Refresh token required.')
    }
    try {
        // 'decodeToken' contains "userId", "name" and others that are created using the jwt.sign() method
        const decodeToken = jwt.verify(refreshToken, process.env.REFRESH_JWT_SECRET);
        // Confirm if the 'refreshToken' and the decodeToken 'userId' exist in the database
        const result = await UserSchemaModel.findOne({ _id: decodeToken.userId, refreshToken }); // 'result' 
        // contains all the fields and the schema instance methods
        if (!result) {
            res.status(StatusCodes.UNAUTHORIZED).send("Invalid refresh token"); // status code 401
        }
        // Generate new "tokens" (to grab the accessToken and refreshToken) with the 'result' schema instance
        const tokens = result.createJWT(); // calling the schema instance method on the "result" instance and 
        // catching the returned values from the "createJWT()" schema instance method.

        // save the "newRefreshToken" in the database schema instance 'result' for update
        result.refreshToken = tokens.refreshToken;
        await result.save(); // save the added refreshToken in the database

        res.status(StatusCodes.OK).json({ // status code 200
            message: "New tokens generated",
            tokens // the accessToken and refreshToken
        });
    } catch (err) {
        res.status(StatusCodes.UNAUTHORIZED).send('Error generating tokens... ' + err);
        console.error('Error generating tokens... ' + err);
    }
}

const logout = async(req, res) => {
    // Get the refresh token from the request body
    // points to the 'req.user' from the authenticationToken() middleware
    const { user: { userId, name }, body: { refreshToken } } = req; // nested destructuring of the 'req' object
    if (!refreshToken || refreshToken === "") {
        res.status(StatusCodes.UNAUTHORIZED).send('Refresh token required.')
    }
    try {
        // find the refreshToken and set the refreshToken value to "null" to prevent future use.
        const result = await UserSchemaModel.findOneAndUpdate({ refreshToken }, { $set: { refreshToken: null } });

        if (!result) {
            res.status(StatusCodes.UNAUTHORIZED).send("Invalid refresh token"); // status code 401
        }

        res.status(StatusCodes.OK).send(`Loggged out ${name} successfully.`);
    } catch (err) {
        res.status(StatusCodes.UNAUTHORIZED).send('Error logging out... ' + err);
        console.error('Error logging out... ' + err);
    }

}


module.exports = { registeredUsers, register, login, dashboard, refreshTokenJWT, logout }