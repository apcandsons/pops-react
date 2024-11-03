/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react'
import Markdown from 'markdown-to-jsx'
import { useEffect, useState } from 'react'
import IOptInRequest from '../models/OptInRequest.dto'
import ButtonWithOptions from './ButtonWithOptions'

interface OptInDialogProps {
    open: boolean
    optInRequest: IOptInRequest
    onClose: () => void
    onOptIn: (optInRequest: IOptInRequest, agree: boolean) => void
    className?: string
}

export default function OptInDialog({
    open,
    optInRequest,
    onClose,
    onOptIn,
    className,
}: OptInDialogProps) {
    className = className || 'pops-Markdown'
    const [agree, setAgree] = useState(false)
    const [skipUntil, setSkipUntil] = useState<Date | null>(null)
    const [preventRender, setPreventRender] = useState(true)

    useEffect(() => {
        const item = localStorage.getItem(`pops/opt-ins/${optInRequest.id}/skipUntil`)
        if (item) {
            setSkipUntil(new Date(item))
        }
        setPreventRender(false)
    }, [])

    useEffect(() => {
        if (optInRequest.enforceAfter && new Date(optInRequest.enforceAfter) <= new Date()) {
            return // Can't skip enforced opt-ins
        }
        if (skipUntil && skipUntil > new Date()) {
            onClose()
        }
    }, [skipUntil])

    const handleSkipDays = (days: number) => () => {
        const skipUntil = new Date()
        skipUntil.setDate(skipUntil.getDate() + days)
        localStorage.setItem(`pops/opt-ins/${optInRequest.id}/skipUntil`, skipUntil.toISOString())
        setSkipUntil(skipUntil)
    }

    if (!open || preventRender) {
        return null
    }

    const enforced = optInRequest.enforceAfter && new Date(optInRequest.enforceAfter) <= new Date()

    return (
        <div css={dialogBackdrop}>
            <div css={dialog}>
                <div css={dialogTitle}>{optInRequest.title}</div>
                <div css={dialogContent}>
                    <div className={className}>
                        <Markdown>{optInRequest.content}</Markdown>
                    </div>
                </div>
                <div css={dialogFooter}>
                    <label css={formControlLabel}>
                        <input
                            type="checkbox"
                            checked={agree}
                            onChange={(e) => setAgree(e.target.checked)}
                        />
                        上記の内容に同意します
                    </label>
                    <div css={dialogActions}>
                        <button
                            css={buttonContained}
                            onClick={() => onOptIn(optInRequest, agree)}
                            disabled={!agree}
                        >
                            回答を保存
                        </button>
                        {!enforced ? (
                            <ButtonWithOptions onPrimaryButtonClick={onClose} label="今はスキップする">
                                <div style={{ width: '160px' }} onClick={handleSkipDays(1)}>
                                    1日間スキップする
                                </div>
                                <div onClick={handleSkipDays(3)}>3日間スキップする</div>
                                <div onClick={handleSkipDays(7)}>7日間スキップする</div>
                                <div onClick={handleSkipDays(14)}>14日間スキップする</div>
                                <div onClick={handleSkipDays(30)}>30日間スキップする</div>
                            </ButtonWithOptions>
                        ) : (
                            <button
                                css={buttonTextDisabled}
                                title="本内容は必ず同意いただく必要があります"
                            >
                                今はスキップする
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

const dialogBackdrop = css`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
`

const dialog = css`
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 3px 5px rgba(0, 0, 0, 0.2);
    width: 600px;
    max-width: 90%;
    padding: 20px;
`

const dialogTitle = css`
    font-size: 1.5rem;
    font-weight: bold;
    margin-bottom: 16px;
`

const dialogContent = css`
    margin-bottom: 20px;
    max-height: 400px;
    overflow-y: scroll;
`

const dialogFooter = css`
    display: flex;
    flex-direction: row;
    gap: 10px;
    @media (max-width: 1024px) {
        flex-direction: column;
    }
`

const dialogActions = css`
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 10px;
`

const formControlLabel = css`
    flex-grow: 1;
    display: flex;
    align-items: center;
    font-size: 0.9rem;
`

const buttonContained = css`
    background-color: #1976d2;
    color: white;
    padding: 6px 16px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.875rem;
    text-transform: uppercase;
    &:disabled {
        background-color: #9e9e9e;
        cursor: not-allowed;
    }
`

const buttonText = css`
    background: none;
    color: #1976d2;
    border: none;
    cursor: pointer;
    padding: 6px 16px;
    font-size: 0.875rem;
`

const buttonTextDisabled = css`
    background: none;
    color: #9e9e9e;
    border: none;
    cursor: not-allowed;
    padding: 6px 16px;
    font-size: 0.875rem;
`
