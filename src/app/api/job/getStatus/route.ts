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
                message: 'Invalid Job'
            }, {
                status:500
            })
        }

        const jobData = JSON.parse(job)
        console.log('[Job getStatus] JobData:', jobData)
        return NextResponse.json({
            jobData: job
        })
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
                message: `Something went wrong, check logs.`
            }, {
                status: 500
            })
        }
        
    }
    


}