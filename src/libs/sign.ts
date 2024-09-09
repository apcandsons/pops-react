export async function sign(
    userParams: { [key: string]: string | number | boolean | null },
    key: string,
) {
    const base64Params = Buffer.from(JSON.stringify(userParams)).toString('base64')
    const crypto = require('crypto')
    const signature = crypto.createHmac('sha256', key).update(base64Params).digest('base64')
    return `${base64Params}.${signature}`
}

export async function verifySignedData(signedData: string, key: string) {
    const [base64Params, signature] = signedData.split('.')
    const crypto = require('crypto')
    const calculatedSignature = crypto.createHmac('sha256', key).update(base64Params).digest('base64')
    return signature === calculatedSignature
}
