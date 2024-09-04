import React from 'react'

interface PolicyProps {
    serviceId: string
    policyKey: string
}

/**
 * Policy component
 * @param props
 * @constructor
 */
export default function Policy(props: PolicyProps) {
    return (
        <div>
            <h1>Policy</h1>
            <p>Service ID: {props.serviceId}</p>
            <p>Policy Key: {props.policyKey}</p>
        </div>
    )
}
