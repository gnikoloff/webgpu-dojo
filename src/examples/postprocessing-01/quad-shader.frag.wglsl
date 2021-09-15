struct Input {
  [[location(0)]] uv: vec2<f32>;
};

[[group(2), binding(0)]] var mySampler: sampler;
[[group(2), binding(1)]] var postFX0Texture: texture_2d<f32>;
[[group(2), binding(2)]] var postFX1Texture: texture_2d<f32>;
[[group(2), binding(3)]] var cutOffTexture: texture_2d<f32>;

[[block]]
struct Tween {
  factor: f32;
};

[[group(3), binding(0)]]
var <uniform> tween: Tween;

[[stage(fragment)]]

fn main (input: Input) -> [[location(0)]] vec4<f32> {
  let result0: vec4<f32> = textureSample(postFX0Texture, mySampler, input.uv);
  let result1: vec4<f32> = textureSample(postFX1Texture, mySampler, input.uv);

  let cutoffResult: vec4<f32> = textureSample(cutOffTexture, mySampler, input.uv);

  let mixFactor: f32 = step(tween.factor * 1.05, cutoffResult.r);

  return mix(result0, result1, mixFactor);
}
