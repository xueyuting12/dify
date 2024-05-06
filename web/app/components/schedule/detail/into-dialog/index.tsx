import type { FC } from 'react'
import React, { useState } from 'react'
import { t } from 'i18next'
import TextArea from 'rc-textarea'
import styles from './index.module.css'
import Button from '@/app/components/base/button'
import Modal from '@/app/components/base/modal'
type IProps = {
  isShow: boolean
  onClose: () => void
  onSuccess: (json: string) => void
}
const IntoDialog: FC<IProps> = ({ isShow, onClose, onSuccess }) => {
  const [json, setJson] = useState('')
  const handleTitleChange = (e: any) => {
    setJson(e.target.value)
  }
  const onConfirm = () => {
    onSuccess?.(json)
  }
  return (
    <Modal isShow={isShow} onClose={onClose} className={styles.intoDialogContainer} title={'导入配置'}>
      <div className={styles.inputContainer}>
        <TextArea
          className={styles.textArea}
          value={json}
          placeholder={t('schedule.intoDesc') || ''}
          onChange={handleTitleChange}
        />
      </div>
      <Button onClick={onConfirm}>{t('schedule.intoConfirm')}</Button>
    </Modal>
  )
}

export default IntoDialog
