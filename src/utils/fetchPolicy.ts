import { DEFAULT_BASE_URL } from '../config'

export interface GetPolicyProps {
    serviceId: string
    policyKey: string
    baseUrl?: string
    version?: 'latest' | 'next'
}

/**
 * Fetches a policy document
 * @param serviceId
 * @param policyKey
 * @param version - 'latest' or 'next'
 * @param baseUrl
 */
export default async function fetchPolicy({
    serviceId,
    policyKey,
    version,
    baseUrl = DEFAULT_BASE_URL,
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
