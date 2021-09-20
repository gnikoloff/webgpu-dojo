const pipelinesMap = new Map()

export const gpuPipelineFactory = (
  device: GPUDevice,
  pipelineDefinition: GPURenderPipelineDescriptor,
): GPURenderPipeline => {
  const pipelineDefString = JSON.stringify(pipelineDefinition)
  let pipeline = pipelinesMap.get(pipelineDefString)
  if (!pipeline) {
    pipeline = device.createRenderPipeline(pipelineDefinition)
    console.log('pipeline', pipelineDefString)
    pipelinesMap.set(pipelineDefString, pipeline)
  }
  return pipeline
}
