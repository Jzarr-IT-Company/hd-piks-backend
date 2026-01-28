import express from "express";
import cors from "cors";
import serverConfig from "./src/config/server.config.js";
import router from "./src/routes/index.js";
import { DB_RETRY_LIMIT, DB_RETRY_TIMEOUT } from "./src/constants/constants.js";
import mongoose from "mongoose";
import favicon from 'serve-favicon';
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import compression from "compression";


let connnectionRetries = 0
const connectionDB = async () => {
  try {
    console.log("Establishing DB connection....")
    await mongoose.connect(serverConfig.dbUrl);
    console.log('Db connected')

  } catch (error) {
    console.error('DB connection failed:', error.message);
    if (connnectionRetries < DB_RETRY_LIMIT) {
      connnectionRetries++
      console.log(`Reconnecting to DB ${connnectionRetries}/${DB_RETRY_LIMIT}`)
      await new Promise(resolve => setTimeout(resolve, DB_RETRY_TIMEOUT))
      await connectionDB()
    } else {
      process.exit()
    }
  }
}


connectionDB()


const PORT =serverConfig.port;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const faviconPath = path.join(__dirname, 'public', 'favicon.ico')
const app = express()
app.use(compression())
app.use(express.json())
app.use(cors({
  origin: '*'
}));
app.use("/", router)
app.use(favicon(faviconPath));

app.listen(PORT, () => {
  console.log(`server are runing on http://localhost:${PORT}`)
})

export default app

