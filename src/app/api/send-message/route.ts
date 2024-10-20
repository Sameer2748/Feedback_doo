import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { messageSchema } from "@/schemas/messageSchema";
import { Message } from "@/model/User";

export async function POST(req: Request, res: Response){
    await dbConnect();

    const {username, content} = await req.json();

    try {
        const user = await UserModel.findOne({username});
        if(!user){
            return Response.json({
                success: false,
                message: "User not found"
            }, {status:404})
        }

        if(!user.isAcceptingMessage){
            return Response.json({
                success: false,
                message: "User is not accepting messages"
            }, {status: 403})
        }

        const newMessage = {content, createdAt: new Date()};
        user.messages.push(newMessage as Message);
        await user.save();

        return Response.json({
            success: true,
            message: "Message sent successfully",
            newMessage
        }, {status: 200})
    } catch (error) {
        console.log("errror adding messages", error);

        return Response.json({
            success: false,
            message: "internal sserver error",
        }, {status: 500})
    }
}