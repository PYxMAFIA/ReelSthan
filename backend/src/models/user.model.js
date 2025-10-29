import mongoose from "mongoose";


const userSchema = mongoose.Schema({
    name: {
        type: String,
        require: true
    },
    username: {
        type: String,
        unique: true,
        require: true
    },
    email: {
        type: String,
        require: true,
        unique: true
    },
    password: {
        type: String
    },
    bio: {
        type: String,
        default: ''
    },
    avatarUrl: {
        type: String,
        default: ''
    },
    lastLogin: {
        type: Date,
        // use the function reference so Mongoose evaluates it when a document is created
        default: Date.now
    },
    isVerified: {
        type: Boolean,
        default:false
    },
    resetPasswordToken: String,
    resetPasswordExpired: Date,
    verificationToken: String,
    verificationTokenExpired: Date

},
    {
        timestamps: true
    }
)

const userModel = mongoose.model("user", userSchema);

export default userModel;