import { useTranslation } from 'react-i18next'
import Toast from '../../base/toast'

export const useCopyData = () => {
  const { t } = useTranslation()

  return {
    copyData: async (
      data: string,
      title: string | null = t('schedule.exportSuccess'),
      duration = 1000,
    ) => {
      try {
        if (navigator.clipboard)
          await navigator.clipboard.writeText(data)
        // eslint-disable-next-line unicorn/error-message
        else throw new Error('')
      }
      catch (error) {
        console.log(error)
        const textarea = document.createElement('textarea')
        textarea.value = data
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        document.body?.removeChild(textarea)
      }
      Toast.notify({
        message: title || '',
        type: 'success',
        duration,
      })
    },
  }
}
