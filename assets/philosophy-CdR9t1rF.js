import{$t as e,Bt as t,Ct as n,E as r,H as i,Jt as a,Lt as o,Mt as s,Nt as c,P as l,Pt as u,Q as d,Qt as f,R as p,St as m,T as h,Tt as ee,Yt as g,Zt as _,_ as te,a as ne,b as v,bt as y,c as b,ct as x,d as S,dt as C,f as re,i as ie,j as w,mt as T,n as ae,nn as oe,p as se,pt as ce,r as le,s as ue,st as de,t as fe,tn as E,u as D,wt as O,x as k,y as A,zt as j}from"./hoverRoll-XqJR0EGf.js";var M=class extends j{constructor(){super(),this.name=`RoomEnvironment`,this.position.y=-3.5;let e=new te;e.deleteAttribute(`uv`);let t=new T({side:1}),n=new T,r=new ee(16777215,900,28,2);r.position.set(.418,16.199,.3),this.add(r);let a=new x(e,t);a.position.set(-.757,13.219,.717),a.scale.set(31.713,28.305,28.591),this.add(a);let o=new i(e,n,6),s=new y;s.position.set(-10.906,2.009,1.846),s.rotation.set(0,-.195,0),s.scale.set(2.328,7.905,4.651),s.updateMatrix(),o.setMatrixAt(0,s.matrix),s.position.set(-5.607,-.754,-.758),s.rotation.set(0,.994,0),s.scale.set(1.97,1.534,3.955),s.updateMatrix(),o.setMatrixAt(1,s.matrix),s.position.set(6.167,.857,7.803),s.rotation.set(0,.561,0),s.scale.set(3.927,6.285,3.687),s.updateMatrix(),o.setMatrixAt(2,s.matrix),s.position.set(-2.017,.018,6.124),s.rotation.set(0,.333,0),s.scale.set(2.002,4.566,2.064),s.updateMatrix(),o.setMatrixAt(3,s.matrix),s.position.set(2.291,-.756,-2.621),s.rotation.set(0,-.286,0),s.scale.set(1.546,1.552,1.496),s.updateMatrix(),o.setMatrixAt(4,s.matrix),s.position.set(-2.193,-.369,-5.547),s.rotation.set(0,.516,0),s.scale.set(3.875,3.487,2.986),s.updateMatrix(),o.setMatrixAt(5,s.matrix),this.add(o);let c=new x(e,N(50));c.position.set(-16.116,14.37,8.208),c.scale.set(.1,2.428,2.739),this.add(c);let l=new x(e,N(50));l.position.set(-16.109,18.021,-8.207),l.scale.set(.1,2.425,2.751),this.add(l);let u=new x(e,N(17));u.position.set(14.904,12.198,-1.832),u.scale.set(.15,4.265,6.331),this.add(u);let d=new x(e,N(43));d.position.set(-.462,8.89,14.52),d.scale.set(4.38,5.441,.088),this.add(d);let f=new x(e,N(20));f.position.set(3.235,11.486,-12.541),f.scale.set(2.5,2,.1),this.add(f);let p=new x(e,N(100));p.position.set(0,20,0),p.scale.set(1,.1,1),this.add(p)}dispose(){let e=new Set;this.traverse(t=>{t.isMesh&&(e.add(t.geometry),e.add(t.material))});for(let t of e)t.dispose()}};function N(e){return new C({color:0,emissive:16777215,emissiveIntensity:e})}var P={name:`OutputShader`,uniforms:{tDiffuse:{value:null},toneMappingExposure:{value:1}},vertexShader:`
		precision highp float;

		uniform mat4 modelViewMatrix;
		uniform mat4 projectionMatrix;

		attribute vec3 position;
		attribute vec2 uv;

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		precision highp float;

		uniform sampler2D tDiffuse;

		#include <tonemapping_pars_fragment>
		#include <colorspace_pars_fragment>

		varying vec2 vUv;

		void main() {

			gl_FragColor = texture2D( tDiffuse, vUv );

			// tone mapping

			#ifdef LINEAR_TONE_MAPPING

				gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );

			#elif defined( REINHARD_TONE_MAPPING )

				gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );

			#elif defined( CINEON_TONE_MAPPING )

				gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );

			#elif defined( ACES_FILMIC_TONE_MAPPING )

				gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );

			#elif defined( AGX_TONE_MAPPING )

				gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );

			#elif defined( NEUTRAL_TONE_MAPPING )

				gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );

			#elif defined( CUSTOM_TONE_MAPPING )

				gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );

			#endif

			// color space

			#ifdef SRGB_TRANSFER

				gl_FragColor = sRGBTransferOETF( gl_FragColor );

			#endif

		}`},F=class extends b{constructor(){super(),this.isOutputPass=!0,this.uniforms=a.clone(P.uniforms),this.material=new c({name:P.name,uniforms:this.uniforms,vertexShader:P.vertexShader,fragmentShader:P.fragmentShader}),this._fsQuad=new ue(this.material),this._outputColorSpace=null,this._toneMapping=null}render(e,t,n){this.uniforms.tDiffuse.value=n.texture,this.uniforms.toneMappingExposure.value=e.toneMappingExposure,(this._outputColorSpace!==e.outputColorSpace||this._toneMapping!==e.toneMapping)&&(this._outputColorSpace=e.outputColorSpace,this._toneMapping=e.toneMapping,this.material.defines={},r.getTransfer(this._outputColorSpace)===`srgb`&&(this.material.defines.SRGB_TRANSFER=``),this._toneMapping===1?this.material.defines.LINEAR_TONE_MAPPING=``:this._toneMapping===2?this.material.defines.REINHARD_TONE_MAPPING=``:this._toneMapping===3?this.material.defines.CINEON_TONE_MAPPING=``:this._toneMapping===4?this.material.defines.ACES_FILMIC_TONE_MAPPING=``:this._toneMapping===6?this.material.defines.AGX_TONE_MAPPING=``:this._toneMapping===7?this.material.defines.NEUTRAL_TONE_MAPPING=``:this._toneMapping===5&&(this.material.defines.CUSTOM_TONE_MAPPING=``),this.material.needsUpdate=!0),this.renderToScreen===!0?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this._fsQuad.render(e))}dispose(){this.material.dispose(),this._fsQuad.dispose()}},I=.16,L=.09,R=.18,z=.5,B=22,V=.3,pe=.985,me=.9,he=.92,ge=1.6,_e=.72,ve=1.4,ye=`#000000`,be=`#02040c`,xe=`#06183a`,Se=`#123063`,H=`
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`,Ce=`
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
`,we=`
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
`;function U(e){return new f(parseInt(e.slice(1,3),16)/255,parseInt(e.slice(3,5),16)/255,parseInt(e.slice(5,7),16)/255)}var W=5.6,Te=1.85,Ee=4.4,De=.95,Oe=.75,G=[{x:0,y:0,scale:1.2,side:null,hasText:!1},{x:.34,y:.03,scale:1,side:`left`,hasText:!0},{x:-.34,y:-.05,scale:1.24,side:`right`,hasText:!0},{x:0,y:.08,scale:.62,side:`left`,hasText:!0},{x:-.3,y:.06,scale:1.18,side:`right`,hasText:!0},{x:.28,y:-.04,scale:1.28,side:`left`,hasText:!0},{x:0,y:.02,scale:1.35,side:`center-below`,hasText:!0}],ke=1,Ae=16773852,je=9023716,Me=12108014,Ne=.012,K=1.05;`${Ne.toFixed(4)}${K.toFixed(4)}${K.toFixed(4)}${.35.toFixed(4)}${320 .toFixed(1)}`;var q=[[`Some studios tell stories.`,`We work toward a single moment.`],[`The moment a rough idea holds still —`,`and becomes something finished.`],[`It is rare. It forms under pressure.`,`The way carbon becomes a diamond.`],[`So that is the shape we keep returning to.`,`Not decoration. A reminder of what we are after.`],[`Between sketch and masterpiece,`,`there is patience.`],[`Ready to create your moment.`]];function Pe(e){return e.split(` `).map(e=>e?`<span class="holm-philosophy__word">${Array.from(e).map(e=>`<span class="holm-philosophy__char">${e.replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`)}</span>`).join(``)}</span>`:``).join(` `)}var J=`Let's talk`,Y=`/contact/`,Fe=class{constructor({lenis:e}={}){this.lenis=e||null,this._reducedMotion=window.matchMedia(`(prefers-reduced-motion: reduce)`).matches,this._isMobile=window.innerWidth<768||`ontouchstart`in window,this.renderer=null,this.scene=null,this.camera=null,this.diamond=null,this.envMap=null,this._lights=[],this._heroPlane=null,this.container=null,this.canvas=null,this.blocks=[],this._rafId=null,this._active=!1,this._prevTime=0,this._scrollT=0,this._idleSpin=0,this._ctaEl=null,this._ctaMove=null,this._ctaLeave=null,this._ctaSetX=null,this._ctaSetY=null,this._ctaInnerSetX=null,this._ctaInnerSetY=null,this._targetPos=new f,this._targetScale=new f(1,1,1),this._targetTilt=0,this._pressure=0,this._mouseNdc=new _(-99,-99),this._mouseWorld=new f,this._mouseWorldSmooth=new f(999,999,999),this._invMat=new de,this._pointerActive=!1,this._elapsed=0,this._fluidQuadCam=null,this._fluidQuadScene=null,this._fluidQuadMesh=null,this._fluidMat=null,this._displayMat=null,this._fluidTargetA=null,this._fluidTargetB=null,this._displayTarget=null,this._fluidFrame=0,this._mousePx=new _(0,0),this._prevMousePx=new _(0,0),this._lastMouseMoveMs=0,this._onResize=this._onResize.bind(this),this._onLenisScroll=this._onLenisScroll.bind(this),this._onNativeScroll=this._onNativeScroll.bind(this),this._onPointerMove=this._onPointerMove.bind(this),this._observer=null}init(){this._createDOM(),this._createThree(),this._bindScroll(),this._bindResize(),this._bindPointer(),this._observeBlocks(),this._bindCtaMagnetic(),this._startLoop()}_bindPointer(){window.addEventListener(`pointermove`,this._onPointerMove,{passive:!0})}_onPointerMove(e){if(this._mouseNdc.set(e.clientX/window.innerWidth*2-1,-(e.clientY/window.innerHeight*2-1)),this._pointerActive=!0,this._fluidMat){window.innerWidth;let t=window.innerHeight,n=e.clientX*z,r=(t-e.clientY)*z;this._prevMousePx.copy(this._mousePx),this._mousePx.set(n,r),this._lastMouseMoveMs=performance.now(),this._fluidMat.uniforms.iMouse.value.set(this._mousePx.x,this._mousePx.y,this._prevMousePx.x,this._prevMousePx.y)}}destroy(){this._active=!1,this._rafId&&cancelAnimationFrame(this._rafId),window.removeEventListener(`resize`,this._onResize),window.removeEventListener(`pointermove`,this._onPointerMove),this.lenis&&this._lenisScrollBound?this.lenis.off(`scroll`,this._onLenisScroll):window.removeEventListener(`scroll`,this._onNativeScroll),this._observer&&this._observer.disconnect(),this._ctaMove&&window.removeEventListener(`mousemove`,this._ctaMove),this._ctaLeave&&window.removeEventListener(`mouseleave`,this._ctaLeave),this.diamond&&(this.diamond.geometry.dispose(),this.diamond.material.dispose()),this._heroPlane&&(this._heroPlane.geometry.dispose(),this._heroPlane.material.uniforms?.uTextMap?.value?.dispose(),this._heroPlane.material.dispose()),this.envMap&&this.envMap.dispose();for(let e of this._lights)this.scene?.remove(e);this._fluidTargetA?.dispose(),this._fluidTargetB?.dispose(),this._displayTarget?.dispose(),this._fluidMat?.dispose(),this._displayMat?.dispose(),this._fluidQuadMesh?.geometry?.dispose(),this.renderer&&(this.renderer.dispose(),this.renderer.forceContextLoss?.()),this.container?.parentNode&&this.container.parentNode.removeChild(this.container),this.renderer=this.scene=this.camera=null,this.diamond=this.envMap=null,this.container=this.canvas=null}_createDOM(){let e=document.createElement(`div`);e.className=`holm-philosophy`,this._reducedMotion&&e.classList.add(`is-reduced-motion`);let t=0;if(e.innerHTML=`
      <canvas class="holm-philosophy__canvas" aria-hidden="true"></canvas>

      <section class="holm-philosophy__intro" data-beat="0" aria-hidden="true"></section>

      <main class="holm-philosophy__beats">
        ${G.map((e,n)=>{if(!e.hasText)return``;let r=q[t],i=t===q.length-1;t++;let a=r.map(e=>`
          <div class="holm-philosophy__line">${Pe(e)}</div>
        `).join(``),o=i?`
          <a class="holm-philosophy__cta"
             href="${Y}"
             aria-label="${J}"
             data-hover-roll>${J}</a>
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
    `,document.body.appendChild(e),this.container=e,this.canvas=e.querySelector(`.holm-philosophy__canvas`),this.blocks=[...e.querySelectorAll(`.holm-philosophy__beat`)],this._beatEls=[],e.querySelectorAll(`[data-beat]`).forEach(e=>{let t=parseInt(e.dataset.beat,10);Number.isFinite(t)&&G[t]&&this._beatEls.push({el:e,beat:G[t]})}),!this._reducedMotion){let t=e.querySelectorAll(`.holm-philosophy__char`);D.set(t,{yPercent:115,opacity:0})}}_createThree(){this.renderer=new re({canvas:this.canvas,antialias:!0,alpha:!1,powerPreference:`high-performance`}),this.renderer.setPixelRatio(Math.min(window.devicePixelRatio,this._isMobile?1.5:2)),this.renderer.setSize(window.innerWidth,window.innerHeight),this.renderer.toneMapping=4,this.renderer.toneMappingExposure=.55,this.renderer.outputColorSpace=o,this.scene=new j,this._initFluid(),this.scene.background=this._displayTarget.texture,this.camera=new m(36,window.innerWidth/window.innerHeight,.1,100),this.camera.position.set(0,0,W),this.camera.lookAt(0,0,0);let e=new S(this.renderer),t=new M;this.envMap=e.fromScene(t,.04).texture,e.dispose(),this.scene.environment=this.envMap,this.scene.environmentIntensity=Te,this._composer=new ne(this.renderer),this._composer.setPixelRatio(this.renderer.getPixelRatio()),this._composer.setSize(window.innerWidth,window.innerHeight),this._composer.addPass(new ie(this.scene,this.camera)),this._bloom=new le(new _(window.innerWidth,window.innerHeight),.28,.35,.98),this._composer.addPass(this._bloom),this._composer.addPass(new F),this._createDiamond(),this._createHeroPlane(),this._addLights()}_createHeroPlane(){let e=document.createElement(`canvas`);e.width=2560,e.height=640;let r=e.getContext(`2d`);r.fillStyle=`rgba(255, 255, 255, 1.0)`,r.font=`italic 300 480px 'Fraunces', 'Times New Roman', serif`,r.textAlign=`center`,r.textBaseline=`middle`,r.fillText(`philosophy`,e.width/2,e.height/2+30);let i=new k(e);i.colorSpace=o,i.minFilter=d,i.magFilter=d,i.anisotropy=this.renderer.capabilities.getMaxAnisotropy();let a=new t({vertexShader:`
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

          // Pure white watermark; cursor bleeds a whisper of warmth in
          vec3 cool = vec3(1.00, 1.00, 1.00);
          vec3 warm = vec3(1.00, 0.96, 0.90);
          vec3 tint = mix(cool, warm, cursorMask * 0.85);

          vec3 col   = tint * vec3(aR, aG, aB);
          float alpha = max(max(aR, aG), aB);

          alpha *= 0.90 + cursorMask * 0.10;
          alpha *= uOpacity;

          gl_FragColor = vec4(col, alpha);
        }
      `,uniforms:{uTextMap:{value:i},uFluidMap:{value:this._displayTarget.texture},uTime:{value:0},uMouseUv:{value:new _(-2,-2)},uCursorFocus:{value:0},uOpacity:{value:1}},transparent:!0,depthWrite:!1}),s=W- -8,c=this.camera.fov*Math.PI/360,l=Math.tan(c)*s*this.camera.aspect,p=Math.max(l*2*1.15,20),m=p/(e.width/e.height),h=new O(p,m,96,24);this._heroPlane=new x(h,a),this._heroPlane.position.z=-8,this._heroPlane.renderOrder=-1,this._heroPlaneSize={w:p,h:m,z:-8},this._heroPlaneMath=new n(new f(0,0,1),8),this._heroRaycaster=new u,this._heroHitPoint=new f,this.scene.add(this._heroPlane)}_initFluid(){let n=Math.max(2,Math.floor(window.innerWidth*z)),r=Math.max(2,Math.floor(window.innerHeight*z)),i={minFilter:d,magFilter:d,format:s,type:p,depthBuffer:!1,stencilBuffer:!1};this._fluidTargetA=new E(n,r,i),this._fluidTargetB=new E(n,r,i),this._displayTarget=new E(n,r,{...i,type:g}),this._fluidCurrent=this._fluidTargetA,this._fluidPrev=this._fluidTargetB,this._fluidMat=new t({vertexShader:H,fragmentShader:Ce,uniforms:{iTime:{value:0},iResolution:{value:new _(n,r)},iMouse:{value:new e(0,0,0,0)},iFrame:{value:0},iPreviousFrame:{value:null},uBrushSize:{value:B},uBrushStrength:{value:V},uFluidDecay:{value:pe},uTrailLength:{value:me},uStopDecay:{value:he}}}),this._displayMat=new t({vertexShader:H,fragmentShader:we,uniforms:{iTime:{value:0},iResolution:{value:new _(n,r)},iFluid:{value:null},uDistortionAmount:{value:ge},uColor1:{value:U(ye)},uColor2:{value:U(be)},uColor3:{value:U(xe)},uColor4:{value:U(Se)},uColorIntensity:{value:_e},uSoftness:{value:ve}}}),this._fluidQuadCam=new v,this._fluidQuadScene=new j,this._fluidQuadMesh=new x(new O(2,2),this._fluidMat),this._fluidQuadScene.add(this._fluidQuadMesh),this._displayTarget.texture.colorSpace=o}_stepFluid(e){if(!this._fluidMat)return;performance.now()-this._lastMouseMoveMs>100&&this._fluidMat.uniforms.iMouse.value.set(0,0,0,0),this._fluidMat.uniforms.iTime.value=e,this._fluidMat.uniforms.iFrame.value=this._fluidFrame,this._fluidMat.uniforms.iPreviousFrame.value=this._fluidPrev.texture,this._fluidQuadMesh.material=this._fluidMat,this.renderer.setRenderTarget(this._fluidCurrent),this.renderer.clear(),this.renderer.render(this._fluidQuadScene,this._fluidQuadCam),this._displayMat.uniforms.iTime.value=e,this._displayMat.uniforms.iFluid.value=this._fluidCurrent.texture,this._fluidQuadMesh.material=this._displayMat,this.renderer.setRenderTarget(this._displayTarget),this.renderer.clear(),this.renderer.render(this._fluidQuadScene,this._fluidQuadCam),this.renderer.setRenderTarget(null);let t=this._fluidCurrent;this._fluidCurrent=this._fluidPrev,this._fluidPrev=t,this._fluidFrame++}_createDiamond(){let e=this._createBrilliantGeometry(48);e.scale(.92,1.06,.92),e.computeVertexNormals();let t=new ce({color:16777215,metalness:0,roughness:0,transmission:1,thickness:this._isMobile?1.2:1.8,ior:2.417,attenuationDistance:6,attenuationColor:new h(16777215),envMapIntensity:2.2,iridescence:.35,iridescenceIOR:1.55,iridescenceThicknessRange:[400,900],clearcoat:1,clearcoatRoughness:0,transparent:!0,side:2});`dispersion`in t&&(t.dispersion=3.2),this.diamond=new x(e,t),this.diamond.rotation.x=-.18,this.scene.add(this.diamond)}_createBrilliantGeometry(e=24){let t=[],n=[],r=Math.PI/e,i=[[.62,0,0],[.62,.4,0],[.4,.7,r],[.08,1,0],[-.22,.88,r],[-.72,.42,0],[-1.08,0,0]],a=[];for(let[n,r,o]of i)if(a.push(t.length/3),r===0)t.push(0,n,0);else for(let i=0;i<e;i++){let a=i/e*Math.PI*2+o;t.push(Math.cos(a)*r,n,Math.sin(a)*r)}for(let t=0;t<i.length-1;t++){let[,r]=i[t],[,o]=i[t+1],s=a[t],c=a[t+1];if(r===0&&o>0)for(let t=0;t<e;t++){let r=(t+1)%e;n.push(s,c+t,c+r)}else if(r>0&&o===0)for(let t=0;t<e;t++){let r=(t+1)%e;n.push(s+t,s+r,c)}else for(let t=0;t<e;t++){let r=(t+1)%e;n.push(s+t,s+r,c+t),n.push(s+r,c+r,c+t)}}let o=new A;return o.setAttribute(`position`,new l(t,3)),o.setIndex(n),o}_addLights(){let e=new w(Ae,Ee);e.position.set(3.5,4,3.2),this.scene.add(e),this._lights.push(e);let t=new w(je,De);t.position.set(-4,1,-2),this.scene.add(t),this._lights.push(t);let n=new w(Me,Oe);n.position.set(0,-3,-4),this.scene.add(n),this._lights.push(n);let r=new se(1185830,.35);this.scene.add(r),this._lights.push(r)}_bindScroll(){this.lenis&&typeof this.lenis.on==`function`?(this.lenis.on(`scroll`,this._onLenisScroll),this._lenisScrollBound=!0):window.addEventListener(`scroll`,this._onNativeScroll,{passive:!0})}_onLenisScroll({scroll:e,limit:t}){this._scrollT=t>0?Math.min(e/t,1):0}_onNativeScroll(){let e=document.documentElement.scrollHeight-window.innerHeight;this._scrollT=e>0?Math.min(window.scrollY/e,1):0}_bindResize(){window.addEventListener(`resize`,this._onResize)}_onResize(){let e=window.innerWidth,t=window.innerHeight;if(this.camera&&(this.camera.aspect=e/t,this.camera.updateProjectionMatrix()),this.renderer&&this.renderer.setSize(e,t),this._composer&&this._composer.setSize(e,t),this._bloom&&this._bloom.setSize(e,t),this._fluidTargetA&&this._fluidTargetB&&this._displayTarget){let n=Math.max(2,Math.floor(e*z)),r=Math.max(2,Math.floor(t*z));this._fluidTargetA.setSize(n,r),this._fluidTargetB.setSize(n,r),this._displayTarget.setSize(n,r),this._fluidMat.uniforms.iResolution.value.set(n,r),this._displayMat.uniforms.iResolution.value.set(n,r),this._fluidFrame=0}this._isMobile=e<768||`ontouchstart`in window}_observeBlocks(){this._observer=new IntersectionObserver(e=>{e.forEach(e=>{if(!e.isIntersecting||e.target.classList.contains(`is-revealed`))return;e.target.classList.add(`is-revealed`);let t=e.target.dataset.final===`true`?e.target.querySelector(`.holm-philosophy__cta`):null;if(this._reducedMotion){e.target.classList.add(`is-in`),t&&D.set(t,{opacity:1});return}let n=e.target.querySelectorAll(`.holm-philosophy__char`);if(D.to(n,{yPercent:0,opacity:1,duration:.85,stagger:.018,ease:`power3.out`}),t){let e=n.length*.018+.15;D.fromTo(t,{opacity:0,scale:.85},{opacity:1,scale:1,duration:.9,delay:e,ease:`power3.out`})}})},{threshold:.35,rootMargin:`0px 0px -8% 0px`}),this.blocks.forEach(e=>this._observer.observe(e))}_bindCtaMagnetic(){if(this._reducedMotion)return;let e=this.container.querySelector(`.holm-philosophy__cta`);e&&(this._ctaEl=e,D.set(e,{opacity:0,x:0,y:0}),this._ctaSetX=D.quickTo(e,`x`,{duration:.55,ease:`power3`}),this._ctaSetY=D.quickTo(e,`y`,{duration:.55,ease:`power3`}),this._ctaMove=t=>{let n=e.getBoundingClientRect(),r=n.left+n.width/2,i=n.top+n.height/2,a=t.clientX-r,o=t.clientY-i,s=Math.hypot(a,o),c=n.width*1.35;if(s>c){this._ctaSetX(0),this._ctaSetY(0),e.classList.remove(`is-magnetic`);return}let l=(1-s/c)*.4;this._ctaSetX(a*l),this._ctaSetY(o*l),e.classList.add(`is-magnetic`)},this._ctaLeave=()=>{this._ctaSetX(0),this._ctaSetY(0),e.classList.remove(`is-magnetic`)},window.addEventListener(`mousemove`,this._ctaMove,{passive:!0}),window.addEventListener(`mouseleave`,this._ctaLeave))}_computeBeatTarget(){if(!this._beatEls||this._beatEls.length===0)return{x:0,y:0,scale:1};let e=window.innerHeight,t=e/2,n=e*ke,r=0,i=0,a=0,o=0;for(let{el:e,beat:s}of this._beatEls){let c=e.getBoundingClientRect(),l=c.top+c.height/2,u=Math.abs(l-t),d=Math.max(0,1-u/n),f=d*d*(3-2*d);r+=f,i+=s.x*f,a+=s.y*f,o+=s.scale*f}if(r<.001){let e=0,n=1/0;this._beatEls.forEach(({el:r},i)=>{let a=r.getBoundingClientRect(),o=a.top+a.height/2,s=Math.abs(o-t);s<n&&(n=s,e=i)});let r=this._beatEls[e].beat;return{x:r.x,y:r.y,scale:r.scale}}return{x:i/r,y:a/r,scale:o/r}}_startLoop(){this._active=!0,this._prevTime=performance.now();let e=t=>{if(!this._active)return;let n=(t-this._prevTime)/1e3,r=Math.min(n,.05);this._prevTime=t,this._idleSpin+=I*r;let i=this._reducedMotion?{x:0,y:0,scale:1.2}:this._computeBeatTarget(),a=this.camera.fov*Math.PI/360,o=Math.tan(a)*W,s=o*this.camera.aspect,c=this._isMobile?i.x*.2:i.x,l=i.y;this._targetPos.set(c*s,l*o,0);let u=1-(1-L)**(r*60);this.diamond.position.lerp(this._targetPos,u);let d=this.diamond.scale.x+(i.scale-this.diamond.scale.x)*u;if(this.diamond.scale.setScalar(d),this._heroPlane){let e=Math.max(0,1-this._scrollT*4),t=e*e*(3-2*e),n=this._heroPlane.material.uniforms;if(n.uOpacity.value=t,n.uTime.value=this._elapsed,this._heroPlane.visible=t>.005,this._heroPlane.visible&&this._pointerActive){this._heroRaycaster.setFromCamera(this._mouseNdc,this.camera);let e=this._heroRaycaster.ray.intersectPlane(this._heroPlaneMath,this._heroHitPoint);if(e){let{w:r,h:i}=this._heroPlaneSize,a=(e.x+r*.5)/r,o=1-(e.y+i*.5)/i;n.uMouseUv.value.set(a,o),n.uCursorFocus.value=t}}else n.uCursorFocus.value=0}let f=this._reducedMotion?-.18:-.18+Math.sin(this._scrollT*Math.PI)*R;this.diamond.rotation.y=this._idleSpin,this.diamond.rotation.x=f,this._elapsed+=r,this._stepFluid(this._elapsed),this._composer.render(),this._rafId=requestAnimationFrame(e)};this._rafId=requestAnimationFrame(e)}},X=new oe(window.innerWidth<768||`ontouchstart`in window?{smoothTouch:!1,touchMultiplier:.75}:{duration:1.6,smoothWheel:!0,wheelMultiplier:.55,touchMultiplier:1.2,smoothTouch:!1});D.ticker.lagSmoothing(0);function Z(e){X.raf(e),requestAnimationFrame(Z)}requestAnimationFrame(Z);var Q=new ae({lenis:X});Q.mount();var $=new Fe({lenis:X});$.init(),fe(document),window.addEventListener(`pagehide`,()=>{$.destroy(),Q.destroy?.(),X.destroy?.()});