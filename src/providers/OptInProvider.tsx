import { Fragment, ReactNode, useEffect, useState } from 'react'
import { DEFAULT_BASE_URL } from '../config'
import OptInDialog from './OptInDialog'

interface PolicyProviderProps {
    serviceId: string
    userId: string
    userProperties?: { [key: string]: string | number | boolean | null | undefined }
    children: ReactNode
    _baseUrlOverride?: string
}

export default function OptInProvider({
    serviceId,
    userId,
    userProperties,
    children,
    _baseUrlOverride,
}: PolicyProviderProps) {
    const [open, setOpen] = useState(false)
    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')
    const [csrfToken, setCsrfToken] = useState('')
    const baseUrl = _baseUrlOverride || DEFAULT_BASE_URL

    useEffect(() => {
        if (!serviceId || !userId) {
            console.info('serviceId and userId are required')
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
                    optInRequests: {
                        id: string
                        title: string
                        content: string
                        startDisplayAt: Date
                        enforceAfter?: Date
                        csrfToken: string
                    }[]
                }
                if (data.optInRequests.length === 0) {
                    return
                }
                const optInReq = data.optInRequests[0]
                setTitle(optInReq.title)
                setContent(optInReq.content)
                setCsrfToken(optInReq.csrfToken)
                setOpen(true)
            } catch (e) {
                const error = e as Error
                console.error(`Error while fetching optInRequests: ${error.message}`)
                console.error(`Stack trace`, error.stack)
            }
        })()
    }, [serviceId, userId, userProperties])

    const handleClose = () => {
        setOpen(false)
    }

    const handleSave = async (agree: boolean) => {
        const url = `${baseUrl}/api/opt-ins?sid=${serviceId}`
        const result = await fetch(new URL(url), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                uid: userId,
                csrfToken,
                agree,
            }),
        })
        if (result.status !== 200) {
            throw new Error(`Failed to save: ${result.statusText}`)
        }
        handleClose()
    }

    // This should cover up the entire screen when not hidden and show the dialog
    return (
        <Fragment>
            {children}
            <OptInDialog
                open={open}
                title={title}
                content={content}
                onClose={handleClose}
                onSave={handleSave}
            />
        </Fragment>
    )
}
