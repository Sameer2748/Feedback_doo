import dbConnect from "@/lib/dbConnect";
import UserModal from "@/model/User";
import bcrypt from "bcryptjs"

import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";

export async function POST(req: Request){
    await dbConnect();

    try {
        // get the credentailas form user 
        const {username , email, password} = await req.json();
        // find if user is present in db and verified then rteurn
        const existingUserAndVerified = await UserModal.findOne({username, isVerified:true});
        if(existingUserAndVerified){
            return Response.json({
                success:false,
                message:"username already taken"
            }, {status:400})
        }

        // check user by email
        const existingUserByEmail = await UserModal.findOne({email});
        // create a verify code
        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

        if(existingUserByEmail){
            // verified return
            if(existingUserByEmail.isVerified){
                return Response.json({
                    success: false,
                    message: "user already present with this email"
                }, {status:500})
            }else{
                // the user with email set new values like password verifycode and expiry of code and save it 
                const hashedPassword = await bcrypt.hash(password, 10);
                existingUserByEmail.password = hashedPassword;
                existingUserByEmail.verifyCode = verifyCode;
                existingUserByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000); 
                await existingUserByEmail.save();
            }
        }else{
            // new user then hash password adn expiry code  time 
            const hashedPassword = await bcrypt.hash(password, 10);
            const expiryDate = new Date();
            // set the expiry date to one hour
            expiryDate.setHours(expiryDate.getHours() + 1);

            // create a new user object and save it to the database
            const newuser = new UserModal({
                username,
                email,
                password:hashedPassword,
                verifyCode,
                verifyCodeExpiry: expiryDate,
                isVerified: false,
                isAcceptingMessage: true,
                messages: []
            })
            await newuser.save();

        }

        // send verification email to that email username with verifycode
        const emailResponse = await sendVerificationEmail(email, username, verifyCode)
        if(!emailResponse.success){
            return Response.json({
                success: false,
                message: emailResponse.message
            }, {status:500})
        }

        return Response.json({
            success: true,
            message: "user registered successfully please verify your email address"
        }, {status:200})

    } catch (error) {
        console.log("error registering user", error);
        return Response.json({
            success: false,
            message: "Failed to register user"
        },{
            status: 500
        }
       )
    }
}