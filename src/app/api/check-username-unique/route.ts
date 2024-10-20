import {z} from "zod";
import dbConnect from "@/lib/dbConnect"
import UserModel from "@/model/User"
import { usernameValidation } from "@/schemas/signUpSchema"

const UserNameQuerySchema = z.object({
    username: usernameValidation,
})

export async function GET(req: Request){
    await dbConnect()
    console.log(req.method);
    
   

    try {
        const {searchParams} = new URL(req.url)
        const queryParam = {
            username: searchParams.get("username")
        }
        // now check for valid username
        const result = UserNameQuerySchema.safeParse(queryParam)
        console.log(result); // TODO: remove
        if(!result.success){
            const usernameErrors = result.error.format().username?._errors || [];
            return Response.json({
                success: false,
                message: usernameErrors?.length>0 ? usernameErrors : "Invalid query parameter"
            }, {status:400})
        }

        const {username} = result.data;

        const existingVerifieduser = await UserModel.findOne({username, isVerified: true});
        if(existingVerifieduser){
            return Response.json({
                success: false,
                message:  "username is already taken",
            }, {status:400})
        } 

        return  Response.json({
            success: true,
            message:  "username is available",
        }, {status:200})
    } catch (error) {
        console.log("error in chekcing username", error);
        return Response.json(
            {
            success: false,
            message: "Failed to check username"
            },{
                status: 500
            }
        )
    }
}