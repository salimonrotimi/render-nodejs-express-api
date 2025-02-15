const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // install "bcryptjs" because ordinary 'bcrypt' generate error when 
// trying to 'compare' password
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "Please Enter a username"],
        minlength: 3,
        maxlength: 40
    },
    email: {
        type: String,
        required: [true, "Email is required."],
        unique: [true, 'Email already exist'],
        maxlength: [50, 'Email length cannot be more than 50 characters.'],
        match: [/^\w+([\.-_]?\w+)*@\w+([\.-_]?\w+)*(\.\w{2,3})+$/, 'Email is not in the right format. Enter a valid email.']
    },
    password: {
        type: String,
        required: [true, 'Password must be provided.'],
        minlength: 6
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    refreshToken: {
        type: String
    }
});

// Schema middleware to hash the "password" field in the data that will be processed by the schema
userSchema.pre('save', async function(next) {
    if (this.isModified('password')) { // Checks if the "password" field has been modified previously, before
        // running the code in the "if" block. This ensures that the "password" field is hashed only once.
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
    next(); // Proceed with saving the document
});

// Schema instance method to compare password for authentication
userSchema.methods.comparePassword = async function(requestBodyPassword) {
    const isMatch = await bcrypt.compare(requestBodyPassword, this.password);
    return isMatch;
}

// Schema instance method to create JWT using the "_id" and the "username" field in the schema data
userSchema.methods.createJWT = function() {
    const accessToken = jwt.sign({ userId: this._id, name: this.username }, process.env.ACCESS_JWT_SECRET, { expiresIn: process.env.ACCESS_JWT_LIFETIME });
    const refreshToken = jwt.sign({ userId: this._id, name: this.username }, process.env.REFRESH_JWT_SECRET, { expiresIn: process.env.REFRESH_JWT_LIFETIME });
    return { accessToken, refreshToken };
}

const userModel = mongoose.model('User', userSchema);

module.exports = userModel;