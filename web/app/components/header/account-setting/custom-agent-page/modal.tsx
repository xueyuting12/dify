import type { FC } from 'react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ReactSortable } from 'react-sortablejs'
import Modal from '@/app/components/base/modal'
import Button from '@/app/components/base/button'
import { Plus, Trash03 } from '@/app/components/base/icons/src/vender/line/general'
import type { AgentTypes } from '@/models/app'
import { useToastContext } from '@/app/components/base/toast'
import { createAgentTypes, updateAgentTypes } from '@/service/apps'

type CustomEditModalProps = {
  showModal: boolean
  data: AgentTypes | null
  onCancel: () => void
  onSuccess: () => void
}
const CustomEditModal: FC<CustomEditModalProps> = ({
  showModal,
  data,
  onCancel,
  onSuccess,
}) => {
  const { t } = useTranslation()
  const [localeData, setLocaleData] = useState(data)
  const [tempValue, setTempValue] = useState('')
  const MAX_QUESTION_NUM = 5
  const [tempSuggestedQuestions, setTempSuggestedQuestions] = useState<string[]>([])
  const { notify } = useToastContext()

  useEffect(() => {
    setLocaleData(data)
    setTempValue('')
    setTempSuggestedQuestions([])
    if (data?.suggested_questions) {
      const tempQuestion = JSON.parse(data.suggested_questions)
      const keys = Object.keys(tempQuestion)
      if (keys.length) {
        setTempValue(keys[0])
        setTempSuggestedQuestions(tempQuestion[keys[0]])
      }
    }
  }, [showModal])

  const handleDataChange = (type: string, value: string) => {
    setLocaleData({ ...localeData, [type]: value })
  }

  const handleSave = async () => {
    let suggested_questions = ''
    if (tempValue)
      suggested_questions = JSON.stringify({ [tempValue]: tempSuggestedQuestions.filter(item => item) })

    if (localeData?.id) {
      await updateAgentTypes({
        ai_agent_id: localeData.id,
        ai_agent_name: localeData.ai_agent_name,
        host: localeData.host,
        url: localeData.url,
        desc: localeData.desc,
        suggested_questions,
      })
    }
    else {
      await createAgentTypes({ ...localeData, suggested_questions })
    }
    notify({ type: 'success', message: t('common.customAgent.modifiedSuccessfully') })
    onCancel()
    onSuccess()
  }

  return (
    <Modal
      isShow={showModal}
      onClose={onCancel}
      wrapperClassName='!z-[103]'
      className='!p-8 !pb-6 !max-w-none !w-[640px]'
    >
      <div className='py-2'>
        <div className='leading-9 text-sm font-medium text-gray-900'>
          {t('common.customAgent.agentName')}
        </div>
        <input
          value={localeData?.ai_agent_name || ''}
          onChange={e => handleDataChange('ai_agent_name', e.target.value)}
          className='block px-3 w-full h-9 bg-gray-100 rounded-lg text-sm text-gray-900 outline-none appearance-none'
          placeholder={t('common.customAgent.agentNamePlaceholder') || ''}
        />
      </div>
      <div className='py-2'>
        <div className='leading-9 text-sm font-medium text-gray-900'>
          {t('common.customAgent.host')}
        </div>
        <input
          value={localeData?.host || ''}
          onChange={e => handleDataChange('host', e.target.value)}
          className='block px-3 w-full h-9 bg-gray-100 rounded-lg text-sm text-gray-900 outline-none appearance-none'
          placeholder={t('common.customAgent.hostPlaceholder') || ''}
        />
      </div>
      <div className='py-2'>
        <div className='leading-9 text-sm font-medium text-gray-900'>
          {t('common.customAgent.url')}
        </div>
        <input
          value={localeData?.url || ''}
          onChange={e => handleDataChange('url', e.target.value)}
          className='block px-3 w-full h-9 bg-gray-100 rounded-lg text-sm text-gray-900 outline-none appearance-none'
          placeholder={t('common.customAgent.urlPlaceholder') || ''}
        />
      </div>
      <div className='py-2'>
        <div className='leading-9 text-sm font-medium text-gray-900'>
          {t('common.customAgent.desc')}
        </div>
        <input
          value={localeData?.desc || ''}
          onChange={e => handleDataChange('desc', e.target.value)}
          className='block px-3 w-full h-9 bg-gray-100 rounded-lg text-sm text-gray-900 outline-none appearance-none'
          placeholder={t('common.customAgent.descPlaceholder') || ''}
        />
      </div>
      <div className='py-2'>
        <div className='leading-9 text-sm font-medium text-gray-900'>
          {t('common.customAgent.openingStatement')}
        </div>
        <div>
          <textarea
            value={tempValue}
            rows={3}
            onChange={e => setTempValue(e.target.value)}
            className="w-full px-0 text-sm  border-0 bg-transparent focus:outline-none "
            placeholder={t('common.customAgent.openingStatementPlaceholder') as string}
          >
          </textarea>
        </div>
        <div>
          <div className='flex items-center py-2'>
            <div className='shrink-0 flex space-x-0.5 leading-[18px] text-xs font-medium text-gray-500'>
              <div className='uppercase'>{t('appDebug.openingStatement.openingQuestion')}</div>
              <div>·</div>
              <div>{tempSuggestedQuestions.length}/{MAX_QUESTION_NUM}</div>
            </div>
            <div className='ml-3 grow w-0 h-px bg-[#243, 244, 246]'></div>
          </div>
          <ReactSortable
            className="space-y-1"
            list={tempSuggestedQuestions.map((name, index) => {
              return {
                id: index,
                name,
              }
            })}
            setList={list => setTempSuggestedQuestions(list.map(item => item.name))}
            handle='.handle'
            ghostClass="opacity-50"
            animation={150}
          >
            {tempSuggestedQuestions.map((question, index) => {
              return (
                <div className='group relative rounded-lg border border-gray-200 flex items-center pl-2.5 hover:border-gray-300 hover:bg-white' key={index}>
                  <div className='handle flex items-center justify-center w-4 h-4 cursor-grab'>
                    <svg width="6" height="10" viewBox="0 0 6 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" clipRule="evenodd" d="M1 2C1.55228 2 2 1.55228 2 1C2 0.447715 1.55228 0 1 0C0.447715 0 0 0.447715 0 1C0 1.55228 0.447715 2 1 2ZM1 6C1.55228 6 2 5.55228 2 5C2 4.44772 1.55228 4 1 4C0.447715 4 0 4.44772 0 5C0 5.55228 0.447715 6 1 6ZM6 1C6 1.55228 5.55228 2 5 2C4.44772 2 4 1.55228 4 1C4 0.447715 4.44772 0 5 0C5.55228 0 6 0.447715 6 1ZM5 6C5.55228 6 6 5.55228 6 5C6 4.44772 5.55228 4 5 4C4.44772 4 4 4.44772 4 5C4 5.55228 4.44772 6 5 6ZM2 9C2 9.55229 1.55228 10 1 10C0.447715 10 0 9.55229 0 9C0 8.44771 0.447715 8 1 8C1.55228 8 2 8.44771 2 9ZM5 10C5.55228 10 6 9.55229 6 9C6 8.44771 5.55228 8 5 8C4.44772 8 4 8.44771 4 9C4 9.55229 4.44772 10 5 10Z" fill="#98A2B3" />
                    </svg>
                  </div>
                  <input
                    type="input"
                    value={question || ''}
                    onChange={(e) => {
                      const value = e.target.value as string
                      setTempSuggestedQuestions(tempSuggestedQuestions.map((item, i) => {
                        if (index === i)
                          return value

                        return item
                      }))
                    }}
                    className={'w-full overflow-x-auto pl-1.5 pr-8 text-sm leading-9 text-gray-900 border-0 grow h-9 bg-transparent focus:outline-none cursor-pointer rounded-lg'}
                  />

                  <div
                    className='block absolute top-1/2 translate-y-[-50%] right-1.5 p-1 rounded-md cursor-pointer hover:bg-[#FEE4E2] hover:text-[#D92D20]'
                    onClick={() => {
                      setTempSuggestedQuestions(tempSuggestedQuestions.filter((_, i) => index !== i))
                    }}
                  >
                    <Trash03 className='w-3.5 h-3.5' />
                  </div>
                </div>
              )
            })}</ReactSortable>
          {tempSuggestedQuestions.length < MAX_QUESTION_NUM && (
            <div
              onClick={() => { setTempSuggestedQuestions([...tempSuggestedQuestions, '']) }}
              className='mt-1 flex items-center h-9 px-3 gap-2 rounded-lg cursor-pointer text-gray-400  bg-gray-100 hover:bg-gray-200'>
              <Plus className='w-4 h-4'></Plus>
              <div className='text-gray-500 text-[13px]'>{t('appDebug.variableConig.addOption')}</div>
            </div>
          )}
        </div>
      </div>
      <div className='flex items-center justify-end mt-6'>
        <Button
          onClick={onCancel}
          className='mr-2 text-sm font-medium'
        >
          {t('common.operation.cancel')}
        </Button>
        <Button
          type='primary'
          className='text-sm font-medium'
          disabled={!localeData?.ai_agent_name || !localeData.host || !localeData.url}
          onClick={handleSave}
        >
          {t('common.operation.save')}
        </Button>
      </div>
    </Modal>
  )
}

export default CustomEditModal
