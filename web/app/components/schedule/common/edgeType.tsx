import React from 'react'
import type { EdgeProps } from 'reactflow'
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  useNodes,
  useReactFlow,
} from 'reactflow'

import styles from './index.module.css'

export default function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  source,
  selected,
  target,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
}: EdgeProps) {
  const { setEdges } = useReactFlow()
  const nodes = useNodes()
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })

  const active = (() => {
    const connectNode = nodes.find((node) => {
      return (node.id === source || node.id === target) && node.selected
    })
    return !!(connectNode || selected)
  })()

  const onEdgeClick = () => {
    setEdges(edges => edges.filter(edge => edge.id !== id))
  }

  const edgeStyle: React.CSSProperties = {
    ...style,
    ...(active
      ? {
        strokeWidth: 2,
        stroke: '#3370ff',
      }
      : { strokeWidth: 2, stroke: '#000' }),
  }

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={edgeStyle} />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            fontSize: 12,
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
        >
          <button className={active ? styles.edgebuttonActive : styles.edgebutton} onClick={onEdgeClick}>
            ×
          </button>
        </div>
      </EdgeLabelRenderer>
    </>
  )
}
