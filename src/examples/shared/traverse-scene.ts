import { Node } from '../../shared/node'

export const traverseGltfScene = (node, callback) => {
  callback(node)
  const children = node.nodes || node.children || []
  children.forEach((childNode) => {
    traverseGltfScene(childNode, callback)
  })
}
