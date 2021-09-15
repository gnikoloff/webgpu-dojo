import { mat4 } from 'gl-matrix'
import { Transform } from '../lib/hwoa-rang-gl'

export class Node {
  parentNode: Node | null = null
  children = []
  transform = new Transform()
  worldMatrix = mat4.create()

  setParent = (parentNode) => {
    if (this.parentNode) {
      const idx = this.parentNode.children.indexOf(this)
      if (idx >= 0) {
        this.parentNode.children.splice(idx, 1)
      }
    }
    if (parentNode) {
      parentNode.children.push(this)
    }
    this.parentNode = parentNode
  }

  updateWorldMatrix = (parentWorldMatrix = null) => {
    if (parentWorldMatrix) {
      mat4.mul(this.worldMatrix, parentWorldMatrix, this.transform.modelMatrix)
    } else {
      mat4.copy(this.worldMatrix, this.transform.modelMatrix)
    }
    this.children.forEach((child) => {
      child.updateWorldMatrix(this.worldMatrix)
    })
  }
}
