import mongoose, {Schema, Document} from "mongoose";

export interface Message extends Document{
    content:string,
    createdAt: Date
}

const messageSchema: Schema<Message> = new Schema({
    content:{
        type: String,
        required: true
    },
    createdAt:{
        type: Date,
        default: Date.now,
        required:true
    }
})

export interface User extends Document{
    username:string,
    email:string,
    password:string,
    verifyCode: string,
    verifyCodeExpiry: Date,
    isVerified: boolean,
    isAcceptingMessage: boolean,
    messages: Message[]
}



const UserSchema: Schema<User> = new Schema({
    username:{
        type: String,
        required: [true, "username is required"],
        unique:true,
        trim: true
    },
    email:{
        type: String,
        required: [true, "email is required"],
        unique: true,
        match: [/.+\@.+\..+/, "please enter a valid email"]
    },
    password:{
        type: String,
        required: [true, "password is required"],
    },
    verifyCode:{
        type: String,
        required: [true, "verify code is required"],
    },
    verifyCodeExpiry:{
        type: Date,
        required: [true, "verify code Expiry is required"],
    },
    isVerified:{
        type:Boolean,
        default: false
    },
    isAcceptingMessage:{
        type: Boolean,
        required: true,
        default: true
    },
    messages:{
        type: [messageSchema],
        required: true
    },
    
})

// this as mongoose.Model<user> is the typescript  this check if the user model is present or not if yes then return if not then create a new one 
const UserModel = (mongoose.models.User as mongoose.Model<User>) || (mongoose.model<User>("User", UserSchema));


export default UserModel;