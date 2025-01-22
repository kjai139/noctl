import redis from "@/lib/redis";
import { NextRequest, NextResponse } from "next/server";


export async function GET (req:NextRequest) {
    const params = req.nextUrl.searchParams
    const jobId = params.get('jobId')
    if (!jobId) {
        return NextResponse.json({
            message: 'Missing jobId'
        }, {
            status: 500
        })
    }

    console.log('[Job getStatus] Getting job Id ', jobId)
    try {
        const job:any = await redis.get(jobId)
        console.log('*******GETSTATUS******', typeof job)
        if (!job) {
            return NextResponse.json({
                message: 'Invalid Request'
            }, {
                status:500
            })
        }
        
        
        console.log('[Job/getStatus] job:', job)
        const jobData = job
        if (jobData.status === 'failed') {
            return NextResponse.json({
                jobStatus:'failed',
                job:job
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