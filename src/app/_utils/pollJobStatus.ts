
async function delay(ms:number) {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function pollJobStatus({ jobId, startTime, interval }: {
    jobId: string,
    startTime:number,
    interval: number
}) {
    const elapsedTime = Date.now() - startTime
    const maxTime = 90000
    if (elapsedTime > maxTime) {
        throw new Error('Server timed out. Please try again later.')
    }
    try {
        console.log(`[pollJobStatus] Polling for response every ${interval}s... Elapsed time is ${elapsedTime / 1000} seconds`)
        await delay(interval)
        console.log(`Polling...`)
        const response = await fetch(`api/job/getStatus?jobId=${jobId}`, {
            method:'GET',
            next: {
                revalidate: 0
            }
        })
        if (response.ok) {
            const data = await response.json()
            console.log('[apiLookup] Job retrieved : ', data)
            if (data.jobStatus === 'pending') {
                console.log(`[pollJobStatus] job status is pending... polling again in ${interval / 1000} seconds`)
                await delay(interval)
                return pollJobStatus({
                    jobId:jobId,
                    startTime: startTime,
                    interval: interval
                })
            } else if (data.jobStatus === 'completed') {
                console.log(`[pollJobStatus] job status completed, returning response...`)
                return data
            } else if (data.jobStatus === 'failed') {
                console.log(`[pollJobStatus] job status failed, returning response...`)
                return data
            } else  {
                console.error('[pollJobStatus] Unhandled jobStatus.')
                throw new Error('Something went wrong *_*, please try again later.')
            }
        }

    } catch (err) {
        console.error('[apiLookup] Error:', err)
        throw err
    } 
}