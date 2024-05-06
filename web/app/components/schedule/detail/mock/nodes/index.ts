import type { Node, NodeTypes } from 'reactflow'
import { PositionLoggerNode } from './PositionLoggerNode'

export const initialNodes = [
  { id: 'a', type: 'input', position: { x: 800, y: 200 }, data: { label: 'wire' } },
  {
    id: 'b',
    type: 'position-logger',
    position: { x: 700, y: 300 },
    data: { label: 'drag me!' },
  },
  { id: 'c', position: { x: 900, y: 300 }, data: { label: 'your ideas' } },
  {
    id: 'd',
    type: 'output',
    position: { x: 800, y: 400 },
    data: { label: 'with React Flow' },
  },
] satisfies Node[]

export const nodeTypes = {
  'position-logger': PositionLoggerNode,
  // Add any of your custom nodes here!
} satisfies NodeTypes
