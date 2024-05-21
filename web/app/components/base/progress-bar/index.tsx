type ProgressBarProps = {
  percent: number
  showNumber?: boolean
}
const ProgressBar = ({
  percent = 0,
  showNumber = true
}: ProgressBarProps) => {
  return (
    <div className='flex items-center'>
      <div className='mr-2 w-[100px] bg-gray-100 rounded-lg'>
        <div
          className='h-1 bg-[#805AD5] rounded-lg'
          style={{ width: `${percent}%` }}
        />
      </div>
      {
        showNumber && <div className='text-xs font-medium text-gray-500'>{percent}%</div>
      }
    </div>
  )
}

export default ProgressBar
