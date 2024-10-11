import Markdown from 'markdown-to-jsx'
import React, { useEffect, useState } from 'react'
import { DEFAULT_BASE_URL } from '../config'

interface GetPolicyProps {
    serviceId: string
    policyKey: string
    baseUrl: string
    version?: 'latest' | 'next'
}

interface PolicyProps extends Omit<GetPolicyProps, 'baseUrl'>{
    className?: string
    onError?: (message: string) => void
    _baseUrlOverride?: string
}

/**
 * Fetches a policy document
 * @param serviceId
 * @param policyKey
 * @param version - 'latest' or 'next'
 * @param baseUrl
 */
async function fetchPolicy({
    serviceId,
    policyKey,
    version,
    baseUrl,
}: GetPolicyProps) {
    const url = new URL(`${baseUrl}/api/policies`)
    url.searchParams.append('sid', serviceId)
    url.searchParams.append('pkey', policyKey)

    if (version === 'next') {
        url.searchParams.append('include', 'futureVersions')
    }
    const result = await fetch(url, {
        headers: {
            Accept: 'application/json',
        },
    })
    if (result.status !== 200) {
        console.error(result.json())
        throw new Error(`Policy Unavailable: ${result.status}`)
    }

    const data = await result.json() as {
        key: string
        version: number
        title: string
        content: string
        futureVersions?: {
            id: string
            policyId: string
            version: number
            title: string
            content: string
            effectiveFrom: string
        }[]
    }

    if (version === 'next') {
        if (data.futureVersions && data.futureVersions.length > 0) {
            const nextVersion = data.futureVersions[0]
            return {
                key: nextVersion.policyId,
                version: nextVersion.version,
                title: nextVersion.title,
                content: nextVersion.content
            }
        } else {
            throw new Error(`Policy Unavailable: No future versions`)
        }
    } else {
        return {
            key: data.key,
            version: data.version,
            title: data.title,
            content: data.content
        }
    }
}

/**
 * Policy component - fetches and displays a policy document
 * @param props
 * @constructor
 */
export default function Policy({
    serviceId,
    policyKey,
    className,
    version = 'latest',
    onError,
    _baseUrlOverride
}: PolicyProps) {
    const [text, setText] = useState('')
    const baseUrl = _baseUrlOverride || DEFAULT_BASE_URL

    useEffect(() => {
        ;(async () => {
            try {
                const data = await fetchPolicy({
                    serviceId,
                    policyKey,
                    version,
                    baseUrl
                })
                setText(`# ${data.title}\n\n${data.content}`)
            } catch (e) {
                const message = e instanceof Error ? e.message : 'Policy Unavailable'
                onError?.(message)
                setText(message)
            }
        })()
    }, [])

    return (
        <>
            {
                // Load default CSS if no className is provided
                !className && <link rel="stylesheet" type="text/css" href={`${baseUrl}/default.css`} />
            }
            <div className={className || 'pops-Markdown'}>
                <Markdown>{text}</Markdown>
            </div>
        </>
    )
}
