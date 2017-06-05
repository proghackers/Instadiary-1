var mongoose = require('mongoose');
var userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    local: {
        password: {
            type: String
        }
    },
    instagram: {
        id: {
            type: String,
        },
        token: {
            type: String
        }
    },
    createDate: {
        type: Date,
        default: Date.now,
        required: true
    }
});

module.exports = mongoose.model('User', userSchema);