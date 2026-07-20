import{C as e,Dt as t,Gt as n,I as r,Kt as i,Lt as a,O as o,Ot as s,S as c,U as l,Ut as u,Xt as d,an as f,f as p,ft as m,g as ee,h as te,i as h,kt as g,ln as _,mt as v,n as y,o as ne,on as b,p as re,pt as x,r as ie,rn as S,rt as C,s as ae,sn as oe,t as se,un as ce,vt as le,w as ue,z as w,zt as T}from"./pageTransition-C0HGeNYr.js";import{t as E}from"./UnrealBloomPass-2Mdzaglg.js";import{n as D,t as O}from"./holm new logo-BKQBWpbP.js";var k=.16,A=.09,j=.18,M=typeof window<`u`&&(window.innerWidth<768||`ontouchstart`in window)?.42:.5,N=22,P=.3,F=.985,I=.9,L=.92,R=1.6,z=.72,B=1.4,V=`#08050a`,H=`#0a1230`,de=`#0e1e58`,fe=`#1a44cc`,U=`
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`,pe=`
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
    for (int i = 0; i < FLUID_ITER; i++) {
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
`,me=`
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
`;function W(e){return new b(parseInt(e.slice(1,3),16)/255,parseInt(e.slice(3,5),16)/255,parseInt(e.slice(5,7),16)/255)}var G=5.6,he=4.4,ge=.95,_e=.75,K=[{x:0,y:0,scale:1.2,side:null,hasText:!1},{x:.34,y:.03,scale:1,side:`left`,hasText:!0},{x:-.34,y:-.05,scale:1.24,side:`right`,hasText:!0},{x:0,y:.08,scale:.62,side:`left`,hasText:!0},{x:-.3,y:.06,scale:1.18,side:`right`,hasText:!0},{x:.28,y:-.04,scale:1.28,side:`left`,hasText:!0},{x:0,y:.02,scale:1.35,side:`center-below`,hasText:!0}],ve=1,ye=16773852,be=9023716,xe=12108014,Se=.012,q=1.05;`${Se.toFixed(4)}${q.toFixed(4)}${q.toFixed(4)}${.35.toFixed(4)}${320 .toFixed(1)}`;var J=[[`Some studios tell stories.`,`We work toward a single moment.`],[`The moment a rough idea holds still —`,`and becomes something finished.`],[`It is rare. It forms under pressure.`,`The way carbon becomes a diamond.`],[`So that is the shape we keep returning to.`,`Not decoration. A reminder of what we are after.`],[`Between sketch and masterpiece,`,`there is patience.`],[`Ready to create your moment.`]];function Ce(e){return e.split(` `).map(e=>e?`<span class="holm-philosophy__word">${Array.from(e).map(e=>`<span class="holm-philosophy__char">${e.replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`)}</span>`).join(``)}</span>`:``).join(` `)}var Y=`Let's talk`,we=`/contact/`,Te=class h{constructor({lenis:e}={}){this.lenis=e||null,this._reducedMotion=window.matchMedia(`(prefers-reduced-motion: reduce)`).matches,this._isMobile=window.innerWidth<768||`ontouchstart`in window,this.renderer=null,this.scene=null,this.camera=null,this.diamond=null,this.envMap=null,this._lights=[],this._heroPlane=null,this.container=null,this.canvas=null,this.blocks=[],this._rafId=null,this._active=!1,this._prevTime=0,this._scrollT=0,this._idleSpin=0,this._ctaEl=null,this._ctaMove=null,this._ctaLeave=null,this._ctaSetX=null,this._ctaSetY=null,this._ctaInnerSetX=null,this._ctaInnerSetY=null,this._targetPos=new b,this._targetScale=new b(1,1,1),this._targetTilt=0,this._pressure=0,this._mouseNdc=new f(-99,-99),this._mouseWorld=new b,this._mouseWorldSmooth=new b(999,999,999),this._invMat=new m,this._pointerActive=!1,this._elapsed=0,this._fluidQuadCam=null,this._fluidQuadScene=null,this._fluidQuadMesh=null,this._fluidMat=null,this._displayMat=null,this._fluidTargetA=null,this._fluidTargetB=null,this._displayTarget=null,this._fluidFrame=0,this._mousePx=new f(0,0),this._prevMousePx=new f(0,0),this._lastMouseMoveMs=0,this._onResize=this._onResize.bind(this),this._onLenisScroll=this._onLenisScroll.bind(this),this._onNativeScroll=this._onNativeScroll.bind(this),this._onPointerMove=this._onPointerMove.bind(this),this._observer=null}init(){this._createDOM(),this._createThree(),this._bindScroll(),this._bindResize(),this._bindPointer(),this._observeBlocks(),this._bindCtaMagnetic(),this._startLoop()}_bindPointer(){window.addEventListener(`pointermove`,this._onPointerMove,{passive:!0})}_onPointerMove(e){if(this._mouseNdc.set(e.clientX/window.innerWidth*2-1,-(e.clientY/window.innerHeight*2-1)),this._pointerActive=!0,this._fluidMat){window.innerWidth;let t=window.innerHeight,n=e.clientX*M,r=(t-e.clientY)*M;this._prevMousePx.copy(this._mousePx),this._mousePx.set(n,r),this._lastMouseMoveMs=performance.now(),this._fluidMat.uniforms.iMouse.value.set(this._mousePx.x,this._mousePx.y,this._prevMousePx.x,this._prevMousePx.y)}}destroy(){this._active=!1,this._rafId&&cancelAnimationFrame(this._rafId),window.removeEventListener(`resize`,this._onResize),window.removeEventListener(`pointermove`,this._onPointerMove),this.lenis&&this._lenisScrollBound?this.lenis.off(`scroll`,this._onLenisScroll):window.removeEventListener(`scroll`,this._onNativeScroll),this._observer&&this._observer.disconnect(),this._ctaMove&&window.removeEventListener(`mousemove`,this._ctaMove),this._ctaLeave&&window.removeEventListener(`mouseleave`,this._ctaLeave),this.diamond&&this.diamond.material.dispose(),this._heroPlane&&(this._heroPlane.geometry.dispose(),this._heroPlane.material.uniforms?.uTextMap?.value?.dispose(),this._heroPlane.material.dispose()),this._causticPlane&&(this._causticPlane.geometry.dispose(),this._causticPlane.material.dispose()),this.envMap&&this.envMap.dispose();for(let e of this._lights)this.scene?.remove(e);this._fluidTargetA?.dispose(),this._fluidTargetB?.dispose(),this._displayTarget?.dispose(),this._fluidMat?.dispose(),this._displayMat?.dispose(),this._fluidQuadMesh?.geometry?.dispose(),this.renderer&&(this.renderer.dispose(),this.renderer.forceContextLoss?.()),this.container?.parentNode&&this.container.parentNode.removeChild(this.container),this.renderer=this.scene=this.camera=null,this.diamond=this.envMap=null,this.container=this.canvas=null}_createDOM(){let e=document.createElement(`div`);e.className=`holm-philosophy`,this._reducedMotion&&e.classList.add(`is-reduced-motion`);let t=0;if(e.innerHTML=`
      <canvas class="holm-philosophy__canvas" aria-hidden="true"></canvas>

      <a class="holm-philosophy__brand" href="/" aria-label="HOLM — home">
        <img src="${O}" alt="HOLM" />
      </a>

      <section class="holm-philosophy__intro" data-beat="0" aria-hidden="true"></section>

      <main id="philosophy-content"
            class="holm-philosophy__beats"
            tabindex="-1"
            aria-label="HOLM philosophy — six-part manifesto">
        ${K.map((e,n)=>{if(!e.hasText)return``;let r=J[t],i=t===J.length-1;t++;let a=r.map(e=>`
          <div class="holm-philosophy__line">${Ce(e)}</div>
        `).join(``),o=i?`
          <a class="holm-philosophy__cta"
             href="${we}"
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
    `,document.body.appendChild(e),this.container=e,this.canvas=e.querySelector(`.holm-philosophy__canvas`),this.blocks=[...e.querySelectorAll(`.holm-philosophy__beat`)],this._beatEls=[],e.querySelectorAll(`[data-beat]`).forEach(e=>{let t=parseInt(e.dataset.beat,10);Number.isFinite(t)&&K[t]&&this._beatEls.push({el:e,beat:K[t]})}),!this._reducedMotion){let t=e.querySelectorAll(`.holm-philosophy__char`);p.set(t,{yPercent:115,opacity:0})}}_createThree(){this.renderer=new te({canvas:this.canvas,antialias:!0,alpha:!1,powerPreference:`high-performance`}),this.renderer.setPixelRatio(Math.min(window.devicePixelRatio,this._isMobile?1:2)),this.renderer.setSize(window.innerWidth,window.innerHeight),this.renderer.toneMapping=4,this.renderer.toneMappingExposure=.75,this.renderer.outputColorSpace=u,this.scene=new n,this._initFluid(),this.scene.background=this._displayTarget.texture,this.camera=new t(36,window.innerWidth/window.innerHeight,.1,100),this.camera.position.set(0,0,G),this.camera.lookAt(0,0,0);let e=new re(this.renderer),r=this._buildStudioEnvScene();this.envMap=e.fromScene(r,.02).texture,r.traverse(e=>{e.geometry&&e.geometry.dispose(),e.material&&e.material.dispose()}),e.dispose(),this.scene.environment=this.envMap,this.scene.environmentIntensity=1.5,this._composer=new ae(this.renderer),this._composer.setPixelRatio(this.renderer.getPixelRatio()),this._composer.setSize(window.innerWidth,window.innerHeight),this._composer.addPass(new ne(this.scene,this.camera)),this._isMobile||(this._bloom=new E(new f(window.innerWidth,window.innerHeight),.18,.22,.92),this._composer.addPass(this._bloom)),this._composer.addPass(new D),this._isMobile||this._createCausticPlane(),this._createDiamond(),this._isMobile||this._createHeroPlane(),this._addLights()}_buildStudioEnvScene(){let e=new n,t=new d(30,24,12),r=new i({side:1,vertexShader:`
        varying vec3 vP;
        void main() {
          vP = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,fragmentShader:`
        varying vec3 vP;
        void main() {
          vec3 d = normalize(vP);
          float t = d.y * 0.5 + 0.5;
          // Neutral dark ambient — bright enough that facets never fall
          // to pure black between hot spots, dim enough that the light
          // sources still dominate. This is what stops the gem from
          // reading matte.
          vec3 top = vec3(0.05, 0.055, 0.070);
          vec3 bot = vec3(0.010, 0.010, 0.014);
          gl_FragColor = vec4(mix(bot, top, t), 1.0);
        }
      `});e.add(new x(t,r));let a=(t,n,r,i,a,o)=>{let s=new d(o,12,8),c=new v({color:i});c.color.multiplyScalar(a);let l=new x(s,c);l.position.set(t,n,r),e.add(l)};return a(7,6,5,16777215,45,.85),a(-6,3,4,16185599,24,1.2),a(0,6,-7,16777215,30,.9),a(5,-2,4,16767136,14,.45),a(-6,-1,3,11061503,14,.45),a(-11,1,0,16777215,65,.2),a(11,1,0,16777215,65,.2),a(0,-3,9,16777215,40,.3),e}_createCausticPlane(){let e=new x(new g(5,5,1,1),new i({transparent:!0,depthWrite:!1,blending:2,uniforms:{uTime:{value:0},uIntensity:{value:.55}},vertexShader:`
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,fragmentShader:`
        uniform float uTime;
        uniform float uIntensity;
        varying vec2  vUv;

        // Caustic pattern — classic domain-warped noise (public-domain
        // technique commonly attributed to David Hoskins). Cheap: 4 iters.
        float caustic(vec2 uv, float t) {
          vec2 p = mod(uv * 6.28318 - 250.0, 6.28318) - 250.0;
          vec2 i = p;
          float c    = 1.0;
          float inten = 0.006;
          for (int n = 0; n < 4; n++) {
            float ti = t + float(n) * 0.42;
            i = p + vec2(cos(ti - i.x) + sin(ti + i.y),
                         sin(ti - i.y) + cos(ti + i.x));
            c += 1.0 / length(vec2(p.x / (sin(i.x + ti) / inten),
                                   p.y / (cos(i.y + ti) / inten)));
          }
          c /= 4.0;
          c  = 1.17 - pow(c, 1.4);
          return pow(abs(c), 7.0);
        }

        void main() {
          vec2  uv     = vUv - 0.5;
          float r      = length(uv);
          // Radial mask — bright right around the gem, gone by the edges
          float halo   = smoothstep(0.5, 0.03, r);
          float caus   = caustic(uv * 0.9, uTime * 0.16);
          // Cool blue that echoes the fluid backdrop palette
          vec3  tint   = vec3(0.38, 0.60, 1.00);
          float energy = caus * halo * uIntensity;
          gl_FragColor = vec4(tint * energy, energy * 0.75);
        }
      `}));e.position.z=-1.2,e.renderOrder=-1,this._causticPlane=e,this.scene.add(e)}_createHeroPlane(){let e=document.createElement(`canvas`);e.width=2560,e.height=640;let t=e.getContext(`2d`);t.fillStyle=`rgba(255, 255, 255, 1.0)`,t.font=`italic 300 480px 'Fraunces', 'Times New Roman', serif`,t.textAlign=`center`,t.textBaseline=`middle`,t.fillText(`philosophy`,e.width/2,e.height/2+30);let n=new ue(e);n.colorSpace=u,n.minFilter=C,n.magFilter=C,n.anisotropy=this.renderer.capabilities.getMaxAnisotropy();let r=new i({vertexShader:`
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
      `,uniforms:{uTextMap:{value:n},uFluidMap:{value:this._displayTarget.texture},uTime:{value:0},uMouseUv:{value:new f(-2,-2)},uCursorFocus:{value:0},uOpacity:{value:1}},transparent:!0,depthWrite:!1}),a=G- -8,o=this.camera.fov*Math.PI/360,c=Math.tan(o)*a*this.camera.aspect,l=Math.max(c*2*1.15,20),d=l/(e.width/e.height),p=this._isMobile?[32,8]:[96,24],m=new g(l,d,p[0],p[1]);this._heroPlane=new x(m,r),this._heroPlane.position.z=-8,this._heroPlane.renderOrder=-1,this._heroPlaneSize={w:l,h:d,z:-8},this._heroPlaneMath=new s(new b(0,0,1),8),this._heroRaycaster=new T,this._heroHitPoint=new b,this.scene.add(this._heroPlane)}_initFluid(){let t=Math.max(2,Math.floor(window.innerWidth*M)),r=Math.max(2,Math.floor(window.innerHeight*M)),o={minFilter:C,magFilter:C,format:a,type:l,depthBuffer:!1,stencilBuffer:!1};this._fluidTargetA=new _(t,r,o),this._fluidTargetB=new _(t,r,o),this._displayTarget=new _(t,r,{...o,type:S}),this._fluidCurrent=this._fluidTargetA,this._fluidPrev=this._fluidTargetB,this._fluidMat=new i({vertexShader:U,fragmentShader:pe,defines:{FLUID_ITER:this._isMobile?4:8},uniforms:{iTime:{value:0},iResolution:{value:new f(t,r)},iMouse:{value:new oe(0,0,0,0)},iFrame:{value:0},iPreviousFrame:{value:null},uBrushSize:{value:N},uBrushStrength:{value:P},uFluidDecay:{value:F},uTrailLength:{value:I},uStopDecay:{value:L}}}),this._displayMat=new i({vertexShader:U,fragmentShader:me,uniforms:{iTime:{value:0},iResolution:{value:new f(t,r)},iFluid:{value:null},uDistortionAmount:{value:R},uColor1:{value:W(V)},uColor2:{value:W(H)},uColor3:{value:W(de)},uColor4:{value:W(fe)},uColorIntensity:{value:z},uSoftness:{value:B}}}),this._fluidQuadCam=new e,this._fluidQuadScene=new n,this._fluidQuadMesh=new x(new g(2,2),this._fluidMat),this._fluidQuadScene.add(this._fluidQuadMesh),this._displayTarget.texture.colorSpace=u}_stepFluid(e){if(!this._fluidMat)return;if(this._isMobile&&(this._fluidFrame&1)==1){this._fluidFrame++;return}performance.now()-this._lastMouseMoveMs>100&&this._fluidMat.uniforms.iMouse.value.set(0,0,0,0),this._fluidMat.uniforms.iTime.value=e,this._fluidMat.uniforms.iFrame.value=this._fluidFrame,this._fluidMat.uniforms.iPreviousFrame.value=this._fluidPrev.texture,this._fluidQuadMesh.material=this._fluidMat,this.renderer.setRenderTarget(this._fluidCurrent),this.renderer.clear(),this.renderer.render(this._fluidQuadScene,this._fluidQuadCam),this._displayMat.uniforms.iTime.value=e,this._displayMat.uniforms.iFluid.value=this._fluidCurrent.texture,this._fluidQuadMesh.material=this._displayMat,this.renderer.setRenderTarget(this._displayTarget),this.renderer.clear(),this.renderer.render(this._fluidQuadScene,this._fluidQuadCam),this.renderer.setRenderTarget(null);let t=this._fluidCurrent;this._fluidCurrent=this._fluidPrev,this._fluidPrev=t,this._fluidFrame++}_createDiamond(){let e=this._isMobile?12:16,t=h._getBrilliantGeometry(e),n=this._isMobile,r=new le({color:16777215,metalness:0,roughness:n?.02:0,transmission:1,thickness:n?1:2.5,ior:2.417,attenuationDistance:12,attenuationColor:new o(16777215),envMapIntensity:n?1.5:2.8,iridescence:n?0:.25,iridescenceIOR:1.55,iridescenceThicknessRange:[400,900],clearcoat:+!n,clearcoatRoughness:0,transparent:!0,side:0});!n&&`dispersion`in r&&(r.dispersion=6.5),n||(r.userData.uEdgeTime={value:0},r.onBeforeCompile=e=>{e.uniforms.uEdgeTime=r.userData.uEdgeTime,e.vertexShader=e.vertexShader.replace(`#include <common>`,`#include <common>
             varying vec3 vEdgeNormal;
             varying vec3 vEdgeViewPos;`).replace(`#include <project_vertex>`,`#include <project_vertex>
             vEdgeNormal  = normalize(normalMatrix * normal);
             vEdgeViewPos = -mvPosition.xyz;`),e.fragmentShader=e.fragmentShader.replace(`#include <common>`,`#include <common>
             uniform float uEdgeTime;
             varying vec3 vEdgeNormal;
             varying vec3 vEdgeViewPos;`).replace(`#include <output_fragment>`,`#include <output_fragment>
             {
               vec3 N = normalize(vEdgeNormal);
               vec3 V = normalize(vEdgeViewPos);
               float f = pow(1.0 - abs(dot(N, V)), 3.0);
               float hue = f * 8.0 + uEdgeTime * 0.6;
               vec3 rainbow = vec3(
                 sin(hue           ) * 0.5 + 0.5,
                 sin(hue + 2.0944  ) * 0.5 + 0.5,
                 sin(hue + 4.18879 ) * 0.5 + 0.5
               );
               gl_FragColor.rgb += rainbow * f * 0.28;
             }`)}),this.diamond=new x(t,r),this.diamond.rotation.x=-.18,this.scene.add(this.diamond)}static _getBrilliantGeometry(e){h._geomCache||=new Map;let t=h._geomCache.get(e);if(t)return t;let n=Math.PI/e,r=[[.62,0,0],[.62,.4,0],[.4,.7,n],[.08,1,0],[-.22,.88,n],[-.72,.42,0],[-1.08,0,0]],i=r.map(([t,n,r])=>{if(n===0)return[[0,t,0]];let i=[];for(let a=0;a<e;a++){let o=a/e*Math.PI*2+r;i.push([Math.cos(o)*n,t,Math.sin(o)*n])}return i}),a=[],o=[],s=(e,t,n)=>{let r=a.length/3;a.push(e[0],e[1],e[2],t[0],t[1],t[2],n[0],n[1],n[2]),o.push(r,r+1,r+2)};for(let t=0;t<r.length-1;t++){let n=i[t],r=i[t+1];if(n.length===1&&r.length>1){let t=n[0];for(let n=0;n<e;n++){let i=(n+1)%e;s(t,r[n],r[i])}}else if(n.length>1&&r.length===1){let t=r[0];for(let r=0;r<e;r++){let i=(r+1)%e;s(n[r],n[i],t)}}else for(let t=0;t<e;t++){let i=(t+1)%e;s(n[t],n[i],r[t]),s(n[i],r[i],r[t])}}return t=new c,t.setAttribute(`position`,new w(a,3)),t.setIndex(o),t.scale(.92,1.06,.92),t.computeVertexNormals(),h._geomCache.set(e,t),t}_addLights(){let e=new r(ye,he);e.position.set(3.5,4,3.2),this.scene.add(e),this._lights.push(e);let t=new r(be,ge);t.position.set(-4,1,-2),this.scene.add(t),this._lights.push(t);let n=new r(xe,_e);n.position.set(0,-3,-4),this.scene.add(n),this._lights.push(n);let i=new ee(1185830,.35);this.scene.add(i),this._lights.push(i)}_bindScroll(){this.lenis&&typeof this.lenis.on==`function`?(this.lenis.on(`scroll`,this._onLenisScroll),this._lenisScrollBound=!0):window.addEventListener(`scroll`,this._onNativeScroll,{passive:!0})}_onLenisScroll({scroll:e,limit:t}){this._scrollT=t>0?Math.min(e/t,1):0}_onNativeScroll(){let e=document.documentElement.scrollHeight-window.innerHeight;this._scrollT=e>0?Math.min(window.scrollY/e,1):0}_bindResize(){window.addEventListener(`resize`,this._onResize)}_onResize(){let e=window.innerWidth,t=window.innerHeight;if(this.camera&&(this.camera.aspect=e/t,this.camera.updateProjectionMatrix()),this.renderer&&this.renderer.setSize(e,t),this._composer&&this._composer.setSize(e,t),this._bloom&&this._bloom.setSize(e,t),this._fluidTargetA&&this._fluidTargetB&&this._displayTarget){let n=Math.max(2,Math.floor(e*M)),r=Math.max(2,Math.floor(t*M));this._fluidTargetA.setSize(n,r),this._fluidTargetB.setSize(n,r),this._displayTarget.setSize(n,r),this._fluidMat.uniforms.iResolution.value.set(n,r),this._displayMat.uniforms.iResolution.value.set(n,r),this._fluidFrame=0}this._isMobile=e<768||`ontouchstart`in window}_observeBlocks(){this._observer=new IntersectionObserver(e=>{e.forEach(e=>{if(!e.isIntersecting||e.target.classList.contains(`is-revealed`))return;e.target.classList.add(`is-revealed`);let t=e.target.dataset.final===`true`?e.target.querySelector(`.holm-philosophy__cta`):null;if(this._reducedMotion){e.target.classList.add(`is-in`),t&&p.set(t,{opacity:1});return}let n=e.target.querySelectorAll(`.holm-philosophy__char`);if(p.to(n,{yPercent:0,opacity:1,duration:.85,stagger:.018,ease:`power3.out`}),t){let e=n.length*.018+.15;p.fromTo(t,{opacity:0,scale:.85},{opacity:1,scale:1,duration:.9,delay:e,ease:`power3.out`})}})},{threshold:.35,rootMargin:`0px 0px -8% 0px`}),this.blocks.forEach(e=>this._observer.observe(e))}_bindCtaMagnetic(){if(this._reducedMotion)return;let e=this.container.querySelector(`.holm-philosophy__cta`);e&&(this._ctaEl=e,p.set(e,{opacity:0,x:0,y:0}),this._ctaSetX=p.quickTo(e,`x`,{duration:.55,ease:`power3`}),this._ctaSetY=p.quickTo(e,`y`,{duration:.55,ease:`power3`}),this._ctaMove=t=>{let n=e.getBoundingClientRect(),r=n.left+n.width/2,i=n.top+n.height/2,a=t.clientX-r,o=t.clientY-i,s=Math.hypot(a,o),c=n.width*1.35;if(s>c){this._ctaSetX(0),this._ctaSetY(0),e.classList.remove(`is-magnetic`);return}let l=(1-s/c)*.4;this._ctaSetX(a*l),this._ctaSetY(o*l),e.classList.add(`is-magnetic`)},this._ctaLeave=()=>{this._ctaSetX(0),this._ctaSetY(0),e.classList.remove(`is-magnetic`)},window.addEventListener(`mousemove`,this._ctaMove,{passive:!0}),window.addEventListener(`mouseleave`,this._ctaLeave))}_computeBeatTarget(){if(!this._beatEls||this._beatEls.length===0)return{x:0,y:0,scale:1};let e=window.innerHeight,t=e/2,n=e*ve,r=0,i=0,a=0,o=0;for(let{el:e,beat:s}of this._beatEls){let c=e.getBoundingClientRect(),l=c.top+c.height/2,u=Math.abs(l-t),d=Math.max(0,1-u/n),f=d*d*(3-2*d);r+=f,i+=s.x*f,a+=s.y*f,o+=s.scale*f}if(r<.001){let e=0,n=1/0;this._beatEls.forEach(({el:r},i)=>{let a=r.getBoundingClientRect(),o=a.top+a.height/2,s=Math.abs(o-t);s<n&&(n=s,e=i)});let r=this._beatEls[e].beat;return{x:r.x,y:r.y,scale:r.scale}}return{x:i/r,y:a/r,scale:o/r}}_startLoop(){this._active=!0,this._prevTime=performance.now();let e=t=>{if(!this._active)return;let n=(t-this._prevTime)/1e3,r=Math.min(n,.05);this._prevTime=t,this._idleSpin+=k*r;let i=this._reducedMotion?{x:0,y:0,scale:1.2}:this._computeBeatTarget(),a=this.camera.fov*Math.PI/360,o=Math.tan(a)*G,s=o*this.camera.aspect,c=this._isMobile,l=i.x,u=i.y;this._targetPos.set(l*s,u*o,0);let d=1-(1-A)**(r*60);this.diamond.position.lerp(this._targetPos,d);let f=c?i.scale*.42:i.scale,p=this.diamond.scale.x+(f-this.diamond.scale.x)*d;if(this.diamond.scale.setScalar(p),this._causticPlane&&(this._causticPlane.position.x=this.diamond.position.x,this._causticPlane.position.y=this.diamond.position.y,this._causticPlane.scale.setScalar(Math.max(p,.4)*1.35),this._causticPlane.material.uniforms.uTime.value=this._elapsed),this.diamond.material.userData.uEdgeTime&&(this.diamond.material.userData.uEdgeTime.value=this._elapsed),this._heroPlane){let e=Math.max(0,1-this._scrollT*4),t=e*e*(3-2*e),n=this._heroPlane.material.uniforms;if(n.uOpacity.value=t,n.uTime.value=this._elapsed,this._heroPlane.visible=t>.005,this._heroPlane.visible&&this._pointerActive){this._heroRaycaster.setFromCamera(this._mouseNdc,this.camera);let e=this._heroRaycaster.ray.intersectPlane(this._heroPlaneMath,this._heroHitPoint);if(e){let{w:r,h:i}=this._heroPlaneSize,a=(e.x+r*.5)/r,o=1-(e.y+i*.5)/i;n.uMouseUv.value.set(a,o),n.uCursorFocus.value=t}}else n.uCursorFocus.value=0}let m=this._reducedMotion?-.18:-.18+Math.sin(this._scrollT*Math.PI)*j;this.diamond.rotation.y=this._idleSpin,this.diamond.rotation.x=m,this._elapsed+=r,this._stepFluid(this._elapsed),this._composer.render(),this._rafId=requestAnimationFrame(e)};this._rafId=requestAnimationFrame(e)}},X=new ce(window.innerWidth<768||`ontouchstart`in window?{smoothTouch:!1,touchMultiplier:.75}:{duration:1.6,smoothWheel:!0,wheelMultiplier:.55,touchMultiplier:1.2,smoothTouch:!1});p.ticker.lagSmoothing(0);function Z(e){X.raf(e),requestAnimationFrame(Z)}requestAnimationFrame(Z);var Q=new h({lenis:X});Q.mount();var $=new Te({lenis:X});$.init(),ie(document),se(),window.addEventListener(`load`,()=>{setTimeout(y,200)}),window.addEventListener(`pagehide`,()=>{$.destroy(),Q.destroy?.(),X.destroy?.()});