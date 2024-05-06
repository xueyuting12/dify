import React from 'react'

import classNames from 'classnames'
import styles from '../index.module.css'
import { getType } from '../../util'
import type { IHeaderType } from '@/models/schedule'

type IProps = {
  label: string
  version: string
  type: keyof typeof IHeaderType
}
const CommonHeader = ({ label, version, type }: IProps) => {
  return <div className='flex items-center justify-between'>
    <div className='flex items-center'>
      <div className={classNames(styles.commonImg, styles[getType(type)])}></div>
      <span>{label}</span>
    </div>
    <div className={styles.version}>
      {version}
    </div>
  </div>
}
export default CommonHeader
