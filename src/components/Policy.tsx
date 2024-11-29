import Markdown from 'markdown-to-jsx'
import React, { useEffect, useState } from 'react'
import { DEFAULT_BASE_URL } from '../config'
import { GetPolicyProps } from '../utils/fetchPolicy'
import { fetchPolicy } from '../utils'


interface PolicyProps extends Omit<GetPolicyProps, 'baseUrl'>{
    className?: string
    onError?: (message: string) => void
    _baseUrlOverride?: string
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
