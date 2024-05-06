import type { FC } from 'react'
import React, { useState } from 'react'
import cn from 'classnames'
import { useRouter } from 'next/navigation'
import { t } from 'i18next'
import style from '../list.module.css'
import s from './style.module.css'
import NewFlowCardDialog from './NewFlowCardDialog'
import type { AgentFlowItem } from '@/models/schedule'
import Divider from '@/app/components/base/divider'
import type { HtmlContentProps } from '@/app/components/base/popover'
import CustomPopover from '@/app/components/base/popover'
import { fetchDeleteAgentFlow } from '@/service/schedule'
type IProps = {
  flow: AgentFlowItem
  onSuccess?: () => void
}
const ScheduleCard: FC<IProps> = ({ flow, onSuccess }) => {
  const { push } = useRouter()
  const [showNewAppDialog, setShowNewAppDialog] = useState(false)
  const Operations = (props: HtmlContentProps) => {
    const onClickSettings = async (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation()
      props.onClick?.()
      e.preventDefault()
      setShowNewAppDialog(true)
    }
    const onClickDelete = async (e: React.MouseEvent<HTMLDivElement>) => {
      e.stopPropagation()
      props.onClick?.()
      e.preventDefault()
      const res = await fetchDeleteAgentFlow(flow.id)
      if (res.result)
        onSuccess?.()
    }
    return (
      <div className="w-full py-1">
        <button className={s.actionItem} onClick={onClickSettings}>
          <span className={s.actionName}>{t('common.operation.settings')}</span>
        </button>

        <Divider className="!my-1" />
        <div
          className={cn(s.actionItem, s.deleteActionItem, 'group')}
          onClick={onClickDelete}
        >
          <span className={cn(s.actionName, 'group-hover:text-red-500')}>
            {t('common.operation.delete')}
          </span>
        </div>
      </div>
    )
  }
  const onCreateDialogClose = () => {
    setShowNewAppDialog(false)
  }
  const onCreateDialogSuccess = () => {
    setShowNewAppDialog(false)
    onSuccess?.()
  }
  return (
    <div
      key={flow.id}
      className={style.listItem}
      onClick={(e) => {
        e.preventDefault()
        push(`/schedule/detail?id=${flow.id}`)
      }}
    >
      <div className={style.listItemTitle}>
        <div className={style.listItemHeading}>
          <div className={style.listItemHeadingContent}>{flow.name}</div>
        </div>
        <CustomPopover
          htmlContent={<Operations />}
          position="br"
          trigger="click"
          btnElement={<div className={cn(s.actionIcon, s.commonIcon)} />}
          btnClassName={open =>
            cn(
              open ? '!bg-gray-100 !shadow-none' : '!bg-transparent',
              style.actionIconWrapper,
            )
          }
          className={'!w-[128px] h-fit !z-20'}
          manualClose
        />
      </div>
      <div className={s.descText}>备注：{flow.description || '-'}</div>
      <NewFlowCardDialog show={showNewAppDialog} currentData={flow} onClose={onCreateDialogClose} onSuccess={onCreateDialogSuccess}/>
    </div>
  )
}

export default ScheduleCard
