import { Fragment, ReactElement, ReactNode, useEffect, useState } from 'react'
import { DEFAULT_BASE_URL } from '../config'
import { OptInDialog } from '../index'
import IOptInRequest from '../models/OptInRequest.dto'

interface PolicyProviderProps {
    serviceId: string
    userId?: string
    userProperties?: { [key: string]: string | number | boolean | null | undefined } | string
    children: ReactNode
    apiBaseUrl?: string
    markdownClassName?: string
    dialogRender?: (props: {
        open: boolean
        optInRequest: IOptInRequest
        onClose: () => void
        onOptIn: (optInRequest: IOptInRequest, agree: boolean) => void
    }) => ReactElement
    onError?: (message: string) => void
}

function checkAndGetUserId(
    userProperties?: { [key: string]: string | number | boolean | null | undefined } | string,
): string | undefined {
    if (!userProperties || typeof userProperties !== 'string') {
        return undefined
    }
    // Here we expect the userProperties to be a base64 encoded string with the userId
    const possiblySignedParams = userProperties.split('.')
    if (possiblySignedParams.length !== 2) {
        throw new Error('userProperties were given, but not properly signed.')
    }
    let decodedData
    try {
        decodedData = JSON.parse(Buffer.from(possiblySignedParams[0], 'base64').toString('utf-8'))
    } catch (e) {
        const error = e as Error
        throw new Error(
            `userProperties were given, but is not a valid JSON or not base64 encoded format (${error.message})`,
        )
    }
    if (!decodedData['userId']) {
        throw new Error('`userId` is missing in the signed `userProperties`')
    }
    return decodedData['userId'].toString()
}

/**
 * OptInProvider is a component that fetches the opt-in requests for a user and displays them as a dialog.
 * @param serviceId
 * @param userId
 * @param userProperties - an object or a base64 encoded string
 * @param children
 * @param apiBaseUrl
 * @param markdownClassName
 * @constructor
 */
export default function OptInProvider({
    serviceId,
    userId,
    userProperties,
    children,
    apiBaseUrl,
    markdownClassName,
    dialogRender,
    onError = console.error,
}: PolicyProviderProps) {
    const [optInRequests, setOptInRequests] = useState<(IOptInRequest & { open: boolean })[]>([])
    const baseUrl = apiBaseUrl || DEFAULT_BASE_URL
    userId = checkAndGetUserId(userProperties) || userId

    useEffect(() => {
        
        if (!serviceId) {
            onError?.('`serviceId` is missing')
            return
        }
        if (!userId) {
            onError?.('`userId` are required either as a `props` value or in `userProperties`')
            return
        }
        ;(async () => {
            try {
                const b64Props =
                    typeof userProperties === 'string'
                        ? userProperties
                        : Buffer.from(JSON.stringify(userProperties)).toString('base64')
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
                onError?.(`Error while fetching optInRequests: ${error.message}`)
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
                props: userProperties,
            }),
        })
        if (result.status !== 200) {
            onError?.(`Failed to save: ${result.statusText}`)
        }
        // Remove the current optInRequest from the list
        setOptInRequests(optInRequests.filter((o) => o.id !== optInRequest.id))
    }

    // This should cover up the entire screen when not hidden and show the dialog
    return (
        <Fragment>
            {children}
            {optInRequests.length > 0 && (
                dialogRender ? 
                    dialogRender({
                        open: optInRequests[0].open,
                        optInRequest: optInRequests[0],
                        onClose: () => {
                            setOptInRequests(optInRequests.filter((o) => o.id !== optInRequests[0].id))
                        },
                        onOptIn: handleOptIn,
                    }) : (
                    <OptInDialog
                        open={optInRequests[0].open}
                        optInRequest={optInRequests[0]}
                        onClose={() =>
                            setOptInRequests(optInRequests.filter((o) => o.id !== optInRequests[0].id))
                        }
                        onOptIn={handleOptIn}
                        className={markdownClassName}
                    />
                )
            )}
        </Fragment>
    )
}
