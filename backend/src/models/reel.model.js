import mongoose from "mongoose";

const reelSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
    },
    videoUrl:{
        type:String,
        required:true
    },
    uploadedBy:{
        type:String,
        required:true
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user",
        required:false
    },
    like:[{
        type:String,
        default: undefined
    }],
    comments:[{
        user: { type: String, required: true },
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now }
    }],
    saves:[{
        type:String,
        default: undefined
    }],
    shareCount:{
        type:Number,
        default:0
    }
})

const reelModel=mongoose.model("Reel",reelSchema);

export default reelModel;