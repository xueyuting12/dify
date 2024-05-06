import { useEffect, useRef } from 'react'

const useCalculatePosition = (id: string) => {
  const containerRef = useRef<HTMLDivElement>(null)
  /** 平均分配点的定位 */
  useEffect(() => {
    const calculatePositions = () => {
      const divElement = containerRef.current
      if (divElement) {
        const divHeight = divElement.clientHeight || 0
        const points = divElement.querySelectorAll(`.${id}`) as NodeListOf<HTMLElement>
        if (points) {
          const pointSpacing = divHeight / (points.length + 1)
          points.forEach((point, index) => {
            const topPosition = (index + 1) * pointSpacing
            point.style.top = `${topPosition}px`
          })
        }
      }
    }

    calculatePositions()

    window.addEventListener('resize', calculatePositions)
    return () => {
      window.removeEventListener('resize', calculatePositions)
    }
  }, [id])
  return containerRef
}

export default useCalculatePosition
