/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react'
import React, { Children, useEffect, useRef, useState } from 'react'

interface ButtonWithOptionsProps {
    children: React.ReactNode[]
    onPrimaryButtonClick: () => void
    label: string
}

export default function ButtonWithOptions(props: ButtonWithOptionsProps) {
    const { children, onPrimaryButtonClick, label } = props
    const [open, setOpen] = useState(false)
    const anchorEl = useRef<HTMLDivElement>(null)

    const handleClickOutside = (event: MouseEvent) => {
        if (anchorEl.current && !anchorEl.current.contains(event.target as Node)) {
            setOpen(false)
        }
    }

    useEffect(() => {
        if (open) {
            document.addEventListener('mousedown', handleClickOutside)
        } else {
            document.removeEventListener('mousedown', handleClickOutside)
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [open])

    return (
        <div ref={anchorEl} css={containerStyle}>
            <div css={buttonGroupStyle}>
                <button css={primaryButtonStyle} onClick={onPrimaryButtonClick}>
                    {label}
                </button>
                <button
                    css={dropdownButtonStyle}
                    onClick={() => setOpen((prev) => !prev)}
                    style={{ paddingLeft: '8px' }}
                >
                    ▼
                </button>
            </div>
            {open && (
                <div css={dropdownMenuStyle}>
                    <ul css={menuListStyle}>
                        {Children.map(children, (child, index) => (
                            <li key={index} css={menuItemStyle}>
                                {child}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    )
}

// Styles
const containerStyle = css`
    display: inline-block;
    position: relative;
`

const buttonGroupStyle = css`
    display: flex;
`

const primaryButtonStyle = css`
    background-color: #1976d2;
    color: white;
    border: none;
    padding: 8px 16px;
    cursor: pointer;
    border-radius: 4px 0 0 4px;
    &:hover {
        background-color: #1565c0;
    }
`

const dropdownButtonStyle = css`
    background-color: #1976d2;
    color: white;
    border: none;
    padding: 8px;
    cursor: pointer;
    border-radius: 0 4px 4px 0;
    &:hover {
        background-color: #1565c0;
    }
`

const dropdownMenuStyle = css`
    position: absolute;
    top: 100%;
    right: 0;
    z-index: 1;
    background-color: white;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.5);
    border-radius: 4px;
    overflow: hidden;
    margin-top: 4px;
`

const menuListStyle = css`
    margin: 0;
    padding: 0;
    list-style: none;
`

const menuItemStyle = css`
    padding: 8px 16px;
    cursor: pointer;
    &:hover {
        background-color: #f5f5f5;
    }
`
