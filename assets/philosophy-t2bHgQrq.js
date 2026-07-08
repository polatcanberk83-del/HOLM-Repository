import{$ as e,At as t,Ct as n,H as r,Ht as i,Q as a,Rt as o,S as s,Tt as c,Z as l,a as u,d,dt as f,f as p,ft as m,i as h,jt as g,mt as _,n as v,r as y,t as b,w as x,wt as S,zt as C}from"./menu-CrW1uJqh.js";var w=.16,T=.09,E=.18,D=5.6,O=1.85,k=4.4,ee=.95,A=.75,j=9,M=1.25,N=[{x:0,y:0,scale:1.2,side:null,hasText:!1},{x:.34,y:.03,scale:1,side:`left`,hasText:!0},{x:-.34,y:-.05,scale:1.24,side:`right`,hasText:!0},{x:0,y:.08,scale:.62,side:`left`,hasText:!0},{x:-.3,y:.06,scale:1.18,side:`right`,hasText:!0},{x:.28,y:-.04,scale:1.28,side:`left`,hasText:!0},{x:0,y:.02,scale:1.35,side:`center-below`,hasText:!0}],P=1,F=16773852,I=9023716,L=12108014,R=9e3,z=.028,B=1.15,V=.55,H=.14,U=`
attribute float aSeed;
uniform float   uTime;
uniform vec3    uMouseLocal;   // cursor in the diamond's local frame
uniform float   uPixel;
varying float   vSeed;
varying float   vRepel;
varying vec3    vLocal;

void main() {
  vec3 base = position;

  // Idle turbulence — smooth per-axis waves keyed on seed so no two match
  vec3 wob;
  wob.x = sin(base.y * 3.6 + uTime * 0.62 + aSeed * 12.3) *
          cos(base.z * 2.9 + uTime * 0.48 + aSeed *  9.7);
  wob.y = sin(base.z * 3.1 + uTime * 0.54 + aSeed * 15.1) *
          cos(base.x * 2.7 + uTime * 0.44 + aSeed *  7.5);
  wob.z = sin(base.x * 3.8 + uTime * 0.68 + aSeed * 11.3) *
          cos(base.y * 3.2 + uTime * 0.52 + aSeed * 13.9);
  base += wob * ${z.toFixed(4)};

  // Mouse repel — pushes particles radially away from the cursor
  vec3  toMouse = base - uMouseLocal;
  float d       = length(toMouse);
  float repel   = 0.0;
  if (d < ${B.toFixed(4)}) {
    float t = 1.0 - d / ${B.toFixed(4)};
    repel   = t * t;                         // ease-in for a rubbery falloff
    base   += normalize(toMouse + vec3(0.0001)) * repel * ${V.toFixed(4)};
  }

  vec4 mv = modelViewMatrix * vec4(base, 1.0);
  gl_Position  = projectionMatrix * mv;
  // Repelled particles inflate slightly so the hover reads as pressure
  gl_PointSize = uPixel * (${520 .toFixed(1)} / -mv.z) * (1.0 + repel * 0.85);

  vSeed  = aSeed;
  vRepel = repel;
  vLocal = base;
}
`,W=`
uniform float uTime;
varying float vSeed;
varying float vRepel;
varying vec3  vLocal;

void main() {
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c);
  if (d > 0.5) discard;

  // Soft round sprite with a hot core
  float core = pow(1.0 - d * 2.0, 1.9);

  // Iridescent color — blue-white base, warmer at higher y, cool at low y
  vec3 hi   = vec3(0.96, 0.98, 1.05);
  vec3 mid  = vec3(0.60, 0.78, 1.02);
  vec3 low  = vec3(0.40, 0.55, 0.90);
  float t   = clamp(vLocal.y * 0.6 + 0.5, 0.0, 1.0);
  vec3 col  = mix(low, mid, smoothstep(0.0, 0.55, t));
  col       = mix(col, hi,  smoothstep(0.55, 1.0, t));

  // Repel brightens toward warm white — hover reads as heat
  col = mix(col, vec3(1.05, 0.95, 0.82), vRepel * 0.55);

  // Slow per-particle twinkle
  float twinkle = 0.72 + 0.28 * abs(sin(vSeed * 51.7 + uTime * 1.6));

  gl_FragColor = vec4(col, core * twinkle * 0.85);
}
`;function G(e){let t=-1.1,n=e=>e>.55||e<-1.1?0:e>=.1?.42+.5800000000000001*((.55-e)/.45000000000000007):1*(1-(.1-e)/1.2000000000000002),r=new Float32Array(e*3),i=new Float32Array(e),a=0;for(;a<e;){let e=t+Math.random()*(.55-t),o=n(e);if(o<=0)continue;let s=Math.sqrt(Math.random())*o,c=Math.random()*Math.PI*2;r[a*3]=Math.cos(c)*s,r[a*3+1]=e,r[a*3+2]=Math.sin(c)*s,i[a]=Math.random(),a++}return{positions:r,seeds:i}}var K=[[`Some studios tell stories.`,`We work toward a single moment.`],[`The moment a rough idea holds still —`,`and becomes something finished.`],[`It is rare. It forms under pressure.`,`The way carbon becomes a diamond.`],[`So that is the shape we keep returning to.`,`Not decoration. A reminder of what we are after.`],[`Between sketch and masterpiece,`,`there is patience.`],[`Ready to create your moment.`]],q=`Let's talk`,J=`/contact/`,Y=class{constructor({lenis:e}={}){this.lenis=e||null,this._reducedMotion=window.matchMedia(`(prefers-reduced-motion: reduce)`).matches,this._isMobile=window.innerWidth<768||`ontouchstart`in window,this.renderer=null,this.scene=null,this.camera=null,this.diamond=null,this.envMap=null,this._lights=[],this._glow=null,this._heroPlane=null,this.container=null,this.canvas=null,this.blocks=[],this.scrollCue=null,this._rafId=null,this._active=!1,this._prevTime=0,this._scrollT=0,this._idleSpin=0,this._cueFaded=!1,this._cueTween=null,this._ctaEl=null,this._ctaMove=null,this._ctaLeave=null,this._ctaSetX=null,this._ctaSetY=null,this._ctaInnerSetX=null,this._ctaInnerSetY=null,this._targetPos=new C,this._targetScale=new C(1,1,1),this._targetTilt=0,this._pressure=0,this._mouseNdc=new o(-99,-99),this._mouseWorld=new C,this._mouseWorldSmooth=new C(999,999,999),this._invMat=new l,this._elapsed=0,this._onResize=this._onResize.bind(this),this._onLenisScroll=this._onLenisScroll.bind(this),this._onNativeScroll=this._onNativeScroll.bind(this),this._onPointerMove=this._onPointerMove.bind(this),this._observer=null}init(){this._createDOM(),this._createThree(),this._bindScroll(),this._bindResize(),this._bindPointer(),this._observeBlocks(),this._bindCtaMagnetic(),this._startCue(),this._startLoop()}_bindPointer(){window.addEventListener(`pointermove`,this._onPointerMove,{passive:!0})}_onPointerMove(e){this._mouseNdc.set(e.clientX/window.innerWidth*2-1,-(e.clientY/window.innerHeight*2-1))}destroy(){this._active=!1,this._rafId&&cancelAnimationFrame(this._rafId),window.removeEventListener(`resize`,this._onResize),window.removeEventListener(`pointermove`,this._onPointerMove),this.lenis&&this._lenisScrollBound?this.lenis.off(`scroll`,this._onLenisScroll):window.removeEventListener(`scroll`,this._onNativeScroll),this._observer&&this._observer.disconnect(),this._cueTween&&this._cueTween.kill(),this._ctaMove&&window.removeEventListener(`mousemove`,this._ctaMove),this._ctaLeave&&window.removeEventListener(`mouseleave`,this._ctaLeave),this.diamond&&(this.diamond.geometry.dispose(),this.diamond.material.dispose()),this._glow&&(this._glow.geometry.dispose(),this._glow.material.dispose()),this._heroPlane&&(this._heroPlane.geometry.dispose(),this._heroPlane.material.map?.dispose(),this._heroPlane.material.dispose()),this._backdropTex&&this._backdropTex.dispose(),this.envMap&&this.envMap.dispose();for(let e of this._lights)this.scene?.remove(e);this.renderer&&(this.renderer.dispose(),this.renderer.forceContextLoss?.()),this.container?.parentNode&&this.container.parentNode.removeChild(this.container),this.renderer=this.scene=this.camera=null,this.diamond=this.envMap=this._glow=null,this.container=this.canvas=null}_createDOM(){let e=document.createElement(`div`);e.className=`holm-philosophy`,this._reducedMotion&&e.classList.add(`is-reduced-motion`);let t=0;if(e.innerHTML=`
      <canvas class="holm-philosophy__canvas" aria-hidden="true"></canvas>
      <div class="holm-philosophy__vignette" aria-hidden="true"></div>

      <section class="holm-philosophy__intro" data-beat="0" aria-hidden="true">
        <div class="holm-philosophy__cue">
          <span class="holm-philosophy__cue-word">scroll to discover</span>
          <span class="holm-philosophy__cue-line"></span>
        </div>
      </section>

      <main class="holm-philosophy__beats">
        ${N.map((e,n)=>{if(!e.hasText)return``;let r=K[t],i=t===K.length-1;t++;let a=r.map(e=>`
          <div class="holm-philosophy__line">
            <span class="holm-philosophy__line-inner">${e}</span>
          </div>
        `).join(``),o=i?`
          <a class="holm-philosophy__cta" href="${J}" aria-label="${q}">
            <span class="holm-philosophy__cta-ring" aria-hidden="true"></span>
            <span class="holm-philosophy__cta-inner">
              <span class="holm-philosophy__cta-stack">
                <span class="holm-philosophy__cta-label">${q}</span>
                <span class="holm-philosophy__cta-label holm-philosophy__cta-label--arrow" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="1.15em" height="1.15em" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M5 12 H19"/><path d="M13 6 L19 12 L13 18"/>
                  </svg>
                </span>
              </span>
            </span>
          </a>
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
    `,document.body.appendChild(e),this.container=e,this.canvas=e.querySelector(`.holm-philosophy__canvas`),this.blocks=[...e.querySelectorAll(`.holm-philosophy__beat`)],this.scrollCue=e.querySelector(`.holm-philosophy__cue`),this._beatEls=[],e.querySelectorAll(`[data-beat]`).forEach(e=>{let t=parseInt(e.dataset.beat,10);Number.isFinite(t)&&N[t]&&this._beatEls.push({el:e,beat:N[t]})}),!this._reducedMotion){let t=e.querySelectorAll(`.holm-philosophy__line-inner`);v.set(t,{yPercent:108,opacity:0})}}_createThree(){this.renderer=new h({canvas:this.canvas,antialias:!0,alpha:!1,powerPreference:`high-performance`}),this.renderer.setPixelRatio(Math.min(window.devicePixelRatio,this._isMobile?1.5:2)),this.renderer.setSize(window.innerWidth,window.innerHeight),this.renderer.toneMapping=4,this.renderer.toneMappingExposure=1.15,this.renderer.outputColorSpace=n,this.scene=new S,this.scene.background=this._buildBackdrop(),this.camera=new f(36,window.innerWidth/window.innerHeight,.1,100),this.camera.position.set(0,0,D),this.camera.lookAt(0,0,0),this.envMap=this._buildProceduralEnv(),this.scene.environment=this.envMap,this.scene.environmentIntensity=O,this._createGlow(),this._createDiamond(),this._createHeroPlane(),this._addLights()}_createHeroPlane(){let t=document.createElement(`canvas`);t.width=2560,t.height=640;let i=t.getContext(`2d`);i.fillStyle=`rgba(224, 236, 255, 0.28)`,i.font=`italic 300 480px 'Fraunces', 'Times New Roman', serif`,i.textAlign=`center`,i.textBaseline=`middle`,i.fillText(`philosophy`,t.width/2,t.height/2+30);let o=new p(t);o.colorSpace=n,o.minFilter=r,o.magFilter=r,o.anisotropy=this.renderer.capabilities.getMaxAnisotropy();let s=new e({map:o,transparent:!0,depthWrite:!1,opacity:1}),c=D- -8,l=this.camera.fov*Math.PI/360,u=Math.tan(l)*c*this.camera.aspect,d=Math.max(u*2*1.15,20),f=new m(d,d/(t.width/t.height));this._heroPlane=new a(f,s),this._heroPlane.position.z=-8,this._heroPlane.renderOrder=-1,this.scene.add(this._heroPlane)}_buildBackdrop(){let e=document.createElement(`canvas`);e.width=1024,e.height=1024;let t=e.getContext(`2d`);t.fillStyle=`#000000`,t.fillRect(0,0,1024,1024);let i=t.createRadialGradient(512,440,20,512,512,780);i.addColorStop(0,`#0e1626`),i.addColorStop(.35,`#06090f`),i.addColorStop(.8,`#000000`),i.addColorStop(1,`#000000`),t.fillStyle=i,t.fillRect(0,0,1024,1024);let a=new p(e);return a.colorSpace=n,a.minFilter=r,a.magFilter=r,this._backdropTex=a,a}_buildProceduralEnv(){let e=document.createElement(`canvas`);e.width=1024,e.height=512;let t=e.getContext(`2d`),r=t.createLinearGradient(0,0,0,512);r.addColorStop(0,`#faf5e8`),r.addColorStop(.2,`#a4bcdc`),r.addColorStop(.45,`#3f5074`),r.addColorStop(.55,`#1c2340`),r.addColorStop(.8,`#0b1220`),r.addColorStop(1,`#000000`),t.fillStyle=r,t.fillRect(0,0,1024,512);let i=t.createLinearGradient(0,200,0,320);i.addColorStop(0,`rgba(0,0,0,0)`),i.addColorStop(.5,`rgba(255, 178, 96, 0.34)`),i.addColorStop(1,`rgba(0,0,0,0)`),t.fillStyle=i,t.fillRect(0,200,1024,120);let a=t.createRadialGradient(300,130,8,300,130,150);a.addColorStop(0,`rgba(255, 250, 232, 1.0)`),a.addColorStop(.35,`rgba(255, 235, 200, 0.55)`),a.addColorStop(1,`rgba(255, 235, 200, 0)`),t.fillStyle=a,t.fillRect(0,0,1024,512);let o=t.createRadialGradient(760,170,6,760,170,130);o.addColorStop(0,`rgba(190, 220, 255, 0.85)`),o.addColorStop(1,`rgba(190, 220, 255, 0)`),t.fillStyle=o,t.fillRect(0,0,1024,512);let s=new p(e);s.mapping=303,s.colorSpace=n;let c=new y(this.renderer);c.compileEquirectangularShader();let l=c.fromEquirectangular(s).texture;return s.dispose(),c.dispose(),l}_createGlow(){let e=document.createElement(`canvas`);e.width=e.height=512;let r=e.getContext(`2d`),i=r.createRadialGradient(256,256,8,256,256,240);i.addColorStop(0,`rgba(255, 240, 220, 0.55)`),i.addColorStop(.4,`rgba(140, 180, 255, 0.12)`),i.addColorStop(1,`rgba(0, 0, 0, 0)`),r.fillStyle=i,r.fillRect(0,0,512,512);let a=new p(e);a.colorSpace=n;let o=new g({map:a,transparent:!0,blending:2,depthWrite:!1,depthTest:!1,opacity:.85});this._glow=new t(o),this._glow.scale.set(6,6,1),this._glow.position.z=-.6,this.scene.add(this._glow)}_createDiamond(){let{positions:e,seeds:t}=G(this._isMobile?Math.floor(R*.55):R),n=new d;n.setAttribute(`position`,new x(e,3)),n.setAttribute(`aSeed`,new x(t,1)),n.scale(1.25,1.4,1.25);let r=new c({vertexShader:U,fragmentShader:W,uniforms:{uTime:{value:0},uMouseLocal:{value:new C(999,999,999)},uPixel:{value:Math.min(window.devicePixelRatio||1,2)}},transparent:!0,depthWrite:!1,blending:2});this.diamond=new _(n,r),this.diamond.rotation.x=-.18,this.scene.add(this.diamond)}_createBrilliantGeometry(e=24){let t=[],n=[],r=Math.PI/e,i=[[.62,0,0],[.62,.4,0],[.4,.7,r],[.08,1,0],[-.22,.88,r],[-.72,.42,0],[-1.08,0,0]],a=[];for(let[n,r,o]of i)if(a.push(t.length/3),r===0)t.push(0,n,0);else for(let i=0;i<e;i++){let a=i/e*Math.PI*2+o;t.push(Math.cos(a)*r,n,Math.sin(a)*r)}for(let t=0;t<i.length-1;t++){let[,r]=i[t],[,o]=i[t+1],s=a[t],c=a[t+1];if(r===0&&o>0)for(let t=0;t<e;t++){let r=(t+1)%e;n.push(s,c+t,c+r)}else if(r>0&&o===0)for(let t=0;t<e;t++){let r=(t+1)%e;n.push(s+t,s+r,c)}else for(let t=0;t<e;t++){let r=(t+1)%e;n.push(s+t,s+r,c+t),n.push(s+r,c+r,c+t)}}let o=new d;return o.setAttribute(`position`,new x(t,3)),o.setIndex(n),o}_addLights(){let e=new s(F,k);e.position.set(3.5,4,3.2),this.scene.add(e),this._lights.push(e);let t=new s(I,ee);t.position.set(-4,1,-2),this.scene.add(t),this._lights.push(t);let n=new s(L,A);n.position.set(0,-3,-4),this.scene.add(n),this._lights.push(n);let r=new u(1185830,.35);this.scene.add(r),this._lights.push(r)}_bindScroll(){this.lenis&&typeof this.lenis.on==`function`?(this.lenis.on(`scroll`,this._onLenisScroll),this._lenisScrollBound=!0):window.addEventListener(`scroll`,this._onNativeScroll,{passive:!0})}_onLenisScroll({scroll:e,limit:t}){this._scrollT=t>0?Math.min(e/t,1):0,this._maybeFadeCue()}_onNativeScroll(){let e=document.documentElement.scrollHeight-window.innerHeight;this._scrollT=e>0?Math.min(window.scrollY/e,1):0,this._maybeFadeCue()}_bindResize(){window.addEventListener(`resize`,this._onResize)}_onResize(){let e=window.innerWidth,t=window.innerHeight;this.camera&&(this.camera.aspect=e/t,this.camera.updateProjectionMatrix()),this.renderer&&this.renderer.setSize(e,t),this._isMobile=e<768||`ontouchstart`in window}_startCue(){this._reducedMotion||!this.scrollCue||(this._cueTween=v.to(this.scrollCue,{y:j,duration:M,ease:`sine.inOut`,yoyo:!0,repeat:-1}))}_maybeFadeCue(){this._cueFaded||!this.scrollCue||this._scrollT>.004&&(this._cueFaded=!0,this._cueTween?.kill(),v.to(this.scrollCue,{opacity:0,y:-6,duration:.6,ease:`power2.out`,onComplete:()=>this.scrollCue.style.pointerEvents=`none`}))}_observeBlocks(){this._observer=new IntersectionObserver(e=>{e.forEach(e=>{if(!e.isIntersecting||e.target.classList.contains(`is-revealed`))return;e.target.classList.add(`is-revealed`);let t=e.target.dataset.final===`true`?e.target.querySelector(`.holm-philosophy__cta`):null;if(this._reducedMotion){e.target.classList.add(`is-in`),t&&v.set(t,{opacity:1});return}let n=e.target.querySelectorAll(`.holm-philosophy__line-inner`);v.to(n,{yPercent:0,opacity:1,duration:1.15,stagger:.14,ease:`power3.out`}),t&&v.fromTo(t,{opacity:0,scale:.85},{opacity:1,scale:1,duration:.9,delay:.55,ease:`power3.out`})})},{threshold:.35,rootMargin:`0px 0px -8% 0px`}),this.blocks.forEach(e=>this._observer.observe(e))}_bindCtaMagnetic(){if(this._reducedMotion)return;let e=this.container.querySelector(`.holm-philosophy__cta`),t=this.container.querySelector(`.holm-philosophy__cta-inner`);!e||!t||(this._ctaEl=e,v.set(e,{opacity:0,x:0,y:0}),v.set(t,{x:0,y:0}),this._ctaSetX=v.quickTo(e,`x`,{duration:.55,ease:`power3`}),this._ctaSetY=v.quickTo(e,`y`,{duration:.55,ease:`power3`}),this._ctaInnerSetX=v.quickTo(t,`x`,{duration:.75,ease:`power3`}),this._ctaInnerSetY=v.quickTo(t,`y`,{duration:.75,ease:`power3`}),this._ctaMove=t=>{let n=e.getBoundingClientRect(),r=n.left+n.width/2,i=n.top+n.height/2,a=t.clientX-r,o=t.clientY-i,s=Math.hypot(a,o),c=n.width*1.35;if(s>c){this._ctaSetX(0),this._ctaSetY(0),this._ctaInnerSetX(0),this._ctaInnerSetY(0),e.classList.remove(`is-magnetic`);return}let l=(1-s/c)*.4;this._ctaSetX(a*l),this._ctaSetY(o*l),this._ctaInnerSetX(a*l*.35),this._ctaInnerSetY(o*l*.35),e.classList.add(`is-magnetic`)},this._ctaLeave=()=>{this._ctaSetX(0),this._ctaSetY(0),this._ctaInnerSetX(0),this._ctaInnerSetY(0),e.classList.remove(`is-magnetic`)},window.addEventListener(`mousemove`,this._ctaMove,{passive:!0}),window.addEventListener(`mouseleave`,this._ctaLeave))}_computeBeatTarget(){if(!this._beatEls||this._beatEls.length===0)return{x:0,y:0,scale:1};let e=window.innerHeight,t=e/2,n=e*P,r=0,i=0,a=0,o=0;for(let{el:e,beat:s}of this._beatEls){let c=e.getBoundingClientRect(),l=c.top+c.height/2,u=Math.abs(l-t),d=Math.max(0,1-u/n),f=d*d*(3-2*d);r+=f,i+=s.x*f,a+=s.y*f,o+=s.scale*f}if(r<.001){let e=0,n=1/0;this._beatEls.forEach(({el:r},i)=>{let a=r.getBoundingClientRect(),o=a.top+a.height/2,s=Math.abs(o-t);s<n&&(n=s,e=i)});let r=this._beatEls[e].beat;return{x:r.x,y:r.y,scale:r.scale}}return{x:i/r,y:a/r,scale:o/r}}_startLoop(){this._active=!0,this._prevTime=performance.now();let e=t=>{if(!this._active)return;let n=(t-this._prevTime)/1e3,r=Math.min(n,.05);this._prevTime=t,this._idleSpin+=w*r;let i=this._reducedMotion?{x:0,y:0,scale:1.2}:this._computeBeatTarget(),a=this.camera.fov*Math.PI/360,o=Math.tan(a)*D,s=o*this.camera.aspect,c=this._isMobile?i.x*.2:i.x,l=i.y;this._targetPos.set(c*s,l*o,0);let u=1-(1-T)**(r*60);this.diamond.position.lerp(this._targetPos,u);let d=this.diamond.scale.x+(i.scale-this.diamond.scale.x)*u;if(this.diamond.scale.setScalar(d),this._glow){this._glow.position.x=this.diamond.position.x,this._glow.position.y=this.diamond.position.y,this._glow.position.z=-.6;let e=d*4.4;this._glow.scale.set(e,e,1)}if(this._heroPlane){let e=Math.max(0,1-this._scrollT*4),t=e*e*(3-2*e);this._heroPlane.material.opacity=t,this._heroPlane.visible=t>.005}let f=this._reducedMotion?-.18:-.18+Math.sin(this._scrollT*Math.PI)*E;this.diamond.rotation.y=this._idleSpin,this.diamond.rotation.x=f;let p=this.diamond.position.z-this.camera.position.z,m=Math.tan(a)*Math.abs(p),h=m*this.camera.aspect;this._mouseWorld.set(this._mouseNdc.x*h+this.diamond.position.x,this._mouseNdc.y*m+this.diamond.position.y,this.diamond.position.z),this._mouseWorldSmooth.lerp(this._mouseWorld,H),this.diamond.updateMatrixWorld();let g=this.diamond.material.uniforms.uMouseLocal.value;g.copy(this._mouseWorldSmooth),this.diamond.worldToLocal(g),this._elapsed+=r,this.diamond.material.uniforms.uTime.value=this._elapsed,this.renderer.render(this.scene,this.camera),this._rafId=requestAnimationFrame(e)};this._rafId=requestAnimationFrame(e)}},X=new i(window.innerWidth<768||`ontouchstart`in window?{smoothTouch:!1,touchMultiplier:.75}:{duration:1.6,smoothWheel:!0,wheelMultiplier:.55,touchMultiplier:1.2,smoothTouch:!1});v.ticker.lagSmoothing(0);function Z(e){X.raf(e),requestAnimationFrame(Z)}requestAnimationFrame(Z);var Q=new b({lenis:X});Q.mount();var $=new Y({lenis:X});$.init(),window.addEventListener(`pagehide`,()=>{$.destroy(),Q.destroy?.(),X.destroy?.()});