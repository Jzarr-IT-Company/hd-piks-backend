import dotenv from "dotenv";
dotenv.config()

const serverConfig = {
    port: process.env.SERVER_PORT,
    dbUrl :process.env.SERVER_DB_URL,
    secretKey : process.env.SERVER_JWT_SECRET_KEY,

    // AWS S3 Config new added for image/video upload etc
    aws: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        bucket: process.env.AWS_S3_BUCKET_NAME,
        region: process.env.AWS_S3_REGION,
        domain: process.env.AWS_S3_DOMAIN
    },
    imagekit: {
        publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
        privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
        urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
    }
}


export default serverConfig


