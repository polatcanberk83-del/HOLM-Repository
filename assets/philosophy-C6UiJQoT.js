import{B as e,E as t,Et as n,Ht as r,I as i,It as a,M as o,Pt as s,Qt as c,S as l,Tt as u,Vt as d,a as f,an as p,b as m,d as h,en as g,et as _,f as v,ht as ee,i as te,in as y,lt as ne,m as re,n as ie,nn as ae,o as oe,p as b,r as se,t as x,tn as S,ut as C,wt as ce,x as le,zt as w}from"./pageTransition-ETHrJqUS.js";import{t as ue}from"./UnrealBloomPass-Dh3nuNKy.js";import{n as T,t as E}from"./OutputPass-qOncEf1q.js";var D=.16,O=.09,k=.18,A=.5,j=22,M=.3,N=.985,P=.9,F=.92,I=1.6,L=.72,R=1.4,z=`#000000`,B=`#02040c`,V=`#06183a`,H=`#123063`,U=`
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`,de=`
uniform float     iTime;
uniform vec2      iResolution;
uniform vec4      iMouse;
uniform int       iFrame;
uniform sampler2D iPreviousFrame;
uniform float     uBrushSize;
uniform float     uBrushStrength;
uniform float     uFluidDecay;
uniform float     uTrailLength;
uniform float     uStopDecay;
varying vec2      vUv;

vec2 ur, U;

float ln(vec2 p, vec2 a, vec2 b) {
  return length(p - a - (b - a) * clamp(dot(p - a, b - a) / dot(b - a, b - a), 0.0, 1.0));
}
vec4 t(vec2 v, int a, int b) {
  return texture2D(iPreviousFrame, fract((v + vec2(float(a), float(b))) / ur));
}
vec4 t(vec2 v) {
  return texture2D(iPreviousFrame, fract(v / ur));
}
float area(vec2 a, vec2 b, vec2 c) {
  float A = length(b - c), B = length(c - a), C = length(a - b), s = 0.5 * (A + B + C);
  return sqrt(s * (s - A) * (s - B) * (s - C));
}

void main() {
  U  = vUv * iResolution;
  ur = iResolution.xy;
  if (iFrame < 1) {
    float w = 0.5 + sin(0.2 * U.x) * 0.5;
    float q = length(U - 0.5 * ur);
    gl_FragColor = vec4(0.1 * exp(-0.001 * q * q), 0.0, 0.0, w);
  } else {
    vec2 v = U,
         A = v + vec2( 1.0,  1.0),
         B = v + vec2( 1.0, -1.0),
         C = v + vec2(-1.0,  1.0),
         D = v + vec2(-1.0, -1.0);
    for (int i = 0; i < 8; i++) {
      v -= t(v).xy;
      A -= t(A).xy;
      B -= t(B).xy;
      C -= t(C).xy;
      D -= t(D).xy;
    }
    vec4 me = t(v);
    vec4 n = t(v, 0, 1),
         e = t(v, 1, 0),
         s = t(v, 0, -1),
         w = t(v, -1, 0);
    vec4 ne = 0.25 * (n + e + s + w);
    me = mix(t(v), ne, vec4(0.15, 0.15, 0.95, 0.0));
    me.z = me.z - 0.01 * ((area(A, B, C) + area(B, C, D)) - 4.0);
    vec4 pr = vec4(e.z, w.z, n.z, s.z);
    me.xy = me.xy + 100.0 * vec2(pr.x - pr.y, pr.z - pr.w) / ur;
    me.xy *= uFluidDecay;
    me.z  *= uTrailLength;

    if (iMouse.z > 0.0) {
      vec2  mousePos = iMouse.xy;
      vec2  mousePrev = iMouse.zw;
      vec2  mouseVel = mousePos - mousePrev;
      float velMag   = length(mouseVel);
      float q        = ln(U, mousePos, mousePrev);
      vec2  m        = mousePos - mousePrev;
      float l        = length(m);
      if (l > 0.0) m = min(l, 10.0) * m / l;
      float brushSizeFactor = 1e-4 / uBrushSize;
      float strengthFactor  = 0.03 * uBrushStrength;
      float falloff = exp(-brushSizeFactor * q * q * q);
      falloff = pow(falloff, 0.5);
      me.xyw += strengthFactor * falloff * vec3(m, 10.0);
      if (velMag < 2.0) {
        float distToCursor = length(U - mousePos);
        float influence    = exp(-distToCursor * 0.01);
        float cursorDecay  = mix(1.0, uStopDecay, influence);
        me.xy *= cursorDecay;
        me.z  *= cursorDecay;
      }
    }
    gl_FragColor = clamp(me, -0.4, 0.4);
  }
}
`,fe=`
uniform float     iTime;
uniform vec2      iResolution;
uniform sampler2D iFluid;
uniform float     uDistortionAmount;
uniform vec3      uColor1;
uniform vec3      uColor2;
uniform vec3      uColor3;
uniform vec3      uColor4;
uniform float     uColorIntensity;
uniform float     uSoftness;
varying vec2      vUv;

void main() {
  vec2 fragCoord = vUv * iResolution;
  vec4 fluid = texture2D(iFluid, vUv);
  vec2 fluidVel = fluid.xy;
  float mr = min(iResolution.x, iResolution.y);
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / mr;
  uv += fluidVel * (0.5 * uDistortionAmount);

  float d = -iTime * 0.5;
  float a = 0.0;
  for (float i = 0.0; i < 8.0; ++i) {
    a += cos(i - d - a * uv.x);
    d += sin(uv.y * i + a);
  }
  d += iTime * 0.5;

  float mixer1 = cos(uv.x * d) * 0.5 + 0.5;
  float mixer2 = cos(uv.y * a) * 0.5 + 0.5;
  float mixer3 = sin(d + a) * 0.5 + 0.5;

  float smoothAmount = clamp(uSoftness * 0.1, 0.0, 0.9);
  mixer1 = mix(mixer1, 0.5, smoothAmount);
  mixer2 = mix(mixer2, 0.5, smoothAmount);
  mixer3 = mix(mixer3, 0.5, smoothAmount);

  vec3 col = mix(uColor1, uColor2, mixer1);
  col = mix(col, uColor3, mixer2);
  col = mix(col, uColor4, mixer3 * 0.4);
  col *= uColorIntensity;
  gl_FragColor = vec4(col, 1.0);
}
`;function W(e){return new S(parseInt(e.slice(1,3),16)/255,parseInt(e.slice(3,5),16)/255,parseInt(e.slice(5,7),16)/255)}var G=5.6,pe=1.85,me=4.4,he=.95,ge=.75,K=[{x:0,y:0,scale:1.2,side:null,hasText:!1},{x:.34,y:.03,scale:1,side:`left`,hasText:!0},{x:-.34,y:-.05,scale:1.24,side:`right`,hasText:!0},{x:0,y:.08,scale:.62,side:`left`,hasText:!0},{x:-.3,y:.06,scale:1.18,side:`right`,hasText:!0},{x:.28,y:-.04,scale:1.28,side:`left`,hasText:!0},{x:0,y:.02,scale:1.35,side:`center-below`,hasText:!0}],_e=1,ve=16773852,ye=9023716,be=12108014,xe=.012,q=1.05;`${xe.toFixed(4)}${q.toFixed(4)}${q.toFixed(4)}${.35.toFixed(4)}${320 .toFixed(1)}`;var J=[[`Some studios tell stories.`,`We work toward a single moment.`],[`The moment a rough idea holds still —`,`and becomes something finished.`],[`It is rare. It forms under pressure.`,`The way carbon becomes a diamond.`],[`So that is the shape we keep returning to.`,`Not decoration. A reminder of what we are after.`],[`Between sketch and masterpiece,`,`there is patience.`],[`Ready to create your moment.`]];function Se(e){return e.split(` `).map(e=>e?`<span class="holm-philosophy__word">${Array.from(e).map(e=>`<span class="holm-philosophy__char">${e.replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`)}</span>`).join(``)}</span>`:``).join(` `)}var Y=`Let's talk`,Ce=`/contact/`,we=class{constructor({lenis:e}={}){this.lenis=e||null,this._reducedMotion=window.matchMedia(`(prefers-reduced-motion: reduce)`).matches,this._isMobile=window.innerWidth<768||`ontouchstart`in window,this.renderer=null,this.scene=null,this.camera=null,this.diamond=null,this.envMap=null,this._lights=[],this._heroPlane=null,this.container=null,this.canvas=null,this.blocks=[],this._rafId=null,this._active=!1,this._prevTime=0,this._scrollT=0,this._idleSpin=0,this._ctaEl=null,this._ctaMove=null,this._ctaLeave=null,this._ctaSetX=null,this._ctaSetY=null,this._ctaInnerSetX=null,this._ctaInnerSetY=null,this._targetPos=new S,this._targetScale=new S(1,1,1),this._targetTilt=0,this._pressure=0,this._mouseNdc=new g(-99,-99),this._mouseWorld=new S,this._mouseWorldSmooth=new S(999,999,999),this._invMat=new ne,this._pointerActive=!1,this._elapsed=0,this._fluidQuadCam=null,this._fluidQuadScene=null,this._fluidQuadMesh=null,this._fluidMat=null,this._displayMat=null,this._fluidTargetA=null,this._fluidTargetB=null,this._displayTarget=null,this._fluidFrame=0,this._mousePx=new g(0,0),this._prevMousePx=new g(0,0),this._lastMouseMoveMs=0,this._onResize=this._onResize.bind(this),this._onLenisScroll=this._onLenisScroll.bind(this),this._onNativeScroll=this._onNativeScroll.bind(this),this._onPointerMove=this._onPointerMove.bind(this),this._observer=null}init(){this._createDOM(),this._createThree(),this._bindScroll(),this._bindResize(),this._bindPointer(),this._observeBlocks(),this._bindCtaMagnetic(),this._startLoop()}_bindPointer(){window.addEventListener(`pointermove`,this._onPointerMove,{passive:!0})}_onPointerMove(e){if(this._mouseNdc.set(e.clientX/window.innerWidth*2-1,-(e.clientY/window.innerHeight*2-1)),this._pointerActive=!0,this._fluidMat){window.innerWidth;let t=window.innerHeight,n=e.clientX*A,r=(t-e.clientY)*A;this._prevMousePx.copy(this._mousePx),this._mousePx.set(n,r),this._lastMouseMoveMs=performance.now(),this._fluidMat.uniforms.iMouse.value.set(this._mousePx.x,this._mousePx.y,this._prevMousePx.x,this._prevMousePx.y)}}destroy(){this._active=!1,this._rafId&&cancelAnimationFrame(this._rafId),window.removeEventListener(`resize`,this._onResize),window.removeEventListener(`pointermove`,this._onPointerMove),this.lenis&&this._lenisScrollBound?this.lenis.off(`scroll`,this._onLenisScroll):window.removeEventListener(`scroll`,this._onNativeScroll),this._observer&&this._observer.disconnect(),this._ctaMove&&window.removeEventListener(`mousemove`,this._ctaMove),this._ctaLeave&&window.removeEventListener(`mouseleave`,this._ctaLeave),this.diamond&&(this.diamond.geometry.dispose(),this.diamond.material.dispose()),this._heroPlane&&(this._heroPlane.geometry.dispose(),this._heroPlane.material.uniforms?.uTextMap?.value?.dispose(),this._heroPlane.material.dispose()),this.envMap&&this.envMap.dispose();for(let e of this._lights)this.scene?.remove(e);this._fluidTargetA?.dispose(),this._fluidTargetB?.dispose(),this._displayTarget?.dispose(),this._fluidMat?.dispose(),this._displayMat?.dispose(),this._fluidQuadMesh?.geometry?.dispose(),this.renderer&&(this.renderer.dispose(),this.renderer.forceContextLoss?.()),this.container?.parentNode&&this.container.parentNode.removeChild(this.container),this.renderer=this.scene=this.camera=null,this.diamond=this.envMap=null,this.container=this.canvas=null}_createDOM(){let e=document.createElement(`div`);e.className=`holm-philosophy`,this._reducedMotion&&e.classList.add(`is-reduced-motion`);let t=0;if(e.innerHTML=`
      <canvas class="holm-philosophy__canvas" aria-hidden="true"></canvas>

      <section class="holm-philosophy__intro" data-beat="0" aria-hidden="true"></section>

      <main class="holm-philosophy__beats">
        ${K.map((e,n)=>{if(!e.hasText)return``;let r=J[t],i=t===J.length-1;t++;let a=r.map(e=>`
          <div class="holm-philosophy__line">${Se(e)}</div>
        `).join(``),o=i?`
          <a class="holm-philosophy__cta"
             href="${Ce}"
             aria-label="${Y}"
             data-hover-roll>${Y}</a>
        `:``;return`
          <section class="holm-philosophy__beat"
                   data-beat="${n}"
                   data-side="${e.side}"
                   data-final="${i}">
            <div class="holm-philosophy__stanza">
              ${a}
              ${o}
            </div>
          </section>
        `}).join(``)}
      </main>
    `,document.body.appendChild(e),this.container=e,this.canvas=e.querySelector(`.holm-philosophy__canvas`),this.blocks=[...e.querySelectorAll(`.holm-philosophy__beat`)],this._beatEls=[],e.querySelectorAll(`[data-beat]`).forEach(e=>{let t=parseInt(e.dataset.beat,10);Number.isFinite(t)&&K[t]&&this._beatEls.push({el:e,beat:K[t]})}),!this._reducedMotion){let t=e.querySelectorAll(`.holm-philosophy__char`);h.set(t,{yPercent:115,opacity:0})}}_createThree(){this.renderer=new b({canvas:this.canvas,antialias:!0,alpha:!1,powerPreference:`high-performance`}),this.renderer.setPixelRatio(Math.min(window.devicePixelRatio,this._isMobile?1.5:2)),this.renderer.setSize(window.innerWidth,window.innerHeight),this.renderer.toneMapping=4,this.renderer.toneMappingExposure=.55,this.renderer.outputColorSpace=w,this.scene=new d,this._initFluid(),this.scene.background=this._displayTarget.texture,this.camera=new ce(36,window.innerWidth/window.innerHeight,.1,100),this.camera.position.set(0,0,G),this.camera.lookAt(0,0,0);let e=new v(this.renderer),t=new T;this.envMap=e.fromScene(t,.04).texture,e.dispose(),this.scene.environment=this.envMap,this.scene.environmentIntensity=pe,this._composer=new oe(this.renderer),this._composer.setPixelRatio(this.renderer.getPixelRatio()),this._composer.setSize(window.innerWidth,window.innerHeight),this._composer.addPass(new f(this.scene,this.camera)),this._bloom=new ue(new g(window.innerWidth,window.innerHeight),.28,.35,.98),this._composer.addPass(this._bloom),this._composer.addPass(new E),this._createDiamond(),this._createHeroPlane(),this._addLights()}_createHeroPlane(){let e=document.createElement(`canvas`);e.width=2560,e.height=640;let t=e.getContext(`2d`);t.fillStyle=`rgba(255, 255, 255, 1.0)`,t.font=`italic 300 480px 'Fraunces', 'Times New Roman', serif`,t.textAlign=`center`,t.textBaseline=`middle`,t.fillText(`philosophy`,e.width/2,e.height/2+30);let i=new l(e);i.colorSpace=w,i.minFilter=_,i.magFilter=_,i.anisotropy=this.renderer.capabilities.getMaxAnisotropy();let o=new r({vertexShader:`
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,fragmentShader:`
        uniform sampler2D uTextMap;
        uniform sampler2D uFluidMap;
        uniform float     uTime;
        uniform vec2      uMouseUv;
        uniform float     uCursorFocus;
        uniform float     uOpacity;
        varying vec2 vUv;

        void main() {
          vec2 uv = vUv;

          // Fluid velocity as a base flow field distorting the letters
          vec4 fluid   = texture2D(uFluidMap, uv);
          vec2 flow    = fluid.xy;
          float flowMag = length(flow);

          // Ambient traveling wave — two sines running in orthogonal
          // directions so the whole word slowly breathes
          vec2 wave = vec2(
            sin(uv.y * 26.0 + uTime * 1.15) * 0.010,
            sin(uv.x * 18.0 - uTime * 0.85) * 0.007
          );

          // Cursor ring — radial ripple emanating from the pointer
          vec2 fromCursor = uv - uMouseUv;
          fromCursor.x *= 4.0;   // watermark is ~4:1, unwarp for round rings
          float cd = length(fromCursor);
          vec2 ripple = vec2(0.0);
          float cursorMask = 0.0;
          if (uCursorFocus > 0.001) {
            float ringPhase = cd * 34.0 - uTime * 3.6;
            float ringFall  = exp(-cd * 3.4);
            vec2  dir       = fromCursor / max(cd, 1e-4);
            ripple    = dir * sin(ringPhase) * ringFall * 0.020 * uCursorFocus;
            cursorMask = smoothstep(0.55, 0.0, cd) * uCursorFocus;
          }

          vec2 distorted = uv + wave + flow * 0.14 + ripple;

          // Chromatic aberration — grows with fluid velocity + near cursor
          float ab  = 0.0025 + flowMag * 0.055 + cursorMask * 0.014;
          float aR  = texture2D(uTextMap, distorted + vec2( ab, 0.0)).a;
          float aG  = texture2D(uTextMap, distorted).a;
          float aB  = texture2D(uTextMap, distorted - vec2( ab, 0.0)).a;

          // Base tint — pure black; cursor bleeds a whisper of warmth in
          vec3 cool = vec3(0.00, 0.00, 0.00);
          vec3 warm = vec3(0.06, 0.04, 0.03);
          vec3 tint = mix(cool, warm, cursorMask * 0.85);

          vec3 col   = tint * vec3(aR, aG, aB);
          float alpha = max(max(aR, aG), aB);

          // Black watermark needs more presence to read against the fluid
          alpha *= 0.72 + cursorMask * 0.28;
          alpha *= uOpacity;

          gl_FragColor = vec4(col, alpha);
        }
      `,uniforms:{uTextMap:{value:i},uFluidMap:{value:this._displayTarget.texture},uTime:{value:0},uMouseUv:{value:new g(-2,-2)},uCursorFocus:{value:0},uOpacity:{value:1}},transparent:!0,depthWrite:!1}),s=G- -8,c=this.camera.fov*Math.PI/360,d=Math.tan(c)*s*this.camera.aspect,f=Math.max(d*2*1.15,20),p=f/(e.width/e.height),m=new n(f,p,96,24);this._heroPlane=new C(m,o),this._heroPlane.position.z=-8,this._heroPlane.renderOrder=-1,this._heroPlaneSize={w:f,h:p,z:-8},this._heroPlaneMath=new u(new S(0,0,1),8),this._heroRaycaster=new a,this._heroHitPoint=new S,this.scene.add(this._heroPlane)}_initFluid(){let t=Math.max(2,Math.floor(window.innerWidth*A)),i=Math.max(2,Math.floor(window.innerHeight*A)),a={minFilter:_,magFilter:_,format:s,type:e,depthBuffer:!1,stencilBuffer:!1};this._fluidTargetA=new y(t,i,a),this._fluidTargetB=new y(t,i,a),this._displayTarget=new y(t,i,{...a,type:c}),this._fluidCurrent=this._fluidTargetA,this._fluidPrev=this._fluidTargetB,this._fluidMat=new r({vertexShader:U,fragmentShader:de,uniforms:{iTime:{value:0},iResolution:{value:new g(t,i)},iMouse:{value:new ae(0,0,0,0)},iFrame:{value:0},iPreviousFrame:{value:null},uBrushSize:{value:j},uBrushStrength:{value:M},uFluidDecay:{value:N},uTrailLength:{value:P},uStopDecay:{value:F}}}),this._displayMat=new r({vertexShader:U,fragmentShader:fe,uniforms:{iTime:{value:0},iResolution:{value:new g(t,i)},iFluid:{value:null},uDistortionAmount:{value:I},uColor1:{value:W(z)},uColor2:{value:W(B)},uColor3:{value:W(V)},uColor4:{value:W(H)},uColorIntensity:{value:L},uSoftness:{value:R}}}),this._fluidQuadCam=new le,this._fluidQuadScene=new d,this._fluidQuadMesh=new C(new n(2,2),this._fluidMat),this._fluidQuadScene.add(this._fluidQuadMesh),this._displayTarget.texture.colorSpace=w}_stepFluid(e){if(!this._fluidMat)return;performance.now()-this._lastMouseMoveMs>100&&this._fluidMat.uniforms.iMouse.value.set(0,0,0,0),this._fluidMat.uniforms.iTime.value=e,this._fluidMat.uniforms.iFrame.value=this._fluidFrame,this._fluidMat.uniforms.iPreviousFrame.value=this._fluidPrev.texture,this._fluidQuadMesh.material=this._fluidMat,this.renderer.setRenderTarget(this._fluidCurrent),this.renderer.clear(),this.renderer.render(this._fluidQuadScene,this._fluidQuadCam),this._displayMat.uniforms.iTime.value=e,this._displayMat.uniforms.iFluid.value=this._fluidCurrent.texture,this._fluidQuadMesh.material=this._displayMat,this.renderer.setRenderTarget(this._displayTarget),this.renderer.clear(),this.renderer.render(this._fluidQuadScene,this._fluidQuadCam),this.renderer.setRenderTarget(null);let t=this._fluidCurrent;this._fluidCurrent=this._fluidPrev,this._fluidPrev=t,this._fluidFrame++}_createDiamond(){let e=this._createBrilliantGeometry(48);e.scale(.92,1.06,.92),e.computeVertexNormals();let n=new ee({color:16777215,metalness:0,roughness:0,transmission:1,thickness:this._isMobile?1.2:1.8,ior:2.417,attenuationDistance:6,attenuationColor:new t(16777215),envMapIntensity:2.2,iridescence:.35,iridescenceIOR:1.55,iridescenceThicknessRange:[400,900],clearcoat:1,clearcoatRoughness:0,transparent:!0,side:2});`dispersion`in n&&(n.dispersion=3.2),this.diamond=new C(e,n),this.diamond.rotation.x=-.18,this.scene.add(this.diamond)}_createBrilliantGeometry(e=24){let t=[],n=[],r=Math.PI/e,a=[[.62,0,0],[.62,.4,0],[.4,.7,r],[.08,1,0],[-.22,.88,r],[-.72,.42,0],[-1.08,0,0]],o=[];for(let[n,r,i]of a)if(o.push(t.length/3),r===0)t.push(0,n,0);else for(let a=0;a<e;a++){let o=a/e*Math.PI*2+i;t.push(Math.cos(o)*r,n,Math.sin(o)*r)}for(let t=0;t<a.length-1;t++){let[,r]=a[t],[,i]=a[t+1],s=o[t],c=o[t+1];if(r===0&&i>0)for(let t=0;t<e;t++){let r=(t+1)%e;n.push(s,c+t,c+r)}else if(r>0&&i===0)for(let t=0;t<e;t++){let r=(t+1)%e;n.push(s+t,s+r,c)}else for(let t=0;t<e;t++){let r=(t+1)%e;n.push(s+t,s+r,c+t),n.push(s+r,c+r,c+t)}}let s=new m;return s.setAttribute(`position`,new i(t,3)),s.setIndex(n),s}_addLights(){let e=new o(ve,me);e.position.set(3.5,4,3.2),this.scene.add(e),this._lights.push(e);let t=new o(ye,he);t.position.set(-4,1,-2),this.scene.add(t),this._lights.push(t);let n=new o(be,ge);n.position.set(0,-3,-4),this.scene.add(n),this._lights.push(n);let r=new re(1185830,.35);this.scene.add(r),this._lights.push(r)}_bindScroll(){this.lenis&&typeof this.lenis.on==`function`?(this.lenis.on(`scroll`,this._onLenisScroll),this._lenisScrollBound=!0):window.addEventListener(`scroll`,this._onNativeScroll,{passive:!0})}_onLenisScroll({scroll:e,limit:t}){this._scrollT=t>0?Math.min(e/t,1):0}_onNativeScroll(){let e=document.documentElement.scrollHeight-window.innerHeight;this._scrollT=e>0?Math.min(window.scrollY/e,1):0}_bindResize(){window.addEventListener(`resize`,this._onResize)}_onResize(){let e=window.innerWidth,t=window.innerHeight;if(this.camera&&(this.camera.aspect=e/t,this.camera.updateProjectionMatrix()),this.renderer&&this.renderer.setSize(e,t),this._composer&&this._composer.setSize(e,t),this._bloom&&this._bloom.setSize(e,t),this._fluidTargetA&&this._fluidTargetB&&this._displayTarget){let n=Math.max(2,Math.floor(e*A)),r=Math.max(2,Math.floor(t*A));this._fluidTargetA.setSize(n,r),this._fluidTargetB.setSize(n,r),this._displayTarget.setSize(n,r),this._fluidMat.uniforms.iResolution.value.set(n,r),this._displayMat.uniforms.iResolution.value.set(n,r),this._fluidFrame=0}this._isMobile=e<768||`ontouchstart`in window}_observeBlocks(){this._observer=new IntersectionObserver(e=>{e.forEach(e=>{if(!e.isIntersecting||e.target.classList.contains(`is-revealed`))return;e.target.classList.add(`is-revealed`);let t=e.target.dataset.final===`true`?e.target.querySelector(`.holm-philosophy__cta`):null;if(this._reducedMotion){e.target.classList.add(`is-in`),t&&h.set(t,{opacity:1});return}let n=e.target.querySelectorAll(`.holm-philosophy__char`);if(h.to(n,{yPercent:0,opacity:1,duration:.85,stagger:.018,ease:`power3.out`}),t){let e=n.length*.018+.15;h.fromTo(t,{opacity:0,scale:.85},{opacity:1,scale:1,duration:.9,delay:e,ease:`power3.out`})}})},{threshold:.35,rootMargin:`0px 0px -8% 0px`}),this.blocks.forEach(e=>this._observer.observe(e))}_bindCtaMagnetic(){if(this._reducedMotion)return;let e=this.container.querySelector(`.holm-philosophy__cta`);e&&(this._ctaEl=e,h.set(e,{opacity:0,x:0,y:0}),this._ctaSetX=h.quickTo(e,`x`,{duration:.55,ease:`power3`}),this._ctaSetY=h.quickTo(e,`y`,{duration:.55,ease:`power3`}),this._ctaMove=t=>{let n=e.getBoundingClientRect(),r=n.left+n.width/2,i=n.top+n.height/2,a=t.clientX-r,o=t.clientY-i,s=Math.hypot(a,o),c=n.width*1.35;if(s>c){this._ctaSetX(0),this._ctaSetY(0),e.classList.remove(`is-magnetic`);return}let l=(1-s/c)*.4;this._ctaSetX(a*l),this._ctaSetY(o*l),e.classList.add(`is-magnetic`)},this._ctaLeave=()=>{this._ctaSetX(0),this._ctaSetY(0),e.classList.remove(`is-magnetic`)},window.addEventListener(`mousemove`,this._ctaMove,{passive:!0}),window.addEventListener(`mouseleave`,this._ctaLeave))}_computeBeatTarget(){if(!this._beatEls||this._beatEls.length===0)return{x:0,y:0,scale:1};let e=window.innerHeight,t=e/2,n=e*_e,r=0,i=0,a=0,o=0;for(let{el:e,beat:s}of this._beatEls){let c=e.getBoundingClientRect(),l=c.top+c.height/2,u=Math.abs(l-t),d=Math.max(0,1-u/n),f=d*d*(3-2*d);r+=f,i+=s.x*f,a+=s.y*f,o+=s.scale*f}if(r<.001){let e=0,n=1/0;this._beatEls.forEach(({el:r},i)=>{let a=r.getBoundingClientRect(),o=a.top+a.height/2,s=Math.abs(o-t);s<n&&(n=s,e=i)});let r=this._beatEls[e].beat;return{x:r.x,y:r.y,scale:r.scale}}return{x:i/r,y:a/r,scale:o/r}}_startLoop(){this._active=!0,this._prevTime=performance.now();let e=t=>{if(!this._active)return;let n=(t-this._prevTime)/1e3,r=Math.min(n,.05);this._prevTime=t,this._idleSpin+=D*r;let i=this._reducedMotion?{x:0,y:0,scale:1.2}:this._computeBeatTarget(),a=this.camera.fov*Math.PI/360,o=Math.tan(a)*G,s=o*this.camera.aspect,c=this._isMobile?i.x*.2:i.x,l=i.y;this._targetPos.set(c*s,l*o,0);let u=1-(1-O)**(r*60);this.diamond.position.lerp(this._targetPos,u);let d=this.diamond.scale.x+(i.scale-this.diamond.scale.x)*u;if(this.diamond.scale.setScalar(d),this._heroPlane){let e=Math.max(0,1-this._scrollT*4),t=e*e*(3-2*e),n=this._heroPlane.material.uniforms;if(n.uOpacity.value=t,n.uTime.value=this._elapsed,this._heroPlane.visible=t>.005,this._heroPlane.visible&&this._pointerActive){this._heroRaycaster.setFromCamera(this._mouseNdc,this.camera);let e=this._heroRaycaster.ray.intersectPlane(this._heroPlaneMath,this._heroHitPoint);if(e){let{w:r,h:i}=this._heroPlaneSize,a=(e.x+r*.5)/r,o=1-(e.y+i*.5)/i;n.uMouseUv.value.set(a,o),n.uCursorFocus.value=t}}else n.uCursorFocus.value=0}let f=this._reducedMotion?-.18:-.18+Math.sin(this._scrollT*Math.PI)*k;this.diamond.rotation.y=this._idleSpin,this.diamond.rotation.x=f,this._elapsed+=r,this._stepFluid(this._elapsed),this._composer.render(),this._rafId=requestAnimationFrame(e)};this._rafId=requestAnimationFrame(e)}},X=new p(window.innerWidth<768||`ontouchstart`in window?{smoothTouch:!1,touchMultiplier:.75}:{duration:1.6,smoothWheel:!0,wheelMultiplier:.55,touchMultiplier:1.2,smoothTouch:!1});h.ticker.lagSmoothing(0);function Z(e){X.raf(e),requestAnimationFrame(Z)}requestAnimationFrame(Z);var Q=new te({lenis:X});Q.mount();var $=new we({lenis:X});$.init(),se(document),x(),window.addEventListener(`load`,()=>{setTimeout(ie,200)}),window.addEventListener(`pagehide`,()=>{$.destroy(),Q.destroy?.(),X.destroy?.()});