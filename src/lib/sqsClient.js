import { SQSClient } from "@aws-sdk/client-sqs";


export const sqsClient = new SQSClient({
    region:'us-east-2',
    credentials: {
        secretAccessKey: process.env.SQS_SECRET,
        accessKeyId: process.env.SQS_ACCESS_KEY
    }
})