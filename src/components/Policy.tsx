import Markdown from 'markdown-to-jsx'
import React, { useEffect, useState } from 'react'
import { DEFAULT_BASE_URL } from '../config'

interface GetPolicyProps {
    serviceId: string
    policyKey: string
    baseUrl: string
}

interface PolicyProps extends Omit<GetPolicyProps, 'baseUrl'>{
    className?: string
    _baseUrlOverride?: string
}

/**
 * Fetches a policy document
 * @param serviceId
 * @param policyKey
 * @param baseUrl
 */
async function fetchPolicy({
    serviceId,
    policyKey,
    baseUrl,
}: GetPolicyProps) {
    const url = `${baseUrl}/api/policies?sid=${serviceId}&pkey=${policyKey}`
    const result = await fetch(new URL(url), {
        headers: {
            Accept: 'application/json',
        },
    })
    if (result.status !== 200) {
        console.error(result.json())
        throw new Error(`Policy Unavailable: ${result.status}`)
    }
    return (await result.json()) as {
        key: string
        version: number
        title: string
        content: string
    }
}

/**
 * Policy component - fetches and displays a policy document
 * @param props
 * @constructor
 */
export default function Policy({ serviceId, policyKey, className, _baseUrlOverride }: PolicyProps) {
    const [text, setText] = useState('')
    const baseUrl = _baseUrlOverride || DEFAULT_BASE_URL

    useEffect(() => {
        ;(async () => {
            try {
                const data = await fetchPolicy({ serviceId, policyKey, baseUrl })
                setText(`# ${data.title}\n\n${data.content}`)
            } catch (e) {
                if ( e instanceof Error) {
                    setText(e.message)
                }else {
                    setText('Policy Unavailable')
                }
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
