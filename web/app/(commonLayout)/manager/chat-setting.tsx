'use client'

import React, { useEffect, useState } from 'react'
import TextArea from 'rc-textarea'
import { useTranslation } from 'react-i18next'
import type { Item } from '@/app/components/base/select'
import { SimpleSelect } from '@/app/components/base/select'
import Button from '@/app/components/base/button'
import { fetchCurrentLLM, fetchLLMList, fetchPrompt, updateLLM, updatePrompt } from '@/service/chatTask'
import Drawer from '@/app/components/base/drawer-plus'

const intervalTimeList = ['1', '2', '3', '4', '5', '6', '7', '8']
// const intervalTimeList = ['2', '4', '6', '8', '10']
let isLLMChange = false
let isPromptChange = false

type CharSetting = {
  showDrawer: boolean
  onClose: () => void
}

const ChatSetting = ({
  showDrawer,
  onClose,
}: CharSetting) => {
  const { t } = useTranslation()
  const locInterval = localStorage.getItem('CHAT_TASK_INTERVAL')
  const [llmList, setLLMList] = useState<Item[]>([])
  const [llm, setllm] = useState('')
  const [prompt, setPrompt] = useState('')
  const [intervalTime, setIntervalTime] = useState<string>()

  const getInitInfo = async () => {
    const tempLLMList = await fetchLLMList()
    setLLMList(tempLLMList.map((attr: string) => ({
      value: attr,
      name: attr,
    })))
    const tempLLM = await fetchCurrentLLM()
    setllm(tempLLM)
    const tempPrompt = await fetchPrompt()
    setPrompt(tempPrompt)
  }

  useEffect(() => {
    getInitInfo()
    if (!locInterval) {
      localStorage.setItem('CHAT_TASK_INTERVAL', '3')
      setIntervalTime('3')
    }
    else {
      setIntervalTime(locInterval)
    }
  }, [])

  const handleValueChange = (key: string, value: string) => {
    if (key === 'llm') {
      isLLMChange = true
      setllm(value)
    }
    if (key === 'prompt') {
      isPromptChange = true
      setPrompt(value)
    }
  }

  const handleSave = async () => {
    if (isLLMChange) {
      await updateLLM(llm)
      isLLMChange = false
    }
    if (isPromptChange) {
      await updatePrompt(prompt)
      isPromptChange = false
    }
    if (locInterval !== intervalTime)
      localStorage.setItem('CHAT_TASK_INTERVAL', String(intervalTime))
    onClose()
  }

  return (
    <Drawer
      isShow={showDrawer}
      onHide={onClose}
      title="设置"
      panelClassName='mt-2 !w-[760px]'
      maxWidthClassName='!max-w-[760px]'
      height='calc(100vh - 16px)'
      contentClassName='!bg-gray-100 p-4'
      headerClassName='!border-b-black/5'
      isShowMask={true}
      clickOutsideNotOpen={false}
      body={
        <div className='py-1 px-3 h-full overflow-auto'>
          <div>
            <div className='leading-9 text-sm font-medium text-gray-900'>
              {t('tools.builtInPromptTitle')}
            </div>
            <TextArea
              value={prompt}
              onChange={e => handleValueChange('prompt', e.target.value)}
              className='mt-1 block w-full leading-5 max-h-none outline-none appearance-none resize-none bg-gray-50 rounded-lg border text-sm text-gray-700'
              autoFocus
              autoSize={{ minRows: 16, maxRows: 16 }} />
          </div>
          <div className='py-2'>
            <div className='leading-9 text-sm font-medium text-gray-900'>
              {t('common.modelProvider.model')}
            </div>
            <SimpleSelect
              className='bg-gray-50'
              defaultValue={llm}
              items={llmList}
              onSelect={item => handleValueChange('llm', item.name)} />
          </div>
          <div className='py-2'>
            <div className='leading-9 text-sm font-medium text-gray-900'>
              {'刷新时间'}
            </div>
            <SimpleSelect
              defaultValue={intervalTime}
              className='bg-gray-50'
              items={intervalTimeList.map(attr => ({ value: attr, name: attr }))}
              onSelect={(item) => { setIntervalTime(item.value as string) }} />
          </div>
          <div className='text-right mt-2'>
            <Button
              onClick={handleSave}
              className='!h-9 !text-sm !font-medium'
              type="primary">
              {t('common.operation.settings')}
            </Button>
          </div>
        </div>} />
  )
}

export default ChatSetting
