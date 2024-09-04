import React, { useState } from 'react'
import styles from './OptInDialog.module.css'

interface OptInDialog {
    open: boolean
    title: string
    content: string
    onClose: () => void
    onSave: (agree: boolean) => void
}

const OptInDialog = ({ open, title, content, onClose, onSave }: OptInDialog) => {
    const [agree, setAgree] = useState(false)

    if (!open) {
        return null
    }

    return (
        <div className={styles.dialogBackdrop}>
            <div className={styles.dialog}>
                <div className={styles.dialogTitle}>{title}</div>
                <div className={styles.dialogContent}>
                    <div className={styles.dialogContent}>{content}</div>
                </div>
                <div className={styles.dialogActions}>
                    <label className={styles.formControlLabel}>
                        <input
                            type="checkbox"
                            checked={agree}
                            onChange={(e) => setAgree(e.target.checked)}
                        />
                        上記の内容に同意します
                    </label>
                    <button
                        className={styles.buttonContained}
                        onClick={() => onSave(agree)}
                        disabled={!agree}
                    >
                        回答を保存
                    </button>
                    <button className={styles.buttonText} onClick={onClose}>
                        今はスキップする
                    </button>
                </div>
            </div>
        </div>
    )
}

export default OptInDialog
