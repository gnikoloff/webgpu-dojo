[[block]]
struct Lighting {
  position: vec3<f32>;
};

[[group(1), binding(0)]]
var <uniform> lighting: Lighting;

[[block]]
struct Material {
  baseColor: vec3<f32>;
};

[[group(2), binding(0)]]
var <uniform> material: Material;

struct Input {
  [[location(0)]] normal: vec4<f32>;
  [[location(1)]] pos: vec4<f32>;
};

[[stage(fragment)]]

fn main (input: Input) -> [[location(0)]] vec4<f32> {
  let normal: vec3<f32> = normalize(input.normal.rgb);
  let lightColor: vec3<f32> = vec3<f32>(1.0);

  // ambient light
  let ambientFactor: f32 = 0.1;
  let ambientLight: vec3<f32> = lightColor * ambientFactor;

  // diffuse light
  let lightDirection: vec3<f32> = normalize(lighting.position - input.pos.rgb);
  let diffuseStrength: f32 = max(dot(normal, lightDirection), 0.0);
  let diffuseLight: vec3<f32> = lightColor * diffuseStrength;

  // combine lighting
  let finalLight: vec3<f32> = diffuseLight + ambientLight;

  return vec4<f32>(material.baseColor * finalLight, 1.0);
}
