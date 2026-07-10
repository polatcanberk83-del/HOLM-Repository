import{Ct as e,E as t,H as n,It as r,Jt as i,Mt as a,P as o,Q as s,Qt as c,R as l,Rt as u,St as d,T as f,Xt as p,Zt as m,_ as h,a as g,b as ee,bt as te,c as _,ct as v,d as y,dt as b,en as x,f as ne,i as re,j as S,jt as ie,lt as ae,mt as C,n as oe,p as se,pt as ce,qt as le,r as ue,s as de,st as fe,t as w,tn as T,u as E,wt as D,x as O,y as k,zt as A}from"./hoverRoll-Cil0JCfp.js";var j=class extends u{constructor(){super(),this.name=`RoomEnvironment`,this.position.y=-3.5;let e=new h;e.deleteAttribute(`uv`);let t=new C({side:1}),r=new C,i=new D(16777215,900,28,2);i.position.set(.418,16.199,.3),this.add(i);let a=new v(e,t);a.position.set(-.757,13.219,.717),a.scale.set(31.713,28.305,28.591),this.add(a);let o=new n(e,r,6),s=new te;s.position.set(-10.906,2.009,1.846),s.rotation.set(0,-.195,0),s.scale.set(2.328,7.905,4.651),s.updateMatrix(),o.setMatrixAt(0,s.matrix),s.position.set(-5.607,-.754,-.758),s.rotation.set(0,.994,0),s.scale.set(1.97,1.534,3.955),s.updateMatrix(),o.setMatrixAt(1,s.matrix),s.position.set(6.167,.857,7.803),s.rotation.set(0,.561,0),s.scale.set(3.927,6.285,3.687),s.updateMatrix(),o.setMatrixAt(2,s.matrix),s.position.set(-2.017,.018,6.124),s.rotation.set(0,.333,0),s.scale.set(2.002,4.566,2.064),s.updateMatrix(),o.setMatrixAt(3,s.matrix),s.position.set(2.291,-.756,-2.621),s.rotation.set(0,-.286,0),s.scale.set(1.546,1.552,1.496),s.updateMatrix(),o.setMatrixAt(4,s.matrix),s.position.set(-2.193,-.369,-5.547),s.rotation.set(0,.516,0),s.scale.set(3.875,3.487,2.986),s.updateMatrix(),o.setMatrixAt(5,s.matrix),this.add(o);let c=new v(e,M(50));c.position.set(-16.116,14.37,8.208),c.scale.set(.1,2.428,2.739),this.add(c);let l=new v(e,M(50));l.position.set(-16.109,18.021,-8.207),l.scale.set(.1,2.425,2.751),this.add(l);let u=new v(e,M(17));u.position.set(14.904,12.198,-1.832),u.scale.set(.15,4.265,6.331),this.add(u);let d=new v(e,M(43));d.position.set(-.462,8.89,14.52),d.scale.set(4.38,5.441,.088),this.add(d);let f=new v(e,M(20));f.position.set(3.235,11.486,-12.541),f.scale.set(2.5,2,.1),this.add(f);let p=new v(e,M(100));p.position.set(0,20,0),p.scale.set(1,.1,1),this.add(p)}dispose(){let e=new Set;this.traverse(t=>{t.isMesh&&(e.add(t.geometry),e.add(t.material))});for(let t of e)t.dispose()}};function M(e){return new b({color:0,emissive:16777215,emissiveIntensity:e})}var N={name:`OutputShader`,uniforms:{tDiffuse:{value:null},toneMappingExposure:{value:1}},vertexShader:`
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

		}`},P=class extends _{constructor(){super(),this.isOutputPass=!0,this.uniforms=le.clone(N.uniforms),this.material=new a({name:N.name,uniforms:this.uniforms,vertexShader:N.vertexShader,fragmentShader:N.fragmentShader}),this._fsQuad=new de(this.material),this._outputColorSpace=null,this._toneMapping=null}render(e,n,r){this.uniforms.tDiffuse.value=r.texture,this.uniforms.toneMappingExposure.value=e.toneMappingExposure,(this._outputColorSpace!==e.outputColorSpace||this._toneMapping!==e.toneMapping)&&(this._outputColorSpace=e.outputColorSpace,this._toneMapping=e.toneMapping,this.material.defines={},t.getTransfer(this._outputColorSpace)===`srgb`&&(this.material.defines.SRGB_TRANSFER=``),this._toneMapping===1?this.material.defines.LINEAR_TONE_MAPPING=``:this._toneMapping===2?this.material.defines.REINHARD_TONE_MAPPING=``:this._toneMapping===3?this.material.defines.CINEON_TONE_MAPPING=``:this._toneMapping===4?this.material.defines.ACES_FILMIC_TONE_MAPPING=``:this._toneMapping===6?this.material.defines.AGX_TONE_MAPPING=``:this._toneMapping===7?this.material.defines.NEUTRAL_TONE_MAPPING=``:this._toneMapping===5&&(this.material.defines.CUSTOM_TONE_MAPPING=``),this.material.needsUpdate=!0),this.renderToScreen===!0?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(n),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this._fsQuad.render(e))}dispose(){this.material.dispose(),this._fsQuad.dispose()}},F=.16,I=.09,L=.18,R=.5,z=22,B=.3,V=.985,pe=.9,me=.92,he=1.6,ge=.85,_e=1.4,ve=`#000000`,ye=`#050d24`,be=`#0e3277`,xe=`#3672d6`,H=`
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`,Se=`
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
`,Ce=`
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
`;function U(e){return new m(parseInt(e.slice(1,3),16)/255,parseInt(e.slice(3,5),16)/255,parseInt(e.slice(5,7),16)/255)}var W=5.6,we=1.85,Te=4.4,Ee=.95,De=.75,G=[{x:0,y:0,scale:1.2,side:null,hasText:!1},{x:.34,y:.03,scale:1,side:`left`,hasText:!0},{x:-.34,y:-.05,scale:1.24,side:`right`,hasText:!0},{x:0,y:.08,scale:.62,side:`left`,hasText:!0},{x:-.3,y:.06,scale:1.18,side:`right`,hasText:!0},{x:.28,y:-.04,scale:1.28,side:`left`,hasText:!0},{x:0,y:.02,scale:1.35,side:`center-below`,hasText:!0}],Oe=1,ke=16773852,Ae=9023716,je=12108014,Me=.012,K=1.05;`${Me.toFixed(4)}${K.toFixed(4)}${K.toFixed(4)}${.35.toFixed(4)}${320 .toFixed(1)}`;var q=[[`Some studios tell stories.`,`We work toward a single moment.`],[`The moment a rough idea holds still —`,`and becomes something finished.`],[`It is rare. It forms under pressure.`,`The way carbon becomes a diamond.`],[`So that is the shape we keep returning to.`,`Not decoration. A reminder of what we are after.`],[`Between sketch and masterpiece,`,`there is patience.`],[`Ready to create your moment.`]];function J(e){return e.split(` `).map(e=>e?`<span class="holm-philosophy__word">${Array.from(e).map(e=>`<span class="holm-philosophy__char">${e.replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`)}</span>`).join(``)}</span>`:``).join(` `)}var Y=`Let's talk`,Ne=`/contact/`,Pe=class{constructor({lenis:e}={}){this.lenis=e||null,this._reducedMotion=window.matchMedia(`(prefers-reduced-motion: reduce)`).matches,this._isMobile=window.innerWidth<768||`ontouchstart`in window,this.renderer=null,this.scene=null,this.camera=null,this.diamond=null,this.envMap=null,this._lights=[],this._heroPlane=null,this.container=null,this.canvas=null,this.blocks=[],this._rafId=null,this._active=!1,this._prevTime=0,this._scrollT=0,this._idleSpin=0,this._ctaEl=null,this._ctaMove=null,this._ctaLeave=null,this._ctaSetX=null,this._ctaSetY=null,this._ctaInnerSetX=null,this._ctaInnerSetY=null,this._targetPos=new m,this._targetScale=new m(1,1,1),this._targetTilt=0,this._pressure=0,this._mouseNdc=new p(-99,-99),this._mouseWorld=new m,this._mouseWorldSmooth=new m(999,999,999),this._invMat=new fe,this._elapsed=0,this._fluidQuadCam=null,this._fluidQuadScene=null,this._fluidQuadMesh=null,this._fluidMat=null,this._displayMat=null,this._fluidTargetA=null,this._fluidTargetB=null,this._displayTarget=null,this._fluidFrame=0,this._mousePx=new p(0,0),this._prevMousePx=new p(0,0),this._lastMouseMoveMs=0,this._onResize=this._onResize.bind(this),this._onLenisScroll=this._onLenisScroll.bind(this),this._onNativeScroll=this._onNativeScroll.bind(this),this._onPointerMove=this._onPointerMove.bind(this),this._observer=null}init(){this._createDOM(),this._createThree(),this._bindScroll(),this._bindResize(),this._bindPointer(),this._observeBlocks(),this._bindCtaMagnetic(),this._startLoop()}_bindPointer(){window.addEventListener(`pointermove`,this._onPointerMove,{passive:!0})}_onPointerMove(e){if(this._mouseNdc.set(e.clientX/window.innerWidth*2-1,-(e.clientY/window.innerHeight*2-1)),this._fluidMat){window.innerWidth;let t=window.innerHeight,n=e.clientX*R,r=(t-e.clientY)*R;this._prevMousePx.copy(this._mousePx),this._mousePx.set(n,r),this._lastMouseMoveMs=performance.now(),this._fluidMat.uniforms.iMouse.value.set(this._mousePx.x,this._mousePx.y,this._prevMousePx.x,this._prevMousePx.y)}}destroy(){this._active=!1,this._rafId&&cancelAnimationFrame(this._rafId),window.removeEventListener(`resize`,this._onResize),window.removeEventListener(`pointermove`,this._onPointerMove),this.lenis&&this._lenisScrollBound?this.lenis.off(`scroll`,this._onLenisScroll):window.removeEventListener(`scroll`,this._onNativeScroll),this._observer&&this._observer.disconnect(),this._ctaMove&&window.removeEventListener(`mousemove`,this._ctaMove),this._ctaLeave&&window.removeEventListener(`mouseleave`,this._ctaLeave),this.diamond&&(this.diamond.geometry.dispose(),this.diamond.material.dispose()),this._heroPlane&&(this._heroPlane.geometry.dispose(),this._heroPlane.material.map?.dispose(),this._heroPlane.material.dispose()),this.envMap&&this.envMap.dispose();for(let e of this._lights)this.scene?.remove(e);this._fluidTargetA?.dispose(),this._fluidTargetB?.dispose(),this._displayTarget?.dispose(),this._fluidMat?.dispose(),this._displayMat?.dispose(),this._fluidQuadMesh?.geometry?.dispose(),this.renderer&&(this.renderer.dispose(),this.renderer.forceContextLoss?.()),this.container?.parentNode&&this.container.parentNode.removeChild(this.container),this.renderer=this.scene=this.camera=null,this.diamond=this.envMap=null,this.container=this.canvas=null}_createDOM(){let e=document.createElement(`div`);e.className=`holm-philosophy`,this._reducedMotion&&e.classList.add(`is-reduced-motion`);let t=0;if(e.innerHTML=`
      <canvas class="holm-philosophy__canvas" aria-hidden="true"></canvas>

      <section class="holm-philosophy__intro" data-beat="0" aria-hidden="true"></section>

      <main class="holm-philosophy__beats">
        ${G.map((e,n)=>{if(!e.hasText)return``;let r=q[t],i=t===q.length-1;t++;let a=r.map(e=>`
          <div class="holm-philosophy__line">${J(e)}</div>
        `).join(``),o=i?`
          <a class="holm-philosophy__cta"
             href="${Ne}"
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
    `,document.body.appendChild(e),this.container=e,this.canvas=e.querySelector(`.holm-philosophy__canvas`),this.blocks=[...e.querySelectorAll(`.holm-philosophy__beat`)],this._beatEls=[],e.querySelectorAll(`[data-beat]`).forEach(e=>{let t=parseInt(e.dataset.beat,10);Number.isFinite(t)&&G[t]&&this._beatEls.push({el:e,beat:G[t]})}),!this._reducedMotion){let t=e.querySelectorAll(`.holm-philosophy__char`);E.set(t,{yPercent:115,opacity:0})}}_createThree(){this.renderer=new ne({canvas:this.canvas,antialias:!0,alpha:!1,powerPreference:`high-performance`}),this.renderer.setPixelRatio(Math.min(window.devicePixelRatio,this._isMobile?1.5:2)),this.renderer.setSize(window.innerWidth,window.innerHeight),this.renderer.toneMapping=4,this.renderer.toneMappingExposure=.55,this.renderer.outputColorSpace=r,this.scene=new u,this._initFluid(),this.scene.background=this._displayTarget.texture,this.camera=new d(36,window.innerWidth/window.innerHeight,.1,100),this.camera.position.set(0,0,W),this.camera.lookAt(0,0,0);let e=new y(this.renderer),t=new j;this.envMap=e.fromScene(t,.04).texture,e.dispose(),this.scene.environment=this.envMap,this.scene.environmentIntensity=we,this._composer=new g(this.renderer),this._composer.setPixelRatio(this.renderer.getPixelRatio()),this._composer.setSize(window.innerWidth,window.innerHeight),this._composer.addPass(new re(this.scene,this.camera)),this._bloom=new ue(new p(window.innerWidth,window.innerHeight),.28,.35,.98),this._composer.addPass(this._bloom),this._composer.addPass(new P),this._createDiamond(),this._createHeroPlane(),this._addLights()}_createHeroPlane(){let t=document.createElement(`canvas`);t.width=2560,t.height=640;let n=t.getContext(`2d`);n.fillStyle=`rgba(224, 236, 255, 0.28)`,n.font=`italic 300 480px 'Fraunces', 'Times New Roman', serif`,n.textAlign=`center`,n.textBaseline=`middle`,n.fillText(`philosophy`,t.width/2,t.height/2+30);let i=new O(t);i.colorSpace=r,i.minFilter=s,i.magFilter=s,i.anisotropy=this.renderer.capabilities.getMaxAnisotropy();let a=new ae({map:i,transparent:!0,depthWrite:!1,opacity:1}),o=W- -8,c=this.camera.fov*Math.PI/360,l=Math.tan(c)*o*this.camera.aspect,u=Math.max(l*2*1.15,20),d=new e(u,u/(t.width/t.height));this._heroPlane=new v(d,a),this._heroPlane.position.z=-8,this._heroPlane.renderOrder=-1,this.scene.add(this._heroPlane)}_initFluid(){let t=Math.max(2,Math.floor(window.innerWidth*R)),n=Math.max(2,Math.floor(window.innerHeight*R)),a={minFilter:s,magFilter:s,format:ie,type:l,depthBuffer:!1,stencilBuffer:!1};this._fluidTargetA=new x(t,n,a),this._fluidTargetB=new x(t,n,a),this._displayTarget=new x(t,n,{...a,type:i}),this._fluidCurrent=this._fluidTargetA,this._fluidPrev=this._fluidTargetB,this._fluidMat=new A({vertexShader:H,fragmentShader:Se,uniforms:{iTime:{value:0},iResolution:{value:new p(t,n)},iMouse:{value:new c(0,0,0,0)},iFrame:{value:0},iPreviousFrame:{value:null},uBrushSize:{value:z},uBrushStrength:{value:B},uFluidDecay:{value:V},uTrailLength:{value:pe},uStopDecay:{value:me}}}),this._displayMat=new A({vertexShader:H,fragmentShader:Ce,uniforms:{iTime:{value:0},iResolution:{value:new p(t,n)},iFluid:{value:null},uDistortionAmount:{value:he},uColor1:{value:U(ve)},uColor2:{value:U(ye)},uColor3:{value:U(be)},uColor4:{value:U(xe)},uColorIntensity:{value:ge},uSoftness:{value:_e}}}),this._fluidQuadCam=new ee,this._fluidQuadScene=new u,this._fluidQuadMesh=new v(new e(2,2),this._fluidMat),this._fluidQuadScene.add(this._fluidQuadMesh),this._displayTarget.texture.colorSpace=r}_stepFluid(e){if(!this._fluidMat)return;performance.now()-this._lastMouseMoveMs>100&&this._fluidMat.uniforms.iMouse.value.set(0,0,0,0),this._fluidMat.uniforms.iTime.value=e,this._fluidMat.uniforms.iFrame.value=this._fluidFrame,this._fluidMat.uniforms.iPreviousFrame.value=this._fluidPrev.texture,this._fluidQuadMesh.material=this._fluidMat,this.renderer.setRenderTarget(this._fluidCurrent),this.renderer.clear(),this.renderer.render(this._fluidQuadScene,this._fluidQuadCam),this._displayMat.uniforms.iTime.value=e,this._displayMat.uniforms.iFluid.value=this._fluidCurrent.texture,this._fluidQuadMesh.material=this._displayMat,this.renderer.setRenderTarget(this._displayTarget),this.renderer.clear(),this.renderer.render(this._fluidQuadScene,this._fluidQuadCam),this.renderer.setRenderTarget(null);let t=this._fluidCurrent;this._fluidCurrent=this._fluidPrev,this._fluidPrev=t,this._fluidFrame++}_createDiamond(){let e=this._createBrilliantGeometry(48);e.scale(.92,1.06,.92),e.computeVertexNormals();let t=new ce({color:16777215,metalness:0,roughness:0,transmission:1,thickness:this._isMobile?1.2:1.8,ior:2.417,attenuationDistance:6,attenuationColor:new f(16777215),envMapIntensity:2.2,iridescence:.35,iridescenceIOR:1.55,iridescenceThicknessRange:[400,900],clearcoat:1,clearcoatRoughness:0,transparent:!0,side:2});`dispersion`in t&&(t.dispersion=3.2),this.diamond=new v(e,t),this.diamond.rotation.x=-.18,this.scene.add(this.diamond)}_createBrilliantGeometry(e=24){let t=[],n=[],r=Math.PI/e,i=[[.62,0,0],[.62,.4,0],[.4,.7,r],[.08,1,0],[-.22,.88,r],[-.72,.42,0],[-1.08,0,0]],a=[];for(let[n,r,o]of i)if(a.push(t.length/3),r===0)t.push(0,n,0);else for(let i=0;i<e;i++){let a=i/e*Math.PI*2+o;t.push(Math.cos(a)*r,n,Math.sin(a)*r)}for(let t=0;t<i.length-1;t++){let[,r]=i[t],[,o]=i[t+1],s=a[t],c=a[t+1];if(r===0&&o>0)for(let t=0;t<e;t++){let r=(t+1)%e;n.push(s,c+t,c+r)}else if(r>0&&o===0)for(let t=0;t<e;t++){let r=(t+1)%e;n.push(s+t,s+r,c)}else for(let t=0;t<e;t++){let r=(t+1)%e;n.push(s+t,s+r,c+t),n.push(s+r,c+r,c+t)}}let s=new k;return s.setAttribute(`position`,new o(t,3)),s.setIndex(n),s}_addLights(){let e=new S(ke,Te);e.position.set(3.5,4,3.2),this.scene.add(e),this._lights.push(e);let t=new S(Ae,Ee);t.position.set(-4,1,-2),this.scene.add(t),this._lights.push(t);let n=new S(je,De);n.position.set(0,-3,-4),this.scene.add(n),this._lights.push(n);let r=new se(1185830,.35);this.scene.add(r),this._lights.push(r)}_bindScroll(){this.lenis&&typeof this.lenis.on==`function`?(this.lenis.on(`scroll`,this._onLenisScroll),this._lenisScrollBound=!0):window.addEventListener(`scroll`,this._onNativeScroll,{passive:!0})}_onLenisScroll({scroll:e,limit:t}){this._scrollT=t>0?Math.min(e/t,1):0}_onNativeScroll(){let e=document.documentElement.scrollHeight-window.innerHeight;this._scrollT=e>0?Math.min(window.scrollY/e,1):0}_bindResize(){window.addEventListener(`resize`,this._onResize)}_onResize(){let e=window.innerWidth,t=window.innerHeight;if(this.camera&&(this.camera.aspect=e/t,this.camera.updateProjectionMatrix()),this.renderer&&this.renderer.setSize(e,t),this._composer&&this._composer.setSize(e,t),this._bloom&&this._bloom.setSize(e,t),this._fluidTargetA&&this._fluidTargetB&&this._displayTarget){let n=Math.max(2,Math.floor(e*R)),r=Math.max(2,Math.floor(t*R));this._fluidTargetA.setSize(n,r),this._fluidTargetB.setSize(n,r),this._displayTarget.setSize(n,r),this._fluidMat.uniforms.iResolution.value.set(n,r),this._displayMat.uniforms.iResolution.value.set(n,r),this._fluidFrame=0}this._isMobile=e<768||`ontouchstart`in window}_observeBlocks(){this._observer=new IntersectionObserver(e=>{e.forEach(e=>{if(!e.isIntersecting||e.target.classList.contains(`is-revealed`))return;e.target.classList.add(`is-revealed`);let t=e.target.dataset.final===`true`?e.target.querySelector(`.holm-philosophy__cta`):null;if(this._reducedMotion){e.target.classList.add(`is-in`),t&&E.set(t,{opacity:1});return}let n=e.target.querySelectorAll(`.holm-philosophy__char`);if(E.to(n,{yPercent:0,opacity:1,duration:.85,stagger:.018,ease:`power3.out`}),t){let e=n.length*.018+.15;E.fromTo(t,{opacity:0,scale:.85},{opacity:1,scale:1,duration:.9,delay:e,ease:`power3.out`})}})},{threshold:.35,rootMargin:`0px 0px -8% 0px`}),this.blocks.forEach(e=>this._observer.observe(e))}_bindCtaMagnetic(){if(this._reducedMotion)return;let e=this.container.querySelector(`.holm-philosophy__cta`);e&&(this._ctaEl=e,E.set(e,{opacity:0,x:0,y:0}),this._ctaSetX=E.quickTo(e,`x`,{duration:.55,ease:`power3`}),this._ctaSetY=E.quickTo(e,`y`,{duration:.55,ease:`power3`}),this._ctaMove=t=>{let n=e.getBoundingClientRect(),r=n.left+n.width/2,i=n.top+n.height/2,a=t.clientX-r,o=t.clientY-i,s=Math.hypot(a,o),c=n.width*1.35;if(s>c){this._ctaSetX(0),this._ctaSetY(0),e.classList.remove(`is-magnetic`);return}let l=(1-s/c)*.4;this._ctaSetX(a*l),this._ctaSetY(o*l),e.classList.add(`is-magnetic`)},this._ctaLeave=()=>{this._ctaSetX(0),this._ctaSetY(0),e.classList.remove(`is-magnetic`)},window.addEventListener(`mousemove`,this._ctaMove,{passive:!0}),window.addEventListener(`mouseleave`,this._ctaLeave))}_computeBeatTarget(){if(!this._beatEls||this._beatEls.length===0)return{x:0,y:0,scale:1};let e=window.innerHeight,t=e/2,n=e*Oe,r=0,i=0,a=0,o=0;for(let{el:e,beat:s}of this._beatEls){let c=e.getBoundingClientRect(),l=c.top+c.height/2,u=Math.abs(l-t),d=Math.max(0,1-u/n),f=d*d*(3-2*d);r+=f,i+=s.x*f,a+=s.y*f,o+=s.scale*f}if(r<.001){let e=0,n=1/0;this._beatEls.forEach(({el:r},i)=>{let a=r.getBoundingClientRect(),o=a.top+a.height/2,s=Math.abs(o-t);s<n&&(n=s,e=i)});let r=this._beatEls[e].beat;return{x:r.x,y:r.y,scale:r.scale}}return{x:i/r,y:a/r,scale:o/r}}_startLoop(){this._active=!0,this._prevTime=performance.now();let e=t=>{if(!this._active)return;let n=(t-this._prevTime)/1e3,r=Math.min(n,.05);this._prevTime=t,this._idleSpin+=F*r;let i=this._reducedMotion?{x:0,y:0,scale:1.2}:this._computeBeatTarget(),a=this.camera.fov*Math.PI/360,o=Math.tan(a)*W,s=o*this.camera.aspect,c=this._isMobile?i.x*.2:i.x,l=i.y;this._targetPos.set(c*s,l*o,0);let u=1-(1-I)**(r*60);this.diamond.position.lerp(this._targetPos,u);let d=this.diamond.scale.x+(i.scale-this.diamond.scale.x)*u;if(this.diamond.scale.setScalar(d),this._heroPlane){let e=Math.max(0,1-this._scrollT*4),t=e*e*(3-2*e);this._heroPlane.material.opacity=t,this._heroPlane.visible=t>.005}let f=this._reducedMotion?-.18:-.18+Math.sin(this._scrollT*Math.PI)*L;this.diamond.rotation.y=this._idleSpin,this.diamond.rotation.x=f,this._elapsed+=r,this._stepFluid(this._elapsed),this._composer.render(),this._rafId=requestAnimationFrame(e)};this._rafId=requestAnimationFrame(e)}},X=new T(window.innerWidth<768||`ontouchstart`in window?{smoothTouch:!1,touchMultiplier:.75}:{duration:1.6,smoothWheel:!0,wheelMultiplier:.55,touchMultiplier:1.2,smoothTouch:!1});E.ticker.lagSmoothing(0);function Z(e){X.raf(e),requestAnimationFrame(Z)}requestAnimationFrame(Z);var Q=new oe({lenis:X});Q.mount();var $=new Pe({lenis:X});$.init(),w(document),window.addEventListener(`pagehide`,()=>{$.destroy(),Q.destroy?.(),X.destroy?.()});