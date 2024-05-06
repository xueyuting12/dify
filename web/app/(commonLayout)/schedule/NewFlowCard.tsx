'use client'

import type { FC } from 'react'
import { useState } from 'react'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'
import style from '../list.module.css'
import NewFlowCardDialog from './NewFlowCardDialog'
type IProps = {
  onSuccess: () => void
}
const CreateFlowCard: FC<IProps> = ({ onSuccess }) => {
  const { t } = useTranslation()
  const [showNewAppDialog, setShowNewAppDialog] = useState(false)
  const handleCreateNewFlowCard = () => {
    setShowNewAppDialog(true)
  }
  const onCreateDialogClose = () => {
    setShowNewAppDialog(false)
  }

  const onCreateDialogSuccess = () => {
    setShowNewAppDialog(false)
    onSuccess?.()
  }
  return (
    <div className={classNames(style.listItem, style.newItemCard)}>
      <div className={style.listItemTitle} onClick={handleCreateNewFlowCard}>
        <span className={style.newItemIcon}>
          <span
            className={classNames(style.newItemIconImage, style.newItemIconAdd)}
          />
        </span>
        <div
          className={classNames(
            style.listItemHeading,
            style.newItemCardHeading,
          )}
        >
          {t('schedule.createFlowCard')}
        </div>
      </div>
      <NewFlowCardDialog show={showNewAppDialog} onClose={onCreateDialogClose} onSuccess={onCreateDialogSuccess}/>
    </div>
  )
}

export default CreateFlowCard
