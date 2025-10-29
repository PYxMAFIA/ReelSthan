import mongoose from "mongoose";

const saveSchema = new mongoose.Schema({
    reel:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Reel",
        required:true
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    }
},{
    timestamps:true
});

const SaveModel = mongoose.model("Save", saveSchema);
export default SaveModel;
