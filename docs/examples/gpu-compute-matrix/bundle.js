!function(){"use strict";function t(t,n,s,l){return new(s=s||Promise)(function(i,e){function a(t){try{r(l.next(t))}catch(t){e(t)}}function o(t){try{r(l.throw(t))}catch(t){e(t)}}function r(t){var e;t.done?i(t.value):((e=t.value)instanceof s?e:new s(function(t){t(e)})).then(a,o)}r((l=l.apply(t,n||[])).next())})}var e,i,p=1e-6,a="undefined"!=typeof Float32Array?Float32Array:Array;function n(){var t=new a(16);return a!=Float32Array&&(t[1]=0,t[2]=0,t[3]=0,t[4]=0,t[6]=0,t[7]=0,t[8]=0,t[9]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0),t[0]=1,t[5]=1,t[10]=1,t[15]=1,t}Math.hypot||(Math.hypot=function(){for(var t=0,e=arguments.length;e--;)t+=arguments[e]*arguments[e];return Math.sqrt(t)}),e=new a(3),a!=Float32Array&&(e[0]=0,e[1]=0,e[2]=0),i=new a(2),a!=Float32Array&&(i[0]=0,i[1]=0);class g{constructor(t,e,i,a,o,r){this.left=-1,this.right=1,this.top=1,this.bottom=-1,this.near=.1,this.far=2e3,this.zoom=1,this.position=[0,0,0],this.lookAtPosition=[0,0,0],this.projectionMatrix=n(),this.viewMatrix=n(),this.left=t,this.right=e,this.top=i,this.bottom=a,this.near=o,this.far=r,this.updateProjectionMatrix()}setPosition({x:t=this.position[0],y:e=this.position[1],z:i=this.position[2]}){return this.position=[t,e,i],this}updateViewMatrix(){var t,e,i,a,o,r,n,s,l,u,f,d,c,h;return t=this.viewMatrix,e=this.position,i=this.lookAtPosition,a=g.UP_VECTOR,r=e[0],n=e[1],s=e[2],l=a[0],u=a[1],f=a[2],d=i[0],c=i[1],h=i[2],Math.abs(r-d)<p&&Math.abs(n-c)<p&&Math.abs(s-h)<p?((o=t)[0]=1,o[1]=0,o[2]=0,o[3]=0,o[4]=0,o[5]=1,o[6]=0,o[7]=0,o[8]=0,o[9]=0,o[10]=1,o[11]=0,o[12]=0,o[13]=0,o[14]=0,o[15]=1):(e=r-d,a=n-c,i=s-h,d=u*(i*=o=1/Math.hypot(e,a,i))-f*(a*=o),c=f*(e*=o)-l*i,h=l*a-u*e,(o=Math.hypot(d,c,h))?(d*=o=1/o,c*=o,h*=o):h=c=d=0,f=a*h-i*c,l=i*d-e*h,u=e*c-a*d,(o=Math.hypot(f,l,u))?(f*=o=1/o,l*=o,u*=o):u=l=f=0,t[0]=d,t[1]=f,t[2]=e,t[3]=0,t[4]=c,t[5]=l,t[6]=a,t[7]=0,t[8]=h,t[9]=u,t[10]=i,t[11]=0,t[12]=-(d*r+c*n+h*s),t[13]=-(f*r+l*n+u*s),t[14]=-(e*r+a*n+i*s),t[15]=1),this}updateProjectionMatrix(){var t,e,i,a,o,r,n,s,l,u;return t=this.projectionMatrix,e=this.left,i=this.right,a=this.bottom,o=this.top,r=this.near,n=this.far,s=1/(e-i),l=1/(a-o),u=1/(r-n),t[0]=-2*s,t[1]=0,t[2]=0,t[3]=0,t[4]=0,t[5]=-2*l,t[6]=0,t[7]=0,t[8]=0,t[9]=0,t[10]=2*u,t[11]=0,t[12]=(e+i)*s,t[13]=(o+a)*l,t[14]=(n+r)*u,t[15]=1,this}lookAt(t){return this.lookAtPosition=t,this.updateViewMatrix(),this}}g.UP_VECTOR=[0,1,0];const B=1e5;t(void 0,void 0,void 0,function*(){var t=yield null===(t=navigator.gpu)||void 0===t?void 0:t.requestAdapter();const e=`
    <div id="no-webgpu-wrapper">
      <div id="no-webgpu">
        WebGPU is not supported on this browser. Please try modern Google Chrome (Canary) or Firefox Nightly.
      </div>
    </div>
  `;window.addEventListener("unhandledrejection",t=>{document.body.innerHTML+=e}),window.addEventListener("error",t=>{document.body.innerHTML+=e}),t||(document.body.innerHTML+=e)}),t(void 0,void 0,void 0,function*(){let n=0;const t=document.getElementById("gpu-c");t.width=innerWidth*devicePixelRatio,t.height=innerHeight*devicePixelRatio,t.style.setProperty("width",`${innerWidth}px`),t.style.setProperty("height",`${innerHeight}px`);const e=yield null===(i=navigator.gpu)||void 0===i?void 0:i.requestAdapter(),s=yield null===e||void 0===e?void 0:e.requestDevice(),l=t.getContext("webgpu");var i=l.getPreferredFormat(e);const u=new g(0,innerWidth,0,innerHeight,-2,3).setPosition({z:2}).lookAt([0,0,0]).updateViewMatrix().updateProjectionMatrix();l.configure({device:s,format:i});const f=s.createBuffer({size:32*Float32Array.BYTES_PER_ELEMENT,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST});const d=s.createBuffer({size:8e5*Float32Array.BYTES_PER_ELEMENT,usage:GPUBufferUsage.VERTEX|GPUBufferUsage.STORAGE,mappedAtCreation:!0}),a=new Float32Array(d.getMappedRange());for(let t=0;t<B;t++)a[8*t+0]=Math.random()*innerWidth*2,a[8*t+1]=Math.random()*innerHeight*2,a[8*t+2]=400*(2*Math.random()-1),a[8*t+3]=400*(2*Math.random()-1),a[8*t+4]=3+Math.random(),a[8*t+5]=Math.random(),a[8*t+6]=Math.random(),a[8*t+7]=Math.random();d.unmap();const c=s.createBuffer({size:12*Float32Array.BYTES_PER_ELEMENT,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}),h=new Float32Array([t.width,t.height,0,.6,4*(2*Math.random()-1),4*(2*Math.random()-1),4*(2*Math.random()-1),4*(2*Math.random()-1),4*(2*Math.random()-1),4*(2*Math.random()-1),4*(2*Math.random()-1),4*(2*Math.random()-1)]);s.queue.writeBuffer(c,0,h);const p=s.createComputePipeline({compute:{module:s.createShaderModule({code:`
          struct BallData {
            position: vec2<f32>;
            velocity: vec2<f32>;
            radius: f32;
          };

          [[block]] struct BallsBuffer {
            balls: [[stride(32)]] array<BallData>;
          };
          
          [[group(0), binding(0)]] var<storage, read_write> ballsBuffer: BallsBuffer;

          [[block]] struct Uniforms {
            canvasSize: vec2<f32>;
            deltaTime: f32;
            bounceFactor: f32;
            gravityLeft: vec4<f32>;
            gravityRight: vec4<f32>;
          };

          [[group(0), binding(2)]] var<uniform> uniforms : Uniforms;

          [[stage(compute), workgroup_size(64, 1, 1)]]
          fn main([[builtin(global_invocation_id)]] GlobalInvocationID : vec3<u32>) {
            let index = GlobalInvocationID.x;

            let canvasWidth = uniforms.canvasSize.x * 2.0;
            let canvasHeight = uniforms.canvasSize.y * 2.0;
            
            let ballRadius = ballsBuffer.balls[index].radius;
            let vx = ballsBuffer.balls[index].velocity.x;
            let vy = ballsBuffer.balls[index].velocity.y;

            if (ballsBuffer.balls[index].position.x < canvasWidth * 0.5) {
              if (ballsBuffer.balls[index].position.y > canvasHeight * 0.5) {
                ballsBuffer.balls[index].velocity.x = vx + uniforms.gravityLeft.x;
                ballsBuffer.balls[index].velocity.y = vy + uniforms.gravityLeft.y;
              } else {
                ballsBuffer.balls[index].velocity.x = vx + uniforms.gravityLeft.z;
                ballsBuffer.balls[index].velocity.y = vy + uniforms.gravityLeft.w;
              }
            } else {
              if (ballsBuffer.balls[index].position.y > canvasHeight * 0.5) {
                ballsBuffer.balls[index].velocity.x = vx + uniforms.gravityRight.x;
                ballsBuffer.balls[index].velocity.y = vy + uniforms.gravityRight.y;
              } else {
                ballsBuffer.balls[index].velocity.x = vx + uniforms.gravityRight.z;
                ballsBuffer.balls[index].velocity.y = vy + uniforms.gravityRight.w;
              }
            }

            ballsBuffer.balls[index].position.x = ballsBuffer.balls[index].position.x + ballsBuffer.balls[index].velocity.x * uniforms.deltaTime;
            ballsBuffer.balls[index].position.y = ballsBuffer.balls[index].position.y + ballsBuffer.balls[index].velocity.y * uniforms.deltaTime;
            
            // Handle screen viewport
            if (ballsBuffer.balls[index].position.x + ballRadius * 0.5 > canvasWidth) {
              ballsBuffer.balls[index].position.x = canvasWidth - ballRadius * 0.5;
              ballsBuffer.balls[index].velocity.x = vx * -uniforms.bounceFactor;
            } elseif (ballsBuffer.balls[index].position.x - ballRadius * 0.5 < 0.0) {
              ballsBuffer.balls[index].position.x = ballRadius * 0.5;
              ballsBuffer.balls[index].velocity.x = vx * -uniforms.bounceFactor;
            }

            if (ballsBuffer.balls[index].position.y + ballRadius * 0.5 > canvasHeight) {
              ballsBuffer.balls[index].position.y = canvasHeight - ballRadius * 0.5;
              ballsBuffer.balls[index].velocity.y = vy * -uniforms.bounceFactor;
            } elseif (ballsBuffer.balls[index].position.y - ballRadius * 0.5 < 0.0) {
              ballsBuffer.balls[index].position.y = ballRadius * 0.5;
              ballsBuffer.balls[index].velocity.y = vy * -uniforms.bounceFactor;
            }
          }
        `}),entryPoint:"main"}}),v=s.createBindGroup({layout:p.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:d}},{binding:2,resource:{buffer:c}}]}),b=s.createBuffer({usage:GPUBufferUsage.VERTEX,size:8*Float32Array.BYTES_PER_ELEMENT,mappedAtCreation:!0});new Float32Array(b.getMappedRange()).set([-.5,-.5,.5,-.5,.5,.5,-.5,.5]),b.unmap();const y=s.createBuffer({size:6*Uint16Array.BYTES_PER_ELEMENT,usage:GPUBufferUsage.INDEX,mappedAtCreation:!0});new Uint16Array(y.getMappedRange()).set([0,1,3,3,1,2]),y.unmap();const m=s.createRenderPipeline({vertex:{buffers:[{arrayStride:2*Float32Array.BYTES_PER_ELEMENT,attributes:[{shaderLocation:0,format:"float32x2",offset:0}]},{arrayStride:8*Float32Array.BYTES_PER_ELEMENT,attributes:[{shaderLocation:1,format:"float32x2",offset:0},{shaderLocation:2,format:"float32",offset:4*Float32Array.BYTES_PER_ELEMENT},{shaderLocation:3,format:"float32x3",offset:5*Float32Array.BYTES_PER_ELEMENT}],stepMode:"instance"}],module:s.createShaderModule({code:`
          [[block]] struct Transform {
            projectionMatrix: mat4x4<f32>;
            viewMatrix: mat4x4<f32>;
          };

          [[group(0), binding(0)]] var<uniform> transform: Transform;

          struct Input {
            [[location(0)]] position: vec4<f32>;
            [[location(1)]] instancePosition: vec4<f32>;
            [[location(2)]] scaleFactor: f32;
            [[location(3)]] color: vec3<f32>;
          };

          struct Output {
            [[builtin(position)]] Position : vec4<f32>;
            [[location(0)]] color : vec4<f32>;
          };

          [[stage(vertex)]]
          fn main (input: Input) -> Output {
            var output: Output;

            let scaleMatrix = mat4x4<f32>(
              vec4<f32>(input.scaleFactor,  0.0,                0.0,               0.0),
              vec4<f32>(0.0,                input.scaleFactor,  0.0,               0.0),
              vec4<f32>(0.0,                0.0,                input.scaleFactor, 0.0),
              vec4<f32>(0.0,                0.0,                0.0,               1.0)
            );
            
            let transformedPos = scaleMatrix * input.position + input.instancePosition;
            // let transformedPos = input.position + input.instancePosition;

            output.Position = transform.projectionMatrix * 
                              transform.viewMatrix *
                              transformedPos;
            
            output.color = vec4<f32>(input.color, 1.0);

            return output;
          }
        `}),entryPoint:"main"},fragment:{module:s.createShaderModule({code:`
          struct Input {
            [[location(0)]] color: vec4<f32>;
          };

          [[stage(fragment)]]

          fn main (input: Input) -> [[location(0)]] vec4<f32> {
            return input.color;
          }
        `}),entryPoint:"main",targets:[{format:i}]}}),x=s.createBindGroup({layout:m.getBindGroupLayout(0),entries:[{binding:0,resource:{size:32*Float32Array.BYTES_PER_ELEMENT,buffer:f,offset:0}}]});setInterval(()=>{for(let t=4;t<12;t++)h[t]=4*(2*Math.random()-1)},1500),requestAnimationFrame(function t(e){e/=1e3;const i=e-n;n=e;requestAnimationFrame(t);const a=s.createCommandEncoder();const o=a.beginComputePass();o.setPipeline(p);o.setBindGroup(0,v);o.dispatch(Math.ceil(B/64));o.endPass();const r=a.beginRenderPass({colorAttachments:[{view:l.getCurrentTexture().createView(),loadValue:[.1,.1,.1,1],storeOp:"store"}]});s.queue.writeBuffer(f,0,u.projectionMatrix);s.queue.writeBuffer(f,16*Float32Array.BYTES_PER_ELEMENT,u.viewMatrix);h[2]=i;s.queue.writeBuffer(c,0,h);r.setPipeline(m);r.setBindGroup(0,x);r.setVertexBuffer(0,b);r.setVertexBuffer(1,d);r.setIndexBuffer(y,"uint16");r.drawIndexed(6,B);r.endPass();s.queue.submit([a.finish()])})})}();
