import { ModelsType } from "../_types/glossaryType"
import { chargeUser, checkUserErrors } from "../action"

async function delay(ms:number) {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function pollJobStatus({ jobId, startTime, interval, maxTimer, initialDelay }: {
    jobId: string,
    startTime:number
    interval: number
    maxTimer?:number
    initialDelay?:number
}) {
    const elapsedTime = Date.now() - startTime
    let maxTime
    if (!maxTimer) {
        maxTime = 90000
    } else {
        maxTime = maxTimer
    }
    if (elapsedTime > maxTime) {
        throw new Error('Server timed out. Please try again later.')
    }
    try {
        
        if (initialDelay) {
            console.log(`[pollJobStatus] Polling for response every ${interval}s with initial delay ${initialDelay}s... Elapsed time is ${elapsedTime / 1000} seconds`)
            await delay(initialDelay)
        } else {
            console.log(`[pollJobStatus] Polling for response every ${interval}s... with no initial delay. Elapsed time is ${elapsedTime / 1000} seconds`)
            await delay(interval)
        }
        
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
                console.log(`[pollJobStatus] job status completed, model:${data.job.model}...`)
                const usedModel = data.job.model
                if (usedModel === 'b1') {
                    const params:{model: ModelsType} = {
                        model: 'b1'
                    } 
                    const chargedUser = await chargeUser(params)
                    if (!chargedUser) {
                        throw new Error('Encountered a server error. Please try again later.')
                    }
                    console.log(`User charged for b1 on job ${jobId}`)
                    return data
                } else if (usedModel === 'b2') {
                    const params:{model: ModelsType} = {
                        model: 'b2'
                    } 
                    const chargedUser = await chargeUser(params)
                    if (!chargedUser) {
                        throw new Error('Encountered a server error. Please try again later.')
                    }
                    console.log(`User charged for b2 on job ${jobId}`)
                    return data
                } else if (usedModel === 'd1') {
                    const params:{model: ModelsType} = {
                        model: 'd1'
                    } 
                    const chargedUser = await chargeUser(params)
                    if (!chargedUser) {
                        throw new Error('Encountered a server error. Please try again later.')
                    }
                    console.log(`User charged for d1 on job ${jobId}`)
                    return data
                } else {
                    console.log('[pollJobstatus] Unhandled model')
                    throw new Error('Something went wrong, please try again later.')
                }
                
            } else if (data.jobStatus === 'failed') {
                console.log(`[pollJobStatus] job status failed, model:${data.job.model}...`)
                const usedModel = data.job.model
                const statusCode = data.job?.code
                console.log('[PolljobStatus] Job error code - ', statusCode)
                if (usedModel === 'b1' || usedModel === 'b2' || usedModel === 'd1') {
                    if (statusCode > 400 && statusCode < 500) {
                        // check user errors
                        console.log('Checking User Error count for paid models...')
                        const resultCode = await checkUserErrors()
                        if (resultCode === 429) {
                            const params:{model: ModelsType} = {
                                model: 'b1'
                            } 
                            const chargedUser = await chargeUser(params)
                            if (!chargedUser) {
                                throw new Error('Encountered a server error. Please try again later.')
                            }

                            console.log(`User charged for 1 on job ${jobId} overwhelming errors.`)
                            return data
                        } else {
                            console.log('ERROR COUNT OK')
                            return data
                        }
                    } else {
                        // 500 error
                        
                        console.log('[pollJobStatus] Job failed due to non 400 error, returning data...')
                        return data
                        
                    }
                } else {
                    console.log('[PollJObStatus] Returning data for non paid models...')
                    return data
                }
                
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