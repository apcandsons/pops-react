import { sign, verifySignedData } from './sign'

describe('sign', () => {
    it('returns a valid signed string for valid input', async () => {
        const userParams = { name: 'John', age: 30 }
        const key = 'secret'
        const signedData = await sign(userParams, key)
        expect(signedData).toMatch(/^[A-Za-z0-9+/=]+\.[A-Za-z0-9+/=]+$/)
    })

    it('handles empty userParams', async () => {
        const userParams = {}
        const key = 'secret'
        const signedData = await sign(userParams, key)
        expect(signedData).toMatch(/^[A-Za-z0-9+/=]+\.[A-Za-z0-9+/=]+$/)
    })

    it('handles null values in userParams', async () => {
        const userParams = { name: 'John', age: null }
        const key = 'secret'
        const signedData = await sign(userParams, key)
        expect(signedData).toMatch(/^[A-Za-z0-9+/=]+\.[A-Za-z0-9+/=]+$/)
    })
})

describe('verifySignedData', () => {
    it('returns true for valid signed data', async () => {
        const userParams = { name: 'John', age: 30 }
        const key = 'secret'
        const signedData = await sign(userParams, key)
        const isValid = await verifySignedData(signedData, key)
        expect(isValid).toBe(true)
    })

    it('returns false for tampered signed data', async () => {
        const userParams = { name: 'John', age: 30 }
        const key = 'secret'
        const signedData = await sign(userParams, key)
        const tamperedData = signedData.replace(/.$/, 'A')
        const isValid = await verifySignedData(tamperedData, key)
        expect(isValid).toBe(false)
    })

    it('returns false for incorrect key', async () => {
        const userParams = { name: 'John', age: 30 }
        const key = 'secret'
        const signedData = await sign(userParams, key)
        const isValid = await verifySignedData(signedData, 'wrongkey')
        expect(isValid).toBe(false)
    })
})
