'use client'
import React, { useMemo, useState } from 'react'
import cn from 'classnames'
// import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { useContext } from 'use-context-selector'
import useSWR from 'swr'
import Toast from '../../base/toast'
import s from './style.module.css'
import ExploreContext from '@/context/explore-context'
import type { App } from '@/models/explore'
import Category from '@/app/components/explore/category'
import AppCard from '@/app/components/explore/app-card'
// import { fetchAppDetail, fetchAppList } from '@/service/explore'
// import { importApp } from '@/service/apps'
import { useTabSearchParams } from '@/hooks/use-tab-searchparams'
import CreateAppModal from '@/app/components/explore/create-app-modal'
import AppTypeSelector from '@/app/components/app/type-selector'
import type { CreateAppModalProps } from '@/app/components/explore/create-app-modal'
// import Loading from '@/app/components/base/loading'
import { NEED_REFRESH_APP_LIST_KEY } from '@/config'
// import { useAppContext } from '@/context/app-context'
// import { getRedirection } from '@/utils/app-redirection'
import { createApp, fetchAgentTypes } from '@/service/apps'
import { fetchInstalledAppList as doFetchInstalledAppList } from '@/service/explore'

type AppsProps = {
  pageType?: PageType
  onSuccess?: () => void
}

export enum PageType {
  EXPLORE = 'explore',
  CREATE = 'create',
}

const Apps = ({
  pageType = PageType.EXPLORE,
  onSuccess,
}: AppsProps) => {
  const { t } = useTranslation()
  // const { isCurrentWorkspaceManager } = useAppContext()
  // const { push } = useRouter()
  const { hasEditPermission, setInstalledApps } = useContext(ExploreContext)
  const allCategoriesEn = t('explore.apps.allCategories', { lng: 'en' })

  const [currentType, setCurrentType] = useState<string>('')
  const [currCategory, setCurrCategory] = useTabSearchParams({
    defaultTab: allCategoriesEn,
    disableSearchParams: pageType !== PageType.EXPLORE,
  })

  // const {
  //   data: { categories, allList },
  // } = useSWR(
  //   ['/explore/apps'],
  //   () =>
  //     fetchAppList().then(({ categories, recommended_apps }) => {
  //       return ({
  //         categories,
  //         allList: recommended_apps.sort((a, b) => a.position - b.position),
  //     })}),
  //   {
  //     fallbackData: {
  //       categories: [],
  //       allList: [],
  //     },
  //   },
  // )

  // 改为agent下拉选项
  const agentList = useSWR(
    ['apps/api-agent'],
    () => fetchAgentTypes().then((res) => {
      res.data.map((item: any) => {
        let icon = ''
        let icon_background = '#FFEAD5'
        if (item.ai_agent_name.includes('共享仓')) {
          icon = 'derelict_house_building'
          icon_background = '#D5D9EB'
        } else if (item.ai_agent_name.includes('商家')) {
          icon = 'shopping_trolley'
          icon_background = '#FEF7C3'
        } else if (item.ai_agent_name.includes('运费') || item.ai_agent_name.includes('物流费')) {
          icon = '🏃‍♂️'
          icon_background = '#E6F4D7'
        } else if (item.ai_agent_name.includes('售后')) {
          icon = 'notebook_with_decorative_cover'
          icon_background = '#E6F4D7'
        }
        item.app = {
          icon: icon,
          id: item.id,
          name: item.ai_agent_name,
          icon_background: icon_background,
          description: item.desc,
          mode: 'custom-agent',
        }
        return item
      })
      return res.data
    }),
    {
      fallbackData: [], // 或者你想要的回退数据
    },
  )

  const filteredList = useMemo(() => {
    // console.log(agentList.data)
    return agentList.data
  }, [agentList])

  // const filteredList = useMemo(() => {
  //   if (currCategory === allCategoriesEn) {
  //     if (!currentType)
  //       return allList
  //     else if (currentType === 'chatbot')
  //       return allList.filter(item => (item.app.mode === 'chat' || item.app.mode === 'advanced-chat'))
  //     else if (currentType === 'agent')
  //       return allList.filter(item => (item.app.mode === 'agent-chat'))
  //     else
  //       return allList.filter(item => (item.app.mode === 'workflow'))
  //   }
  //   else {
  //     if (!currentType)
  //       return allList.filter(item => item.category === currCategory)
  //     else if (currentType === 'chatbot')
  //       return allList.filter(item => (item.app.mode === 'chat' || item.app.mode === 'advanced-chat') && item.category === currCategory)
  //     else if (currentType === 'agent')
  //       return allList.filter(item => (item.app.mode === 'agent-chat') && item.category === currCategory)
  //     else
  //       return allList.filter(item => (item.app.mode === 'workflow') && item.category === currCategory)
  //   }
  // }, [currentType, currCategory, allCategoriesEn, allList])

  const [currApp, setCurrApp] = React.useState<App | null>(null)

  const [isShowCreateModal, setIsShowCreateModal] = React.useState(false)
  // const onCreate: CreateAppModalProps['onConfirm'] = async ({
  //   name,
  //   icon,
  //   icon_background,
  //   description,
  // }) => {
  //   const { export_data } = await fetchAppDetail(
  //     currApp?.app.id as string,
  //   )
  //   try {
  //     const app = await importApp({
  //       data: export_data,
  //       name,
  //       icon,
  //       icon_background,
  //       description,
  //     })
  //     setIsShowCreateModal(false)
  //     Toast.notify({
  //       type: 'success',
  //       message: t('app.newApp.appCreated'),
  //     })
  //     if (onSuccess)
  //       onSuccess()
  //     localStorage.setItem(NEED_REFRESH_APP_LIST_KEY, '1')
  //     getRedirection(isCurrentWorkspaceManager, app, push)
  //   }
  //   catch (e) {
  //     Toast.notify({ type: 'error', message: t('app.newApp.appCreateFailed') })
  //   }
  // }

  const onCreate: CreateAppModalProps['onConfirm'] = async (a) => {
    try {
      await createApp({
        name: a.name,
        description: a.description,
        icon: a.icon,
        icon_background: a.icon_background,
        mode: 'custom-agent',
        api_agent_id: currApp?.app.id,
      })
      setIsShowCreateModal(false)
      Toast.notify({
        type: 'success',
        message: t('app.newApp.appCreated'),
      })
      if (onSuccess)
        onSuccess()
      localStorage.setItem(NEED_REFRESH_APP_LIST_KEY, '1')
      // getRedirection(isCurrentWorkspaceManager, app, push)
      const { installed_apps }: any = await doFetchInstalledAppList()
      setInstalledApps(installed_apps)
    }
    catch (e) {
      Toast.notify({ type: 'error', message: t('app.newApp.appCreateFailed') })
    }
  }

  // if (!categories) {
  //   return (
  //     <div className="flex h-full items-center">
  //       <Loading type="area" />
  //     </div>
  //   )
  // }

  return (
    <div className={cn(
      'flex flex-col',
      pageType === PageType.EXPLORE ? 'h-full border-l border-gray-200' : 'h-[calc(100%-56px)]',
    )}>
      {pageType === PageType.EXPLORE && (
        <div className='shrink-0 pt-6 px-12'>
          <div className={`mb-1 ${s.textGradient} text-xl font-semibold`}>{t('explore.apps.title')}</div>
          <div className='text-gray-500 text-sm'>{t('explore.apps.description')}</div>
        </div>
      )}
      <div className={cn(
        'flex items-center mt-6',
        pageType === PageType.EXPLORE ? 'px-12' : 'px-8',
      )}>
        {pageType !== PageType.EXPLORE && (
          <>
            <AppTypeSelector value={currentType} onChange={setCurrentType} />
            <div className='mx-2 w-[1px] h-3.5 bg-gray-200'/>
          </>
        )}
        {/* <Category
          list={categories}
          value={currCategory}
          onChange={setCurrCategory}
          allCategoriesEn={allCategoriesEn}
        /> */}
        <Category
          list={[]}
          value={currCategory}
          onChange={setCurrCategory}
          allCategoriesEn={allCategoriesEn}
        />
      </div>
      <div className={cn(
        'relative flex flex-1 pb-6 flex-col overflow-auto bg-gray-100 shrink-0 grow',
        pageType === PageType.EXPLORE ? 'mt-6' : 'mt-0 pt-2',
      )}>
        <nav
          className={cn(
            s.appList,
            'grid content-start shrink-0',
            pageType === PageType.EXPLORE ? 'gap-4 px-6 sm:px-12' : 'gap-3 px-8  sm:!grid-cols-2 md:!grid-cols-3 lg:!grid-cols-4',
          )}>

          {filteredList.map((app: any) => {
            return (
              <AppCard
                key={app.id}
                isExplore={pageType === PageType.EXPLORE}
                app={app}
                canCreate={hasEditPermission}
                onCreate={() => {
                  setCurrApp(app)
                  setIsShowCreateModal(true)
                }}
              />
            )
          },
          )}
        </nav>
      </div>
      {isShowCreateModal && (
        <CreateAppModal
          appIcon={currApp?.app.icon || ''}
          appIconBackground={currApp?.app.icon_background || ''}
          appName={currApp?.app.name || ''}
          appDescription={currApp?.app.description || ''}
          show={isShowCreateModal}
          onConfirm={onCreate}
          onHide={() => setIsShowCreateModal(false)}
        />
      )}
    </div>
  )
}

export default React.memo(Apps)
