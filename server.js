import {app} from "./app.js";
import * as dotenv from 'dotenv' 
import {connectDatabase} from "./config/database.js";
import cloudinary from "cloudinary";

dotenv.config()
const PORT = process.env.PORT

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
})

connectDatabase();


app.listen(PORT,()=> {
    console.log(`server is running on port ${PORT}`)
})