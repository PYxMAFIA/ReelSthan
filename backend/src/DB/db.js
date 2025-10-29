import mongoose from 'mongoose'


function connectDB() {
    mongoose.connect(process.env.MONGODB_URL)
    .then(()=>{
        console.log("MongoDB connected successfully");
    })
    .catch((err)=>{
        console.log("ERROR in connecting MongoDB",err);
    })
}

export default connectDB;