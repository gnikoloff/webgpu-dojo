!function(){"use strict";function t(t,s,o,h){return new(o=o||Promise)(function(i,e){function r(t){try{a(h.next(t))}catch(t){e(t)}}function n(t){try{a(h.throw(t))}catch(t){e(t)}}function a(t){var e;t.done?i(t.value):((e=t.value)instanceof o?e:new o(function(t){t(e)})).then(r,n)}a((h=h.apply(t,s||[])).next())})}const l="front",p="back",m="bottom",v="left",y="right";var _=1e-6,n="undefined"!=typeof Float32Array?Float32Array:Array;function a(){var t=new n(16);return n!=Float32Array&&(t[1]=0,t[2]=0,t[3]=0,t[4]=0,t[6]=0,t[7]=0,t[8]=0,t[9]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0),t[0]=1,t[5]=1,t[10]=1,t[15]=1,t}function w(t){return t[0]=1,t[1]=0,t[2]=0,t[3]=0,t[4]=0,t[5]=1,t[6]=0,t[7]=0,t[8]=0,t[9]=0,t[10]=1,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,t}function L(){var t=new n(3);return n!=Float32Array&&(t[0]=0,t[1]=0,t[2]=0),t}function E(t,e,i){var r=new n(3);return r[0]=t,r[1]=e,r[2]=i,r}function R(t,e,i,r){return t[0]=e,t[1]=i,t[2]=r,t}function M(t,e,i){return t[0]=e[0]+i[0],t[1]=e[1]+i[1],t[2]=e[2]+i[2],t}function F(t,e,i){return t[0]=e[0]*i,t[1]=e[1]*i,t[2]=e[2]*i,t}function B(t,e){var i=e[0],r=e[1],n=e[2],n=i*i+r*r+n*n;return 0<n&&(n=1/Math.sqrt(n)),t[0]=e[0]*n,t[1]=e[1]*n,t[2]=e[2]*n,t}function s(t,e,i){var r=e[0],n=e[1],a=e[2],s=i[0],e=i[1],i=i[2];return t[0]=n*i-a*e,t[1]=a*s-r*i,t[2]=r*e-n*s,t}Math.hypot||(Math.hypot=function(){for(var t=0,e=arguments.length;e--;)t+=arguments[e]*arguments[e];return Math.sqrt(t)});var U=function(t,e,i){return t[0]=e[0]-i[0],t[1]=e[1]-i[1],t[2]=e[2]-i[2],t};function f(){var t=new n(2);return n!=Float32Array&&(t[0]=0,t[1]=0),t}L(),f();class A{constructor(){this.position=E(0,0,0),this.rotation=E(0,0,0),this.scale=E(1,1,1),this.modelMatrix=a(),this.shouldUpdate=!0}copyFromMatrix(t){var e;return e=this.modelMatrix,t=t,e[0]=t[0],e[1]=t[1],e[2]=t[2],e[3]=t[3],e[4]=t[4],e[5]=t[5],e[6]=t[6],e[7]=t[7],e[8]=t[8],e[9]=t[9],e[10]=t[10],e[11]=t[11],e[12]=t[12],e[13]=t[13],e[14]=t[14],e[15]=t[15],this.shouldUpdate=!1,this}setPosition(t){var{x:e=this.position[0],y:i=this.position[1],z:t=this.position[2]}=t;return R(this.position,e,i,t),this.shouldUpdate=!0,this}setScale(t){var{x:e=this.scale[0],y:i=this.scale[1],z:t=this.scale[2]}=t;return R(this.scale,e,i,t),this.shouldUpdate=!0,this}setRotation(t){var{x:e=this.rotation[0],y:i=this.rotation[1],z:t=this.rotation[2]}=t;return R(this.rotation,e,i,t),this.shouldUpdate=!0,this}updateModelMatrix(){var t,e,i,r,n,a,s,o,h,u,d,c,l,p,m,v,y;return w(this.modelMatrix),p=this.modelMatrix,a=this.modelMatrix,l=this.position,c=l[0],m=l[1],u=l[2],a===p?(p[12]=a[0]*c+a[4]*m+a[8]*u+a[12],p[13]=a[1]*c+a[5]*m+a[9]*u+a[13],p[14]=a[2]*c+a[6]*m+a[10]*u+a[14],p[15]=a[3]*c+a[7]*m+a[11]*u+a[15]):(t=a[0],e=a[1],h=a[2],d=a[3],i=a[4],r=a[5],v=a[6],y=a[7],n=a[8],s=a[9],o=a[10],l=a[11],p[0]=t,p[1]=e,p[2]=h,p[3]=d,p[4]=i,p[5]=r,p[6]=v,p[7]=y,p[8]=n,p[9]=s,p[10]=o,p[11]=l,p[12]=t*c+i*m+n*u+a[12],p[13]=e*c+r*m+s*u+a[13],p[14]=h*c+v*m+o*u+a[14],p[15]=d*c+y*m+l*u+a[15]),s=this.modelMatrix,h=this.modelMatrix,v=this.rotation[0],o=Math.sin(v),p=Math.cos(v),d=h[4],c=h[5],y=h[6],m=h[7],l=h[8],u=h[9],a=h[10],v=h[11],h!==s&&(s[0]=h[0],s[1]=h[1],s[2]=h[2],s[3]=h[3],s[12]=h[12],s[13]=h[13],s[14]=h[14],s[15]=h[15]),s[4]=d*p+l*o,s[5]=c*p+u*o,s[6]=y*p+a*o,s[7]=m*p+v*o,s[8]=l*p-d*o,s[9]=u*p-c*o,s[10]=a*p-y*o,s[11]=v*p-m*o,h=this.modelMatrix,l=this.modelMatrix,d=this.rotation[1],u=Math.sin(d),c=Math.cos(d),a=l[0],y=l[1],s=l[2],v=l[3],p=l[8],m=l[9],o=l[10],d=l[11],l!==h&&(h[4]=l[4],h[5]=l[5],h[6]=l[6],h[7]=l[7],h[12]=l[12],h[13]=l[13],h[14]=l[14],h[15]=l[15]),h[0]=a*c-p*u,h[1]=y*c-m*u,h[2]=s*c-o*u,h[3]=v*c-d*u,h[8]=a*u+p*c,h[9]=y*u+m*c,h[10]=s*u+o*c,h[11]=v*u+d*c,l=this.modelMatrix,a=this.modelMatrix,p=this.rotation[2],y=Math.sin(p),m=Math.cos(p),s=a[0],o=a[1],h=a[2],v=a[3],u=a[4],d=a[5],c=a[6],p=a[7],a!==l&&(l[8]=a[8],l[9]=a[9],l[10]=a[10],l[11]=a[11],l[12]=a[12],l[13]=a[13],l[14]=a[14],l[15]=a[15]),l[0]=s*m+u*y,l[1]=o*m+d*y,l[2]=h*m+c*y,l[3]=v*m+p*y,l[4]=u*m-s*y,l[5]=d*m-o*y,l[6]=c*m-h*y,l[7]=p*m-v*y,l=this.modelMatrix,p=this.modelMatrix,m=this.scale,v=m[0],y=m[1],m=m[2],l[0]=p[0]*v,l[1]=p[1]*v,l[2]=p[2]*v,l[3]=p[3]*v,l[4]=p[4]*y,l[5]=p[5]*y,l[6]=p[6]*y,l[7]=p[7]*y,l[8]=p[8]*m,l[9]=p[9]*m,l[10]=p[10]*m,l[11]=p[11]*m,l[12]=p[12],l[13]=p[13],l[14]=p[14],l[15]=p[15],this.shouldUpdate=!1,this}}const o=(t,e,i)=>Math.min(Math.max(t,e),i),S=(t,e,i)=>(i-t)/(e-t),D=t=>(t-=2*Math.floor(.5*t),t=Math.min(Math.max(t,0),2),1-Math.abs(t-1));class h{constructor(){this.value=0,this.damping=.5}addForce(t){this.value+=t}update(){return 1e-6<this.value*this.value?this.value*=this.damping:this.stop(),this.value}stop(){this.value=0}}class P{constructor(t,e=document.body,i=!1,r=1){this.target=L(),this.minDistance=0,this.maxDistance=1/0,this.isEnabled=!0,this.targetXDampedAction=new h,this.targetYDampedAction=new h,this.targetZDampedAction=new h,this.targetThetaDampedAction=new h,this.targetPhiDampedAction=new h,this.targetRadiusDampedAction=new h,this._isShiftDown=!1,this._rotateStart={x:9999,y:9999},this._rotateEnd={x:9999,y:9999},this._roatteDelta={x:9999,y:9999},this._zoomDistanceEnd=0,this._zoomDistance=0,this.state="",this.loopId=0,this._panStart={x:0,y:0},this._panDelta={x:0,y:0},this._panEnd={x:0,y:0},this._paused=!1,this._isDebug=!1,this.mouseWheelForce=1,this.mouseWheelForce=r,this.camera=t,this.domElement=e,this.isDamping=!1,this.dampingFactor=.25,this.isZoom=!0,this.zoomSpeed=1,this.isRotate=!0,this.rotateSpeed=1,this.isPan=!0,this.keyPanSpeed=7,this.enableKeys=!0,this.keys={LEFT:"37",UP:"38",RIGHT:"39",BOTTOM:"40",SHIFT:"16"},this.originTarget=L(),this.originPosition=L(),this.originPosition[0]=t.position[0],this.originPosition[1]=t.position[0],this.originPosition[2]=t.position[0];r=this.camera.position[0],e=this.camera.position[1],t=this.camera.position[2],r=Math.sqrt(r*r+e*e+t*t),e=Math.atan2(this.camera.position[0],this.camera.position[2]),t=Math.acos(o(this.camera.position[1]/r,-1,1));this._spherical={radius:r,theta:e,phi:t},this._bindEvens(),this.setEventHandler(),this.startTick(),(this._isDebug=i)&&(this._outputEl=document.createElement("div"),this._outputEl.setAttribute("style",`
      position: fixed;
      bottom: 24px;
      left: 24px;
      z-index: 999;
      font-family: monospace;
      font-size: 14px;
      user-select: none;
      background: rgba(255, 255, 255, 0.7);
      border-radius: 4px;
      padding: 3px 6px;
    `),document.body.appendChild(this._outputEl))}lookAt([t,e,i]){return R(this.target,t,e,i),this}setEventHandler(){this.domElement.addEventListener("contextmenu",this._contextMenuHandler,!1),this.domElement.addEventListener("mousedown",this._mouseDownHandler,!1),this.domElement.addEventListener("wheel",this._mouseWheelHandler,!1),this.domElement.addEventListener("touchstart",this._touchStartHandler,!1),this.domElement.addEventListener("touchmove",this._touchMoveHandler,!1),window.addEventListener("keydown",this._onKeyDownHandler,!1),window.addEventListener("keyup",this._onKeyUpHandler,!1)}removeEventHandler(){this.domElement.removeEventListener("contextmenu",this._contextMenuHandler,!1),this.domElement.removeEventListener("mousedown",this._mouseDownHandler,!1),this.domElement.removeEventListener("wheel",this._mouseWheelHandler,!1),this.domElement.removeEventListener("mousemove",this._mouseMoveHandler,!1),window.removeEventListener("mouseup",this._mouseUpHandler,!1),this.domElement.removeEventListener("touchstart",this._touchStartHandler,!1),this.domElement.removeEventListener("touchmove",this._touchMoveHandler,!1),window.removeEventListener("keydown",this._onKeyDownHandler,!1),window.removeEventListener("keydown",this._onKeyUpHandler,!1)}startTick(){this.loopId=requestAnimationFrame(this.tick)}pause(){this._paused=!0}start(){this._paused=!1}tick(){var t,e,i;this._paused||(this.updateDampedAction(),this.updateCamera(),this._isDebug&&(t=Math.round(100*this.camera.position[0])/100,e=Math.round(100*this.camera.position[1])/100,i=Math.round(100*this.camera.position[2])/100,this._outputEl.textContent=`x: ${t} y: ${e} z: ${i}`)),this.loopId=requestAnimationFrame(this.tick)}updateDampedAction(){this.target[0]+=this.targetXDampedAction.update(),this.target[1]+=this.targetYDampedAction.update(),this.target[2]+=this.targetZDampedAction.update(),this._spherical.theta+=this.targetThetaDampedAction.update(),this._spherical.phi+=this.targetPhiDampedAction.update(),this._spherical.radius+=this.targetRadiusDampedAction.update()}updateCamera(){var t=this._spherical,e=Math.sin(t.phi)*t.radius;this.camera.position[0]=e*Math.sin(t.theta)+this.target[0],this.camera.position[1]=Math.cos(t.phi)*t.radius+this.target[1],this.camera.position[2]=e*Math.cos(t.theta)+this.target[2],this.camera.lookAtPosition[0]=this.target[0],this.camera.lookAtPosition[1]=this.target[1],this.camera.lookAtPosition[2]=this.target[2],this.camera.updateViewMatrix()}_bindEvens(){this.tick=this.tick.bind(this),this._contextMenuHandler=this._contextMenuHandler.bind(this),this._mouseDownHandler=this._mouseDownHandler.bind(this),this._mouseWheelHandler=this._mouseWheelHandler.bind(this),this._mouseMoveHandler=this._mouseMoveHandler.bind(this),this._mouseUpHandler=this._mouseUpHandler.bind(this),this._touchStartHandler=this._touchStartHandler.bind(this),this._touchMoveHandler=this._touchMoveHandler.bind(this),this._onKeyDownHandler=this._onKeyDownHandler.bind(this),this._onKeyUpHandler=this._onKeyUpHandler.bind(this)}_contextMenuHandler(t){this.isEnabled&&t.preventDefault()}_mouseDownHandler(t){this.isEnabled&&(0===t.button?(this.state="rotate",this._rotateStart={x:t.clientX,y:t.clientY}):(this.state="pan",this._panStart={x:t.clientX,y:t.clientY}),this.domElement.addEventListener("mousemove",this._mouseMoveHandler,!1),window.addEventListener("mouseup",this._mouseUpHandler,!1))}_mouseUpHandler(){this.domElement.removeEventListener("mousemove",this._mouseMoveHandler,!1),window.removeEventListener("mouseup",this._mouseUpHandler,!1)}_mouseMoveHandler(t){this.isEnabled&&("rotate"===this.state?(this._rotateEnd={x:t.clientX,y:t.clientY},this._roatteDelta={x:this._rotateEnd.x-this._rotateStart.x,y:this._rotateEnd.y-this._rotateStart.y},this._updateRotateHandler(),this._rotateStart={x:this._rotateEnd.x,y:this._rotateEnd.y}):"pan"===this.state&&(this._panEnd={x:t.clientX,y:t.clientY},this._panDelta={x:-.5*(this._panEnd.x-this._panStart.x),y:.5*(this._panEnd.y-this._panStart.y)},this._updatePanHandler(),this._panStart={x:this._panEnd.x,y:this._panEnd.y}))}_mouseWheelHandler(t){var e=this.mouseWheelForce;0<t.deltaY?this.targetRadiusDampedAction.addForce(e):this.targetRadiusDampedAction.addForce(-e)}_touchStartHandler(t){var e,i;switch(t.touches.length){case 1:this.state="rotate",this._rotateStart={x:t.touches[0].clientX,y:t.touches[0].clientY};break;case 2:this.state="zoom",e=t.touches[1].clientX-t.touches[0].clientX,i=t.touches[1].clientY-t.touches[0].clientY,this._zoomDistance=Math.sqrt(e*e+i*i);break;case 3:this.state="pan",this._panStart={x:(t.touches[0].clientX+t.touches[1].clientX+t.touches[2].clientX)/3,y:(t.touches[0].clientY+t.touches[1].clientY+t.touches[2].clientY)/3}}}_touchMoveHandler(t){var e;switch(t.preventDefault(),t.touches.length){case 1:if("rotate"!==this.state)return;this._rotateEnd={x:t.touches[0].clientX,y:t.touches[0].clientY},this._roatteDelta={x:.5*(this._rotateEnd.x-this._rotateStart.x),y:.5*(this._rotateEnd.y-this._rotateStart.y)},this._updateRotateHandler(),this._rotateStart={x:this._rotateEnd.x,y:this._rotateEnd.y};break;case 2:if("zoom"!==this.state)return;e=t.touches[1].clientX-t.touches[0].clientX,i=t.touches[1].clientY-t.touches[0].clientY,this._zoomDistanceEnd=Math.sqrt(e*e+i*i);var i=this._zoomDistanceEnd-this._zoomDistance,i=this._spherical.radius-(i*=1.5),i=o(i,this.minDistance,this.maxDistance);this._zoomDistance=this._zoomDistanceEnd,this._spherical.radius=i;break;case 3:this._panEnd={x:(t.touches[0].clientX+t.touches[1].clientX+t.touches[2].clientX)/3,y:(t.touches[0].clientY+t.touches[1].clientY+t.touches[2].clientY)/3},this._panDelta={x:this._panEnd.x-this._panStart.x,y:this._panEnd.y-this._panStart.y},this._panDelta.x*=-1,this._updatePanHandler(),this._panStart={x:this._panEnd.x,y:this._panEnd.y}}}_onKeyDownHandler(t){let e=0,i=0;switch(t.key){case this.keys.SHIFT:this._isShiftDown=!0;break;case this.keys.LEFT:e=-10;break;case this.keys.RIGHT:e=10;break;case this.keys.UP:i=10;break;case this.keys.BOTTOM:i=-10}this._isShiftDown?(this._roatteDelta={x:-e,y:i},this._updateRotateHandler()):(this._panDelta={x:e,y:i},this._updatePanHandler())}_onKeyUpHandler(t){t.key===this.keys.SHIFT&&(this._isShiftDown=!1)}_updatePanHandler(){var t=L(),e=L();const i=L();i[0]=this.target[0]-this.camera.position[0],i[1]=this.target[1]-this.camera.position[1],i[2]=this.target[2]-this.camera.position[2],B(i,i),s(t,i,[0,1,0]),s(e,t,i);var r=Math.max(this._spherical.radius/2e3,.001);this.targetXDampedAction.addForce((t[0]*this._panDelta.x+e[0]*this._panDelta.y)*r),this.targetYDampedAction.addForce((t[1]*this._panDelta.x+e[1]*this._panDelta.y)*r),this.targetZDampedAction.addForce((t[2]*this._panDelta.x+e[2]*this._panDelta.y)*r)}_updateRotateHandler(){this.targetThetaDampedAction.addForce(-this._roatteDelta.x/this.domElement.clientWidth),this.targetPhiDampedAction.addForce(-this._roatteDelta.y/this.domElement.clientHeight)}}class b{constructor(t,e,i,r){this.position=[0,0,0],this.lookAtPosition=[0,0,0],this.projectionMatrix=a(),this.viewMatrix=a(),this.zoom=1,this.fieldOfView=t,this.aspect=e,this.near=i,this.far=r,this.updateProjectionMatrix()}setPosition({x:t=this.position[0],y:e=this.position[1],z:i=this.position[2]}){return this.position=[t,e,i],this}updateViewMatrix(){var t,e,i,r,n,a,s,o,h,u,d,c,l,p;return t=this.viewMatrix,e=this.position,i=this.lookAtPosition,r=b.UP_VECTOR,a=e[0],s=e[1],o=e[2],h=r[0],u=r[1],d=r[2],c=i[0],l=i[1],p=i[2],Math.abs(a-c)<_&&Math.abs(s-l)<_&&Math.abs(o-p)<_?w(t):(n=a-c,e=s-l,r=o-p,c=u*(r*=i=1/Math.hypot(n,e,r))-d*(e*=i),l=d*(n*=i)-h*r,p=h*e-u*n,(i=Math.hypot(c,l,p))?(c*=i=1/i,l*=i,p*=i):p=l=c=0,d=e*p-r*l,h=r*c-n*p,u=n*l-e*c,(i=Math.hypot(d,h,u))?(d*=i=1/i,h*=i,u*=i):u=h=d=0,t[0]=c,t[1]=d,t[2]=n,t[3]=0,t[4]=l,t[5]=h,t[6]=e,t[7]=0,t[8]=p,t[9]=u,t[10]=r,t[11]=0,t[12]=-(c*a+l*s+p*o),t[13]=-(d*a+h*s+u*o),t[14]=-(n*a+e*s+r*o),t[15]=1),this}updateProjectionMatrix(){var t,e,i,r,n;return t=this.projectionMatrix,e=this.fieldOfView,i=this.aspect,r=this.near,n=this.far,e=1/Math.tan(e/2),t[0]=e/i,t[1]=0,t[2]=0,t[3]=0,t[4]=0,t[5]=e,t[6]=0,t[7]=0,t[8]=0,t[9]=0,t[11]=-1,t[12]=0,t[13]=0,t[15]=0,null!=n&&n!==1/0?(t[10]=(n+r)*(e=1/(r-n)),t[14]=2*n*r*e):(t[10]=-1,t[14]=-2*r),this}lookAt(t){return this.lookAtPosition=t,this.updateViewMatrix(),this}}function x(i,r,n,a,s,t,o,h,u,d=0,c=1,l=2,p=1,m=-1,v=0,y=0){var _=v,w=s/h,f=t/u;for(let e=0;e<=u;e++){var x=e*f-t/2;for(let t=0;t<=h;t++,v++){var g,A,E,M=t*w-s/2;i[3*v+d]=M*p,i[3*v+c]=x*m,i[3*v+l]=o/2,r[3*v+d]=0,r[3*v+c]=0,r[3*v+l]=0<=o?1:-1,n[2*v]=t/h,n[2*v+1]=1-e/u,e!==u&&t!==h&&(g=_+t+e*(h+1),A=_+t+(e+1)*(h+1),E=_+t+(e+1)*(h+1)+1,M=_+t+e*(h+1)+1,a[6*y]=g,a[6*y+1]=A,a[6*y+2]=M,a[6*y+3]=A,a[6*y+4]=E,a[6*y+5]=M,y++)}}}function e(t={}){var{width:e=1,height:i=1,depth:r=1,widthSegments:n=1,heightSegments:a=1,depthSegments:s=1}=t,o=n,h=a,u=s,d=(o+1)*(h+1)*2+(o+1)*(u+1)*2+(h+1)*(u+1)*2,c=6*(o*h*2+o*u*2+h*u*2),t=new Float32Array(3*d),n=new Float32Array(3*d),a=new Float32Array(2*d),s=new(65536<d?Uint32Array:Uint16Array)(c),d=0,c=0;return x(t,n,a,s,r,i,e,u,h,2,1,0,-1,-1,0,0),x(t,n,a,s,r,i,-e,u,h,2,1,0,1,-1,d+=(u+1)*(h+1),c+=u*h),x(t,n,a,s,e,r,i,u,h,0,2,1,1,1,d+=(u+1)*(h+1),c+=u*h),x(t,n,a,s,e,r,-i,u,h,0,2,1,1,-1,d+=(o+1)*(u+1),c+=o*u),x(t,n,a,s,e,i,-r,o,h,0,1,2,-1,-1,d+=(o+1)*(u+1),c+=o*u),x(t,n,a,s,e,i,r,o,h,0,1,2,1,-1,d+=(o+1)*(h+1),c+=o*h),{vertices:t,normal:n,uv:a,indices:s}}function i(t={}){var{width:e=1,height:i=1,depth:r=1,widthSegments:n=1,heightSegments:a=1,depthSegments:s=1}=t,o=n,h=a,u=s;const d=[];var c=(u+1)*(h+1),t=u*h*6,n=new Float32Array(3*c),a=new Float32Array(3*c),s=new Float32Array(2*c),c=new(65536<c?Uint32Array:Uint16Array)(t);x(n,a,s,c,r,i,e,u,h,2,1,0,-1,-1,0,0),d.push({orientation:y,vertices:n,normal:a,uv:s,indices:c});t=(u+1)*(h+1),n=u*h*6,a=new Float32Array(3*t),s=new Float32Array(3*t),c=new Float32Array(2*t),t=new(65536<t?Uint32Array:Uint16Array)(n);x(a,s,c,t,r,i,-e,u,h,2,1,0,1,-1,0,0),d.push({orientation:v,vertices:a,normal:s,uv:c,indices:t});n=(u+1)*(h+1),a=u*h*6,s=new Float32Array(3*n),c=new Float32Array(3*n),t=new Float32Array(2*n),n=new(65536<n?Uint32Array:Uint16Array)(a);x(s,c,t,n,e,r,i,u,h,0,2,1,1,1,0,0),d.push({orientation:"top",vertices:s,normal:c,uv:t,indices:n});a=(u+1)*(h+1),s=u*h*6,c=new Float32Array(3*a),t=new Float32Array(3*a),n=new Float32Array(2*a),s=new(65536<a?Uint32Array:Uint16Array)(s);x(c,t,n,s,e,r,-i,u,h,0,2,1,1,-1,0,0),d.push({orientation:m,vertices:c,normal:t,uv:n,indices:s});c=(o+1)*(u+1),t=o*u*6,n=new Float32Array(3*c),s=new Float32Array(3*c),u=new Float32Array(2*c),c=new(65536<c?Uint32Array:Uint16Array)(t);x(n,s,u,c,e,i,-r,o,h,0,1,2,-1,-1,0,0),d.push({orientation:p,vertices:n,normal:s,uv:u,indices:c});t=(o+1)*(h+1),n=o*h*6,s=new Float32Array(3*t),u=new Float32Array(3*t),c=new Float32Array(2*t),n=new(65536<t?Uint32Array:Uint16Array)(n);return x(s,u,c,n,e,i,r,o,h,0,1,2,1,-1,0,0),d.push({orientation:l,vertices:s,normal:u,uv:c,indices:n}),d}b.UP_VECTOR=[0,1,0];class u{static xp(t,e){var i=t[0],r=t[1],t=t[2];return e[0]=i,e[1]=-t,e[2]=r,e}static xn(t,e){var i=t[0],r=t[1],t=t[2];return e[0]=i,e[1]=t,e[2]=-r,e}static yp(t,e){var i=t[0],r=t[1],t=t[2];return e[0]=-t,e[1]=r,e[2]=i,e}static yn(t,e){var i=t[0],r=t[1],t=t[2];return e[0]=t,e[1]=r,e[2]=-i,e}static zp(t,e){var i=t[0],r=t[1],t=t[2];return e[0]=r,e[1]=-i,e[2]=t,e}static zn(t,e){var i=t[0],r=t[1],t=t[2];return e[0]=-r,e[1]=i,e[2]=t,e}static xp_yn(t,e){var i=t[0],r=t[1],t=t[2];return e[0]=-r,e[1]=-t,e[2]=i,e}static xp_yp(t,e){var i=t[0],r=t[1],t=t[2];return e[0]=r,e[1]=-t,e[2]=-i,e}static xp_yp_yp(t,e){var i=t[0],r=t[1],t=t[2];return e[0]=-i,e[1]=-t,e[2]=-r,e}static xp_xp(t,e){var i=t[0],r=t[1],t=t[2];return e[0]=i,e[1]=-r,e[2]=-t,e}}var r=({width:t=1,height:e=1,depth:i=1,radius:r=.5,div:n=4})=>{r=function(t=2,e=2,i=2,a=.5,s=4){const o=t/2,r=e/2,h=i/2,u=2*s,d=[],c=[],l=[],p=L();let n,m,v,y,_,w,f,x;f=r;const g=[E(a-o,r-a,a-h),E(o-a,r-a,a-h),E(a-o,r-a,h-a),E(o-a,r-a,h-a)],A=(t,e)=>{var i,r,n=S(-h,h,t);for(v=0;v<=u;v++)r=v<=s?0:1,i=D(v/s),_=v<=s?-1:1,w=o*_+a*i*-_,R(p,w,f,t),U(p,p,g[r|e]),B(p,p),l.push(p[0],p[1],p[2]),F(p,p,a),M(p,p,g[r|e]),d.push(p[0],p[1],p[2]),c.push(S(-o,o,w),n),1==i&&(R(p,o-a,f,t),U(p,p,g[1|e]),B(p,p),l.push(p[0],p[1],p[2]),F(p,p,a),M(p,p,g[1|e]),d.push(p[0],p[1],p[2]),c.push(S(-o,o,o-a),n))};for(m=0;m<=u;m++)n=m<=s?0:2,y=D(m/s),_=m<=s?-1:1,x=h*_+a*y*-_,A(x,n),1==y&&A(h-a,2);return{verts:d,uv:c,norm:l,indices:function(t,e){let i=[],r=t+1,n,a,s,o,h,u;for(a=0;a<e;a++)for(n=0;n<t;n++)s=a*r+n,o=s+r,h=o+1,u=s+1,i.push(s,o,h,h,u,s);return i}(1+u,1+u)}}(t,e,i,r,n),n={verts:[],indices:[],uv:[],norm:[]};return d(n,r,(t,e)=>(e[0]=t[0],e[1]=t[1],e[2]=t[2],e)),d(n,r,u.xp),d(n,r,u.xp_yp),d(n,r,u.xp_yp_yp),d(n,r,u.xp_yn),d(n,r,u.xp_xp),{vertices:new Float32Array(n.verts),normal:new Float32Array(n.norm),uv:new Float32Array(n.uv),indices:new Uint16Array(n.indices)}};function d(e,i,r){var t=e.verts.length/3,n=i.verts.length;const a=L(),s=L();for(let t=0;t<n;t+=3)R(a,i.verts[t],i.verts[t+1],i.verts[t+2]),r(a,s),e.verts.push(s[0],s[1],s[2]),R(a,i.norm[t],i.norm[t+1],i.norm[t+2]),r(a,s),e.norm.push(s[0],s[1],s[2]);for(const a of i.uv)e.uv.push(a);for(const a of i.indices)e.indices.push(t+a)}var c=({width:t=1,height:e=1,depth:i=1,radius:r=.5,div:n=4})=>{r=function(t=2,e=2,i=2,a=.5,s=4){const o=t/2,r=e/2,h=i/2,u=2*s,d=[],c=[],l=[],p=L();let n,m,v,y,_,w,f,x;f=r;const g=[E(a-o,r-a,a-h),E(o-a,r-a,a-h),E(a-o,r-a,h-a),E(o-a,r-a,h-a)],A=(t,e)=>{var i,r,n=S(-h,h,t);for(v=0;v<=u;v++)r=v<=s?0:1,i=D(v/s),_=v<=s?-1:1,w=o*_+a*i*-_,R(p,w,f,t),U(p,p,g[r|e]),B(p,p),l.push(p[0],p[1],p[2]),F(p,p,a),M(p,p,g[r|e]),d.push(p[0],p[1],p[2]),c.push(S(-o,o,w),n),1==i&&(R(p,o-a,f,t),U(p,p,g[1|e]),B(p,p),l.push(p[0],p[1],p[2]),F(p,p,a),M(p,p,g[1|e]),d.push(p[0],p[1],p[2]),c.push(S(-o,o,o-a),n))};for(m=0;m<=u;m++)n=m<=s?0:2,y=D(m/s),_=m<=s?-1:1,x=h*_+a*y*-_,A(x,n),1==y&&A(h-a,2);return{verts:d,uv:c,norm:l,indices:function(t,e){let i=[],r=t+1,n,a,s,o,h,u;for(a=0;a<e;a++)for(n=0;n<t;n++)s=a*r+n,o=s+r,h=o+1,u=s+1,i.push(s,o,h,h,u,s);return i}(1+u,1+u)}}(t,e,i,r,n);const a=[];n={verts:[],indices:[],uv:[],norm:[]};return g(n,r,(t,e)=>(e[0]=t[0],e[1]=t[1],e[2]=t[2],e)),a.push({orientation:"top",vertices:new Float32Array(n.verts),normal:new Float32Array(n.norm),uv:new Float32Array(n.uv),indices:new Uint16Array(n.indices)}),g(n={verts:[],indices:[],uv:[],norm:[]},r,u.xp),a.push({orientation:l,vertices:new Float32Array(n.verts),normal:new Float32Array(n.norm),uv:new Float32Array(n.uv),indices:new Uint16Array(n.indices)}),g(n={verts:[],indices:[],uv:[],norm:[]},r,u.xp_yp),a.push({orientation:v,vertices:new Float32Array(n.verts),normal:new Float32Array(n.norm),uv:new Float32Array(n.uv),indices:new Uint16Array(n.indices)}),g(n={verts:[],indices:[],uv:[],norm:[]},r,u.xp_yp_yp),a.push({orientation:p,vertices:new Float32Array(n.verts),normal:new Float32Array(n.norm),uv:new Float32Array(n.uv),indices:new Uint16Array(n.indices)}),g(n={verts:[],indices:[],uv:[],norm:[]},r,u.xp_yn),a.push({orientation:y,vertices:new Float32Array(n.verts),normal:new Float32Array(n.norm),uv:new Float32Array(n.uv),indices:new Uint16Array(n.indices)}),g(n={verts:[],indices:[],uv:[],norm:[]},r,u.xp_xp),a.push({orientation:m,vertices:new Float32Array(n.verts),normal:new Float32Array(n.norm),uv:new Float32Array(n.uv),indices:new Uint16Array(n.indices)}),a};function g(e,i,r){var t=e.verts.length/3,n=i.verts.length;const a=L(),s=L();for(let t=0;t<n;t+=3)R(a,i.verts[t],i.verts[t+1],i.verts[t+2]),r(a,s),e.verts.push(s[0],s[1],s[2]),R(a,i.norm[t],i.norm[t+1],i.norm[t+2]),r(a,s),e.norm.push(s[0],s[1],s[2]);for(const a of i.uv)e.uv.push(a);for(const a of i.indices)e.indices.push(t+a)}function H(t={}){var{radius:i=1,segments:r=8,thetaStart:n=0,thetaLength:a=2*Math.PI}=t;const e=[],s=[],o=[],h=[],u=L(),d=f();s.push(0,0,0),o.push(0,0,1),h.push(.5,.5);for(let t=0,e=3;t<=r;t++,e+=3){var c=n+t/r*a;u[0]=i*Math.cos(c),u[1]=i*Math.sin(c),s.push(...u),o.push(0,0,1),d[0]=(s[e]/i+1)/2,d[1]=(s[e+1]/i+1)/2,h.push(d[0],d[1])}for(let t=1;t<=r;t++)e.push(t,t+1,0);return{indices:new(65536<r?Uint32Array:Uint16Array)(e),vertices:new Float32Array(s),normal:new Float32Array(o),uv:new Float32Array(h)}}function T(t={}){var{width:e=1,height:i=1,widthSegments:r=1,heightSegments:n=1}=t,a=r,s=n,o=(a+1)*(s+1),h=a*s*6,t=new Float32Array(3*o),r=new Float32Array(3*o),n=new Float32Array(2*o),h=new(65536<o?Uint32Array:Uint16Array)(h);return x(t,r,n,h,e,i,0,a,s),{vertices:t,normal:r,uv:n,indices:h}}function k(t={}){var{radius:e=.5,widthSegments:i=16,heightSegments:r=Math.ceil(.5*i),phiStart:n=0,phiLength:a=2*Math.PI,thetaStart:s=0,thetaLength:t=Math.PI}=t,o=i,h=r,u=n,d=a,c=s,l=t,s=(o+1)*(h+1),t=o*h*6;const p=new Float32Array(3*s),m=new Float32Array(3*s),v=new Float32Array(2*s),y=new(65536<s?Uint32Array:Uint16Array)(t);let _=0,w=0,f=0;var x=c+l;const g=[];var A=L();for(let t=0;t<=h;t++){const T=[];var E=t/h;for(let t=0;t<=o;t++,_++){var M=t/o,F=-e*Math.cos(u+M*d)*Math.sin(c+E*l),U=e*Math.cos(c+E*l),S=e*Math.sin(u+M*d)*Math.sin(c+E*l);R(A,p[3*_]=F,p[3*_+1]=U,p[3*_+2]=S),B(A,A),m[3*_]=A[0],m[3*_+1]=A[1],m[3*_+2]=A[2],v[2*_]=M,v[2*_+1]=1-E,T.push(w++)}g.push(T)}for(let e=0;e<h;e++)for(let t=0;t<o;t++){var D=g[e][t+1],P=g[e][t],b=g[e+1][t],H=g[e+1][t+1];(0!==e||0<c)&&(y[3*f]=D,y[3*f+1]=P,y[3*f+2]=H,f++),(e!==h-1||x<Math.PI)&&(y[3*f]=P,y[3*f+1]=b,y[3*f+2]=H,f++)}return{vertices:p,normal:m,uv:v,indices:y}}function z(t={}){var{radius:i=.5,tube:r=.35,arc:n=2*Math.PI,radialSegments:e=8,tubularSegments:t=6}=t,a=Math.floor(e),s=Math.floor(t);const o=[],h=[],u=[],d=[],c=L(),l=L();var p=L();for(let e=0;e<=a;e++)for(let t=0;t<=s;t++){var m=t/s*n,v=e/a*Math.PI*2;l[0]=(i+r*Math.cos(v))*Math.cos(m),l[1]=(i+r*Math.cos(v))*Math.sin(m),l[2]=r*Math.sin(v),h.push(l[0],l[1],l[2]),c[0]=i*Math.cos(m),c[1]=i*Math.sin(m),U(p,l,c),B(p,p),u.push(p[0],p[1],p[0]),d.push(t/s,e/a)}for(let e=1;e<=a;e++)for(let t=1;t<=s;t++){var y=(s+1)*e+t-1,_=(s+1)*(e-1)+t-1,w=(s+1)*(e-1)+t,f=(s+1)*e+t;o.push(y,_,f),o.push(_,w,f)}return{indices:new(65536<(a+1)*(s+1)?Uint32Array:Uint16Array)(o),vertices:new Float32Array(h),normal:new Float32Array(u),uv:new Float32Array(d)}}var Y=Object.freeze({__proto__:null,createBox:e,createBoxSeparateFace:i,createRoundedBoxSeparateFace:c,createRoundedBox:r,createCircle:H,createPlane:T,createSphere:k,createTorus:z,GeometryUtils:{createBox:e,createBoxSeparateFace:i,createRoundedBoxSeparateFace:c,createRoundedBox:r,createCircle:H,createPlane:T,createSphere:k,createTorus:z}});t(void 0,void 0,void 0,function*(){var t=yield null===(t=navigator.gpu)||void 0===t?void 0:t.requestAdapter();const e=`
    <div id="no-webgpu-wrapper">
      <div id="no-webgpu">
        WebGPU is not supported on this browser. Please try modern Google Chrome (Canary) or Firefox Nightly.
      </div>
    </div>
  `;window.addEventListener("unhandledrejection",t=>{document.body.innerHTML+=e}),window.addEventListener("error",t=>{document.body.innerHTML+=e}),t||(document.body.innerHTML+=e)}),t(void 0,void 0,void 0,function*(){const t=document.getElementById("gpu-c");t.width=innerWidth*devicePixelRatio,t.height=innerHeight*devicePixelRatio,t.style.setProperty("width",`${innerWidth}px`),t.style.setProperty("height",`${innerHeight}px`);const e=yield null===(p=navigator.gpu)||void 0===p?void 0:p.requestAdapter(),a=yield null===e||void 0===e?void 0:e.requestDevice(),s=t.getContext("webgpu");var i=s.getPreferredFormat(e);s.configure({device:a,format:i});const{vertices:r,uv:n,indices:o}=Y.createBox(),h=a.createBuffer({size:r.byteLength,usage:GPUBufferUsage.VERTEX|GPUBufferUsage.COPY_DST,mappedAtCreation:!0});new Float32Array(h.getMappedRange()).set(r),h.unmap();const u=a.createBuffer({size:n.byteLength,usage:GPUBufferUsage.VERTEX|GPUBufferUsage.COPY_DST,mappedAtCreation:!0});new Float32Array(u.getMappedRange()).set(n),u.unmap();const d=a.createBuffer({size:o.byteLength,usage:GPUBufferUsage.INDEX|GPUBufferUsage.COPY_DST,mappedAtCreation:!0});new(o instanceof Uint16Array?Uint16Array:Uint32Array)(d.getMappedRange()).set(o),d.unmap();const c=a.createRenderPipeline({vertex:{module:a.createShaderModule({code:"\n[[block]]\nstruct Transform {\n  projectionMatrix: mat4x4<f32>;\n  viewMatrix: mat4x4<f32>;\n  modelMatrix: mat4x4<f32>;\n};\n\n[[group(0), binding(0)]]\nvar<uniform> transforms: Transform;\n\nstruct Input {\n  [[location(0)]] position: vec4<f32>;\n  [[location(1)]] uv: vec2<f32>;\n};\n\nstruct Output {\n  [[builtin(position)]] Position: vec4<f32>;\n  [[location(0)]] uv: vec2<f32>;\n};\n\n[[stage(vertex)]]\nfn main (input: Input) -> Output {\n  var output: Output;\n\n  output.Position = transforms.projectionMatrix *\n                    transforms.viewMatrix *\n                    transforms.modelMatrix *\n                    input.position;\n                    \n  output.uv = input.uv;\n\n  return output;\n}\n"}),entryPoint:"main",buffers:[{arrayStride:3*Float32Array.BYTES_PER_ELEMENT,attributes:[{shaderLocation:0,format:"float32x3",offset:0}]},{arrayStride:2*Float32Array.BYTES_PER_ELEMENT,attributes:[{shaderLocation:1,format:"float32x2",offset:0}]}]},fragment:{module:a.createShaderModule({code:"\n[[group(0), binding(1)]] var mySampler: sampler;\n[[group(0), binding(2)]] var myTexture: texture_2d<f32>;\n\nstruct Input {\n  [[location(0)]] uv: vec2<f32>;\n};\n\n[[stage(fragment)]]\n\nfn main (input: Input) -> [[location(0)]] vec4<f32> {\n  return textureSample(myTexture, mySampler, vec2<f32>(input.uv.x, 1.0 - input.uv.y));\n}\n"}),entryPoint:"main",targets:[{format:i}]},primitive:{topology:"triangle-list",stripIndexFormat:void 0},multisample:{count:4},depthStencil:{format:"depth24plus",depthWriteEnabled:!0,depthCompare:"less"}}),l=new Image;l.src=`${window.ASSETS_BASE_URL}/webgpu-logo-pot.png`,yield l.decode();var p=yield createImageBitmap(l);const m=a.createTexture({size:[p.width,p.height,1],format:i,usage:GPUTextureUsage.TEXTURE_BINDING|GPUTextureUsage.COPY_DST|GPUTextureUsage.RENDER_ATTACHMENT});a.queue.copyExternalImageToTexture({source:p},{texture:m},[p.width,p.height]);p=a.createSampler({magFilter:"linear",minFilter:"linear"});const v=a.createBuffer({size:48*Float32Array.BYTES_PER_ELEMENT,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}),y=a.createBindGroup({layout:c.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:v,offset:0,size:48*Float32Array.BYTES_PER_ELEMENT}},{binding:1,resource:p},{binding:2,resource:m.createView()}]}),_=new b(45*Math.PI/180,t.width/t.height,.1,100);_.setPosition({x:1.5,y:1.5,z:3}),_.lookAt([0,0,0]),_.updateProjectionMatrix(),_.updateViewMatrix(),new P(_);const w=new A,f=a.createTexture({size:[t.width,t.height,1],format:"depth24plus",sampleCount:4,usage:GPUTextureUsage.RENDER_ATTACHMENT}),x=a.createTexture({size:[t.width,t.height],sampleCount:4,format:i,usage:GPUTextureUsage.RENDER_ATTACHMENT});let g=x.createView();requestAnimationFrame(function t(e){requestAnimationFrame(t);e/=1e3;const i=.2*e;w.setRotation({y:i}).updateModelMatrix();const r=a.createCommandEncoder();const n=r.beginRenderPass({colorAttachments:[{view:g,resolveTarget:s.getCurrentTexture().createView(),loadValue:[.1,.1,.1,1],storeOp:"store"}],depthStencilAttachment:{view:f.createView(),depthLoadValue:1,depthStoreOp:"store",stencilLoadValue:0,stencilStoreOp:"store"}});a.queue.writeBuffer(v,0,_.projectionMatrix);a.queue.writeBuffer(v,16*Float32Array.BYTES_PER_ELEMENT,_.viewMatrix);a.queue.writeBuffer(v,32*Float32Array.BYTES_PER_ELEMENT,w.modelMatrix);n.setPipeline(c);n.setVertexBuffer(0,h);n.setVertexBuffer(1,u);n.setIndexBuffer(d,o instanceof Uint16Array?"uint16":"uint32");n.setBindGroup(0,y);n.drawIndexed(o.length);n.endPass();a.queue.submit([r.finish()])})})}();
