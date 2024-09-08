export default interface IOptInRequest {
    id: string
    title: string
    content: string
    startDisplayAt: Date
    enforceAfter?: Date
    csrfToken: string
}
