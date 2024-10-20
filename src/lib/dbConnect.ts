import mongoose from "mongoose";

type connectionObject= {
    isConnected?: number
}

const connection : connectionObject = {}

async function dbConnect(): Promise<void>{
    if(connection.isConnected){
        console.log("already connected");
        return;
    }

    try {
        const db = await mongoose.connect(process.env.MONGODB_URI || "", {})
        connection.isConnected = db.connections[0].readyState 
        

        console.log("db connected succesfully");
        
        
    } catch (error) {
        console.log("db connection failed", error);
        
        process.exit()
    }
}

export default dbConnect;