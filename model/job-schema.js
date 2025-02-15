const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    company: {
        type: String,
        required: [true, 'Please enter company name.'],
        maxlength: 50
    },
    position: {
        type: String,
        required: [true, 'Please provide position.'],
        maxlength: 50
    },
    status: {
        type: String,
        enum: {
            values: ['interview', 'declined', 'accepted', 'pending'],
            message: '{VALUE} is not supported.' // VALUE refers to whatever the user entered.
        },
        default: 'pending'
    },
    createdBy: {
        type: mongoose.Types.ObjectId,
        ref: 'User', // references the "User" model in the "user-schema.js" file
        required: [true, 'Please provide user id']
    },
    creator: {
        type: String,
        ref: 'User', // references the "User" model in the "user-schema.js" file
        required: [true, 'Please provide user name']
    }
}, { timestamps: true }); // The 'timestamps' property automatically generate "createdAt" and "updatedAt" fields in the
// schema records

const jobModel = mongoose.model('Job', jobSchema);

module.exports = jobModel;