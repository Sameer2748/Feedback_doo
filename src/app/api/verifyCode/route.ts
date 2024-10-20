import dbConnect from "@/lib/dbConnect"
import UserModel from "@/model/User"


export async function POST(req: Request, res: Response){
    await dbConnect();

    try {
        const {username, code} = await req.json();

        const decodedUsername = decodeURIComponent(username);

        const user = await UserModel.findOne({username: decodedUsername});
        if(!user){
            return Response.json({
                success: false,
                message: "No user found with this username"
            }, {status: 404})
        }

        // checkl the code
        const isCodeValid = user.verifyCode === code;
        const isCodeNotExpired = new Date(user.verifyCodeExpiry)> new Date()

        if(isCodeValid && isCodeNotExpired){
            user.isVerified = true;
            await user.save();
            return Response.json({
                success: true,
                message: "User verified successfully"
            }, {status: 200})
        }else if(!isCodeNotExpired){
            return Response.json({
                success: false,
                message: "code expired please signUp again to get a new Code"
            })
        }else{
            return Response.json({
                success: false,
                message: "Code not valid , Enter Valid Code"
            })
        }
    } catch (error) {
        console.error("error verifying user", error);
        return Response.json(
            {
                success: false,
                message: "Failed to verify user"
            }
        )
        
    }
}