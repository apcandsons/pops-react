import Markdown from 'markdown-to-jsx'
import React, { useEffect, useState } from 'react'
import { DEFAULT_BASE_URL } from '../config'

interface PolicyProps {
    serviceId: string
    policyKey: string
    className?: string
    _baseUrlOverride?: string
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
        const url = `${baseUrl}/api/policies?sid=${serviceId}&pkey=${policyKey}`
        ;(async () => {
            try {
                const result = await fetch(new URL(url), {
                    headers: {
                        Accept: 'application/json',
                    },
                })
                if (result.status !== 200) {
                    console.error(result.json())
                    setText(`Policy Unavailable: ${result.status}`)
                    return
                }
                const data = (await result.json()) as {
                    key: string
                    version: number
                    title: string
                    content: string
                }
                setText(`# ${data.title}\n\n${data.content}`)
            } catch (e) {
                const error = e as Error
                setText(`Policy Unavailable: ${error.message}`)
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
