import { Fragment, ReactNode, useEffect, useState } from 'react'
import { DEFAULT_BASE_URL } from '../config'
import { OptInDialog } from '../index'
import IOptInRequest from '../models/OptInRequest.dto'

interface PolicyProviderProps {
    serviceId: string
    userId: string
    userProperties?: { [key: string]: string | number | boolean | null | undefined }
    children: ReactNode
    apiBaseUrl?: string
    markdownClassName?: string
}

export default function OptInProvider({
    serviceId,
    userId,
    userProperties,
    children,
    apiBaseUrl,
    markdownClassName,
}: PolicyProviderProps) {
    const [optInRequests, setOptInRequests] = useState<(IOptInRequest & { open: boolean })[]>([])
    const baseUrl = apiBaseUrl || DEFAULT_BASE_URL

    useEffect(() => {
        if (!serviceId || !userId) {
            console.error('serviceId and userId are required')
            return
        }
        ;(async () => {
            try {
                const b64Props = Buffer.from(JSON.stringify(userProperties)).toString('base64')
                const url = `${baseUrl}/api/opt-ins?sid=${serviceId}&uid=${userId}&props=${b64Props}`
                const result = await fetch(new URL(url), {
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                    },
                })
                const data = (await result.json()) as {
                    optInRequests: IOptInRequest[]
                }
                if (data.optInRequests.length === 0) {
                    return
                }
                setOptInRequests(data.optInRequests.map((o) => ({ ...o, open: true })))
            } catch (e) {
                const error = e as Error
                console.error(`Error while fetching optInRequests: ${error.message}`)
            }
        })()
    }, [serviceId, userId, userProperties])

    const handleOptIn = async (optInRequest: IOptInRequest, agree: boolean) => {
        const url = `${baseUrl}/api/opt-ins?sid=${serviceId}`
        const result = await fetch(new URL(url), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                uid: userId,
                csrfToken: optInRequest.csrfToken,
                agree,
            }),
        })
        if (result.status !== 200) {
            throw new Error(`Failed to save: ${result.statusText}`)
        }
        // Remove the current optInRequest from the list
        setOptInRequests(optInRequests.filter((o) => o.id !== optInRequest.id))
    }

    // This should cover up the entire screen when not hidden and show the dialog
    return (
        <Fragment>
            {children}
            {optInRequests.length > 0 && (
                <OptInDialog
                    open={optInRequests[0].open}
                    optInRequest={optInRequests[0]}
                    onClose={() =>
                        setOptInRequests(optInRequests.filter((o) => o.id !== optInRequests[0].id))
                    }
                    onOptIn={handleOptIn}
                    className={markdownClassName}
                />
            )}
        </Fragment>
    )
}
