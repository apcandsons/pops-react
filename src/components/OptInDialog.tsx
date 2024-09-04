/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react'
import React, { useState } from 'react'

interface OptInDialogProps {
    open: boolean
    title: string
    content: string
    onClose: () => void
    onSave: (agree: boolean) => void
}

export default function OptInDialog({ open, title, content, onClose, onSave }: OptInDialogProps) {
    const [agree, setAgree] = useState(false)

    if (!open) {
        return null
    }

    return (
        <div css={dialogBackdrop}>
            <div css={dialog}>
                <div css={dialogTitle}>{title}</div>
                <div css={dialogContent}>
                    <div css={dialogContent}>{content}</div>
                </div>
                <div css={dialogActions}>
                    <label css={formControlLabel}>
                        <input
                            type="checkbox"
                            checked={agree}
                            onChange={(e) => setAgree(e.target.checked)}
                        />
                        上記の内容に同意します
                    </label>
                    <button css={buttonContained} onClick={() => onSave(agree)} disabled={!agree}>
                        回答を保存
                    </button>
                    <button css={buttonText} onClick={onClose}>
                        今はスキップする
                    </button>
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
    width: 500px;
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
`

const markdownContent = css`
    font-size: 1rem;
    line-height: 1.5;
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
