import redis from "@/lib/redis";
import { NextRequest, NextResponse } from "next/server";


export async function GET (req:NextRequest) {
    const params = req.nextUrl.searchParams
    const jobId = params.get('jobId')

    console.log('[Job getStatus] Getting job Id ', jobId)
    try {
        const job:string | null = await redis.get(`id:${jobId}`)
        if (!job) {
            return NextResponse.json({
                message: 'Invalid Request'
            }, {
                status:500
            })
        }

        const jobData = JSON.parse(job)
        if (jobData.status === 'failed') {
            return NextResponse.json({
                jobStatus:'failed'
            })
        } else if (jobData.status === 'completed') {
            return NextResponse.json({
                jobStatus: 'completed',
                job:job
            })
        } else if (jobData.status === 'pending') {
            return NextResponse.json({
                jobStatus:'pending',
            })
        } else {
            throw new Error('Unknown job status.')
        }

    } catch (err) {
        console.log('[Job getStatus] Error:', err)
        if (err instanceof Error) {
            return NextResponse.json({
                message: `${err.message}`
            }, {
                status: 500
            })
        } else {
            return NextResponse.json({
                message: `Something went wrong. Please try again later.`
            }, {
                status: 500
            })
        }
        
    }
    


}