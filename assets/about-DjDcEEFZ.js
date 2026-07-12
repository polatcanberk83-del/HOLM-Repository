import{Ct as e,Dt as t,E as n,Et as r,Ht as i,R as a,Vt as o,Yt as s,_ as c,a as l,an as u,d,en as f,et as p,f as m,gt as h,i as g,m as _,n as v,o as y,p as b,qt as x,r as S,t as C,tn as w,ut as T,v as E,wt as D,zt as O}from"./pageTransition-efsQGd-Y.js";import{n as k,t as A}from"./DRACOLoader-BWAV3hqk.js";import{n as j,t as M}from"./OutputPass-DHAD6ovz.js";import{t as N}from"./holm new logo-CRytMo6V.js";var P=`
uniform float uTime;
uniform float uAmp;
uniform float uFreq;
uniform vec2  uMouse;
uniform float uMouseStrength;
varying vec2  vUv;
varying float vShade;

void main() {
  vUv = uv;
  vec3 pos = position;

  float w1 = sin(pos.x * uFreq          + uTime * 0.85);
  float w2 = sin(pos.y * uFreq * 0.82   - uTime * 0.62 + 0.5);
  float wave = (w1 + w2 * 0.72) * uAmp;

  // Radial bulge toward the mouse position (in plane space)
  float md = distance(pos.xy, uMouse);
  float mouseWave = exp(-md * 3.4) * uAmp * 3.2 * uMouseStrength;

  pos.z += wave + mouseWave;

  // Fake illumination — brighter on positive-z tilt, darker on negative
  vShade = 0.86 + wave * 3.4 + mouseWave * 2.2;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`,F=`
uniform sampler2D uMap;
uniform float     uOpacity;
varying vec2      vUv;
varying float     vShade;

void main() {
  vec4 col = texture2D(uMap, vUv);
  gl_FragColor = vec4(col.rgb * vShade, col.a * uOpacity);
}
`,I=class{constructor(t,{imageUrl:n,subdivisions:a=[64,48],amp:c=.045,freq:l=3.4}={}){this.container=t,this._active=!0,this._prevMs=performance.now(),this.canvas=document.createElement(`canvas`),this.canvas.className=`holm-poster-wave__canvas`,Object.assign(this.canvas.style,{position:`absolute`,inset:`0`,width:`100%`,height:`100%`,display:`block`}),t.appendChild(this.canvas),this.renderer=new b({canvas:this.canvas,antialias:!0,alpha:!0}),this.renderer.setPixelRatio(Math.min(window.devicePixelRatio,2)),this.renderer.outputColorSpace=O,this.scene=new o,this.camera=new e(-1,1,1,-1,.1,10),this.camera.position.z=1,this._imageAspect=4/3,this._subdiv=a,this.material=new i({vertexShader:P,fragmentShader:F,uniforms:{uTime:{value:0},uAmp:{value:c},uFreq:{value:l},uMouse:{value:new f(-5,-5)},uMouseStrength:{value:0},uOpacity:{value:1},uMap:{value:null}},transparent:!0}),this.geometry=new r(2,2,...this._subdiv),this.mesh=new T(this.geometry,this.material),this.scene.add(this.mesh),new s().load(n,e=>{e.colorSpace=O,e.minFilter=p,e.magFilter=p,e.anisotropy=this.renderer.capabilities.getMaxAnisotropy(),this.material.uniforms.uMap.value=e,e.image?.width&&(this._imageAspect=e.image.width/e.image.height),this._resize();let n=t.querySelector(`img`);n&&(n.style.opacity=`0`)},void 0,e=>console.error(`[posterWave] texture failed to load`,e)),this._onPointerMove=this._onPointerMove.bind(this),this._onPointerLeave=this._onPointerLeave.bind(this),t.addEventListener(`pointermove`,this._onPointerMove,{passive:!0}),t.addEventListener(`pointerleave`,this._onPointerLeave),this._resizeObs=new ResizeObserver(()=>this._resize()),this._resizeObs.observe(t),this._resize(),this._tick=this._tick.bind(this),this._rafId=requestAnimationFrame(this._tick)}_resize(){let e=this.container.getBoundingClientRect(),t=Math.max(1,e.width),n=Math.max(1,e.height);this.renderer.setSize(t,n,!1);let i=t/n,a=this._imageAspect||4/3,o=2,s=2;i>a?s=a/i*2:o=i/a*2,this.geometry.dispose(),this.geometry=new r(o,s,...this._subdiv),this.mesh.geometry=this.geometry}_onPointerMove(e){let t=this.container.getBoundingClientRect(),n=(e.clientX-t.left)/t.width*2-1,r=-((e.clientY-t.top)/t.height*2-1),i=this.geometry.parameters.width*.5,a=this.geometry.parameters.height*.5;this.material.uniforms.uMouse.value.set(n*i,r*a),this._mouseStrTarget=1}_onPointerLeave(){this._mouseStrTarget=0,this.material.uniforms.uMouse.value.set(-5,-5)}_tick(e){if(!this._active)return;let t=Math.min((e-this._prevMs)/1e3,.05);this._prevMs=e,this.material.uniforms.uTime.value+=t;let n=this._mouseStrTarget??0,r=this.material.uniforms.uMouseStrength.value;this.material.uniforms.uMouseStrength.value=r+(n-r)*.12,this.renderer.render(this.scene,this.camera),this._rafId=requestAnimationFrame(this._tick)}destroy(){this._active=!1,this._rafId&&cancelAnimationFrame(this._rafId),this.container.removeEventListener(`pointermove`,this._onPointerMove),this.container.removeEventListener(`pointerleave`,this._onPointerLeave),this._resizeObs?.disconnect(),this.geometry.dispose(),this.material.dispose(),this.material.uniforms.uMap.value?.dispose?.(),this.renderer.dispose(),this.renderer.forceContextLoss?.(),this.canvas.parentNode&&this.canvas.parentNode.removeChild(this.canvas)}},L=new A;L.setDecoderPath(`https://www.gstatic.com/draco/versioned/decoders/1.5.6/`);var R=new k;R.setDRACOLoader(L);var z=.09,B=.04,V=.11,H=[{id:`intro`,side:`below`,eyebrow:`01 / Introduction`,portrait:!0,lines:[{head:!0,text:`Most websites vanish the second a tab is closed.`},{head:!0,text:`HOLM builds the ones that linger.`},{text:`We craft digital spaces that command attention, feel intensely considered, and elevate a brand to the level it truly belongs.`},{text:`Based in İzmir. Engineering for those who care deeply about how their work is seen.`}],cam:{pos:[.35,.72,1.05],look:[.05,.13,0]}},{id:`philosophy`,side:`left`,eyebrow:`02 / The Philosophy`,lines:[{head:!0,text:`I don't build websites. I build moments.`},{text:`The precise moments that dictate how a brand is remembered — rare, unyielding, and formed only under immense pressure.`},{text:`The way carbon becomes a diamond.`},{text:`That is the whole philosophy behind HOLM.`}],cam:{pos:[.05,.75,1.1],look:[0,.13,0]}},{id:`services`,side:`right`,eyebrow:`03 / What I Do`,compact:!0,lines:[{head:!0,text:`Experiences, Not Pages.`},{text:`A website shouldn't feel like a static document; it should feel like an event. The kind of experience visitors send to a friend before they've even finished scrolling.`},{head:!0,text:`Motion with Intent.`},{text:`Movement is never decoration. Everything responds, reveals, and pulls the user deeper into the narrative through purposeful creative coding.`},{head:!0,text:`The Premium Polish.`},{text:`The subtle, mathematical execution that makes a small studio look established, and an established brand look untouchable.`},{head:!0,text:`Undivided Execution.`},{text:`Concept, design, and code handled by the exact same hands. Nothing gets lost in translation.`}],cam:{pos:[-.25,.65,1.05],look:[0,.13,0]}},{id:`orwell`,side:`left`,eyebrow:`04 / Selected Work`,workImage:`/orwell-poster.png`,workLink:{href:`https://orwell.byholm.co`,label:`Visit orwell.byholm.co →`},lines:[{head:!0,text:`Orwell`},{text:`A dark, interactive conceptualization of George Orwell's 1984. The screen watches you back — and the deeper you read, the more the digital world closes in on you.`},{text:`Recognition: Awwwards Honorable Mention.`}],cam:{pos:[-.15,.78,1.1],look:[0,.13,0]}},{id:`connection`,side:`below`,eyebrow:`05 / Connection`,lines:[{head:!0,text:`Ready to create a moment worth remembering.`}],cam:{pos:[.15,.66,1.05],look:[.05,.13,0]},ctaLabel:`Say Hello`,ctaHref:`/contact/`}],U=1;function W(e){return e.split(` `).map(e=>e?`<span class="holm-about__word">${Array.from(e).map(e=>`<span class="holm-about__char">${e.replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`)}</span>`).join(``)}</span>`:``).join(` `)}var G=class{constructor({lenis:e}={}){this.lenis=e||null,this._reducedMotion=window.matchMedia(`(prefers-reduced-motion: reduce)`).matches,this._isMobile=window.innerWidth<768||`ontouchstart`in window,this.renderer=null,this.scene=null,this.camera=null,this.envMap=null,this._composer=null,this._lights=[],this._props={},this.container=null,this.canvas=null,this.blocks=[],this._rafId=null,this._active=!1,this._prevTime=0,this._elapsed=0,this._scrollT=0,this._targetPos=new w,this._targetLook=new w,this._lookNow=new w,this._ctaEl=null,this._ctaMove=null,this._ctaLeave=null,this._ctaSetX=null,this._ctaSetY=null,this._onResize=this._onResize.bind(this),this._onLenisScroll=this._onLenisScroll.bind(this),this._onNativeScroll=this._onNativeScroll.bind(this),this._observer=null}init(){this._createDOM(),this._createThree(),this._buildScene(),this._bindScroll(),this._bindResize(),this._observeBlocks(),this._bindCtaMagnetic(),this._mountPosterWaves(),this._startLoop()}_mountPosterWaves(){this._posterWaves=[],!this._reducedMotion&&this.container.querySelectorAll(`.holm-about__work-image-frame`).forEach(e=>{let t=e.querySelector(`img`);if(!(!t||!t.src))try{let n=new I(e,{imageUrl:t.src});this._posterWaves.push(n)}catch(e){console.warn(`[about] PosterWave init failed, keeping fallback img`,e)}})}destroy(){this._active=!1,this._rafId&&cancelAnimationFrame(this._rafId),window.removeEventListener(`resize`,this._onResize),this.lenis&&this._lenisScrollBound?this.lenis.off(`scroll`,this._onLenisScroll):window.removeEventListener(`scroll`,this._onNativeScroll),this._observer&&this._observer.disconnect(),this._ctaMove&&window.removeEventListener(`mousemove`,this._ctaMove),this._ctaLeave&&window.removeEventListener(`mouseleave`,this._ctaLeave),this._posterWaves?.forEach(e=>e.destroy()),this._posterWaves=[],this.scene?.traverse(e=>{e.geometry?.dispose?.();let t=e.material;Array.isArray(t)?t.forEach(e=>e.dispose?.()):t?.dispose?.()});for(let e of this._lights)this.scene?.remove(e);this.envMap?.dispose?.(),this.renderer&&(this.renderer.dispose(),this.renderer.forceContextLoss?.()),this.container?.parentNode&&this.container.parentNode.removeChild(this.container),this.renderer=this.scene=this.camera=null,this.container=this.canvas=null}_createDOM(){let e=document.createElement(`div`);e.className=`holm-about`,this._reducedMotion&&e.classList.add(`is-reduced-motion`);let t=H.map((e,t)=>{let n=e.lines.map(e=>`<div class="${e.head?`holm-about__line holm-about__line--head`:`holm-about__line`}">${W(e.text)}</div>`).join(``),r=e.portrait?`<div class="holm-about__portrait" aria-hidden="true">
             <img src="/portrait.png"
                  alt=""
                  onerror="this.style.display='none'" />
           </div>`:``,i=e.workImage?`<a class="holm-about__work-image"
              href="${e.workLink?.href||`#`}"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open ${e.eyebrow} project in a new tab">
             <span class="holm-about__work-image-frame">
               <img src="${e.workImage}"
                    alt=""
                    loading="lazy"
                    onerror="this.closest('.holm-about__work-image').classList.add('is-empty')" />
             </span>
           </a>`:``,a=e.workLink&&!e.workImage?`<a class="holm-about__work-link"
              href="${e.workLink.href}"
              target="_blank"
              rel="noopener noreferrer"
              data-hover-roll>${e.workLink.label}</a>`:e.workLink?`<a class="holm-about__work-link"
                href="${e.workLink.href}"
                target="_blank"
                rel="noopener noreferrer"
                data-hover-roll>${e.workLink.label}</a>`:``,o=e.ctaLabel?`<a class="holm-about__cta"
              href="${e.ctaHref}"
              aria-label="${e.ctaLabel}"
              data-hover-roll>${e.ctaLabel}</a>`:``,s=e.compact?` is-compact`:``,c=((t%2==0?-1:1)*(.9+t*.4%1.3)).toFixed(2),l=(7+t*11)%97,u=(23+t*17)%97,d=(41+t*13)%97,f=(-2.6*t).toFixed(1);return`
        <section class="holm-about__beat${s}"
                 data-beat="${t}"
                 data-side="${e.side}"
                 data-final="${!!e.ctaLabel}">
          <div class="holm-about__stanza">
            ${r}
            ${i}
            <div class="holm-about__paper"
                 style="--paper-rot:${c}deg; --paper-drift-delay:${f}s">
              <!-- Two backing sheets peek out behind the main sheet — the
                   torn edges + slight offset read as a real paper pile -->
              <div class="holm-about__paper-sheet holm-about__paper-sheet--back-2"
                   style="filter: url(#holm-paper-tear-${d})"></div>
              <div class="holm-about__paper-sheet holm-about__paper-sheet--back-1"
                   style="filter: url(#holm-paper-tear-${u})"></div>
              <div class="holm-about__paper-sheet holm-about__paper-sheet--main"
                   style="filter: url(#holm-paper-tear-${l})"></div>
              <!-- Corner curl — a torn triangle that reads as a peeled edge -->
              <div class="holm-about__paper-curl" aria-hidden="true"></div>
              <div class="holm-about__paper-body">
                <span class="holm-about__eyebrow">${e.eyebrow}</span>
                ${n}
                ${a}
              </div>
            </div>
            ${o}
          </div>
        </section>
      `}).join(``),n=new Set;e.innerHTML=`
      <canvas class="holm-about__canvas" aria-hidden="true"></canvas>
      <div class="holm-about__vignette" aria-hidden="true"></div>

      <!-- Global SVG defs — torn-paper filters (one seed per beat) -->
      <svg class="holm-about__svg-defs" width="0" height="0" aria-hidden="true">
        <defs>${H.map((e,t)=>[(7+t*11)%97,(23+t*17)%97,(41+t*13)%97].map(e=>n.has(e)?``:(n.add(e),`
          <filter id="holm-paper-tear-${e}"
                  x="-8%" y="-10%" width="116%" height="120%">
            <feTurbulence type="fractalNoise"
                          baseFrequency="0.012 0.018"
                          numOctaves="4"
                          seed="${e}"
                          result="noise"/>
            <feDisplacementMap in="SourceGraphic" in2="noise"
                               scale="22" xChannelSelector="R" yChannelSelector="G"/>
          </filter>
        `)).join(``)).join(``)}</defs>
      </svg>

      <a class="holm-about__brand" href="/" aria-label="HOLM — home">
        <img src="${N}" alt="HOLM" />
      </a>

      <section class="holm-about__intro" aria-hidden="true"></section>

      <main id="about-content"
            class="holm-about__beats"
            tabindex="-1"
            aria-label="HOLM about — five-part introduction">
        ${t}
      </main>
    `,document.body.appendChild(e),this.container=e,this.canvas=e.querySelector(`.holm-about__canvas`),this.blocks=[...e.querySelectorAll(`.holm-about__beat`)],this._beatEls=this.blocks.map(e=>({el:e,beat:H[parseInt(e.dataset.beat,10)]}));let r=e.querySelectorAll(`.holm-about__char`);d.set(r,{yPercent:0,opacity:1})}_createThree(){this.renderer=new b({canvas:this.canvas,antialias:!0,alpha:!1,powerPreference:`high-performance`}),this.renderer.setPixelRatio(Math.min(window.devicePixelRatio,this._isMobile?1.5:2)),this.renderer.setSize(window.innerWidth,window.innerHeight),this.renderer.toneMapping=4,this.renderer.toneMappingExposure=1.05,this.renderer.outputColorSpace=O,this.renderer.shadowMap.enabled=!this._isMobile,this.renderer.shadowMap.type=2,this.scene=new o,this.scene.background=new n(263688),this.scene.fog=new a(263688,.45),this.camera=new D(32,window.innerWidth/window.innerHeight,.05,12),this.camera.position.set(.35,.72,1.05),this.camera.lookAt(.05,.13,0);let e=new m(this.renderer),t=new j;this.envMap=e.fromScene(t,.04).texture,e.dispose(),this.scene.environment=this.envMap,this.scene.environmentIntensity=.35,this._composer=new y(this.renderer),this._composer.setPixelRatio(this.renderer.getPixelRatio()),this._composer.setSize(window.innerWidth,window.innerHeight),this._composer.addPass(new l(this.scene,this.camera)),this._composer.addPass(new M)}_buildScene(){let e=new h({color:1252140,roughness:.72,metalness:.15}),n=new T(new E(2.4,.08,1.6,16,1,12),e);n.position.set(0,-.04,0),n.receiveShadow=!this._isMobile,this.scene.add(n);let i=new h({color:197899,roughness:1,metalness:0}),a=new T(new r(12,12),i);a.rotation.x=-Math.PI/2,a.position.y=-.35,this.scene.add(a);let o=new h({color:528154,roughness:1,metalness:0}),s=new T(new r(6,3),o);s.position.set(0,.8,-1.2),this.scene.add(s),this._loadLaptop(),this._loadMug();let c=new x(14476543,260,3.5,.42,.95,1.6);c.position.set(.05,1.15,.55),c.target.position.set(0,0,0),c.castShadow=!this._isMobile,c.castShadow&&(c.shadow.mapSize.set(2048,2048),c.shadow.bias=-8e-4,c.shadow.radius=6),this.scene.add(c),this.scene.add(c.target),this._lights.push(c);let l=new t(7310782,90,2.2,2);l.position.set(.9,.5,-.55),this.scene.add(l),this._lights.push(l);let u=new t(8955092,24,1.2,2);u.position.set(0,.05,.5),this.scene.add(u),this._lights.push(u);let d=new _(1713472,.8);this.scene.add(d),this._lights.push(d),this.scene.environmentIntensity=.55}_loadLaptop(){R.load(`/models/about/laptop.glb`,e=>{let t=e.scene,n=new c().setFromObject(t),r=new w;n.getSize(r);let i=Math.max(r.x,r.y,r.z),a=i>0?.36/i:1;t.scale.setScalar(a),t.updateMatrixWorld(!0);let o=new c().setFromObject(t),s=new w;o.getCenter(s);let l=-o.min.y;t.position.set(-s.x,l,-s.z),t.traverse(e=>{e.isMesh&&(e.castShadow=!this._isMobile,e.receiveShadow=!this._isMobile)}),this.scene.add(t),this._props.laptop=t,console.log(`[about] laptop loaded — scale:`,a.toFixed(3))},void 0,e=>{console.error(`[about] laptop failed to load`,e)})}_loadMug(){R.load(`/models/about/mug.glb`,e=>{let t=e.scene,n=new c().setFromObject(t),r=new w;n.getSize(r);let i=Math.max(r.x,r.y,r.z),a=i>0?.1/i:1;t.scale.setScalar(a),t.updateMatrixWorld(!0);let o=new c().setFromObject(t),s=new w;o.getCenter(s);let l=-o.min.y;t.position.set(.32-s.x,l,-.05-s.z),t.traverse(e=>{e.isMesh&&(e.castShadow=!this._isMobile,e.receiveShadow=!this._isMobile,(Array.isArray(e.material)?e.material:[e.material]).forEach(t=>{!t||!t.color||(e.name===`Sphere008`||t.name===`Material.009`||/coffee|liquid|kahve|espresso/i.test((t.name||``)+` `+(e.name||``)))&&(t.color.setHex(656643),t.map=null,t.roughness=1,t.metalness=0,t.normalMap=null,t.roughnessMap=null,t.aoMap=null,t.envMapIntensity=.15,t.transparent=!1,t.opacity=1,t.side=0,`clearcoat`in t&&(t.clearcoat=0),`iridescence`in t&&(t.iridescence=0),`specularIntensity`in t&&(t.specularIntensity=0),`sheen`in t&&(t.sheen=0),`transmission`in t&&(t.transmission=0),`thickness`in t&&(t.thickness=0),t.needsUpdate=!0,console.log(`[about] mug: darkened coffee liquid →`,e.name,`/`,t.name))}))}),this.scene.add(t),this._props.mug=t,console.log(`[about] mug loaded — scale:`,a.toFixed(3))},void 0,e=>{console.error(`[about] mug failed to load`,e)})}_bindScroll(){this.lenis&&typeof this.lenis.on==`function`?(this.lenis.on(`scroll`,this._onLenisScroll),this._lenisScrollBound=!0):window.addEventListener(`scroll`,this._onNativeScroll,{passive:!0})}_onLenisScroll({scroll:e,limit:t}){this._scrollT=t>0?Math.min(e/t,1):0}_onNativeScroll(){let e=document.documentElement.scrollHeight-window.innerHeight;this._scrollT=e>0?Math.min(window.scrollY/e,1):0}_bindResize(){window.addEventListener(`resize`,this._onResize)}_onResize(){let e=window.innerWidth,t=window.innerHeight;this.camera&&(this.camera.aspect=e/t,this.camera.updateProjectionMatrix()),this.renderer&&this.renderer.setSize(e,t),this._composer&&this._composer.setSize(e,t),this._isMobile=e<768||`ontouchstart`in window}_observeBlocks(){let e=[`.holm-about__paper`,`.holm-about__portrait`,`.holm-about__work-image`].join(`,`),t=[...this.container.querySelectorAll(e)];this._cylSetters=t.map(e=>(e.style.willChange=`transform, opacity`,e.style.backfaceVisibility=`hidden`,d.set(e,{opacity:1,transformPerspective:700,transformOrigin:`50% 50%`}),{el:e,rotX:d.quickSetter(e,`rotationX`,`deg`),z:d.quickSetter(e,`z`,`px`),opacity:d.quickSetter(e,`opacity`)}))}_updateCylinder(){if(this._reducedMotion||!this._cylSetters)return;let e=window.innerHeight*.5,t=this._isMobile?42:65,n=this._isMobile?160:260,r=this._isMobile?.7:.85;for(let i=0;i<this._cylSetters.length;i++){let a=this._cylSetters[i],o=a.el.getBoundingClientRect(),s=(o.top+o.height*.5-e)/e;if(s<-1.35||s>1.35){a.opacity(0);continue}let c=s<-1.1?-1.1:s>1.1?1.1:s,l=Math.sign(c)*Math.abs(c)**1.35,u=-l*t,d=-(Math.abs(l)**1.2)*n,f=Math.max(0,1-Math.abs(l)**1.3*r);a.rotX(u),a.z(d),a.opacity(f)}}_bindCtaMagnetic(){if(this._reducedMotion)return;let e=this.container.querySelector(`.holm-about__cta`);e&&(this._ctaEl=e,d.set(e,{x:0,y:0}),this._ctaSetX=d.quickTo(e,`x`,{duration:.55,ease:`power3`}),this._ctaSetY=d.quickTo(e,`y`,{duration:.55,ease:`power3`}),this._ctaMove=t=>{let n=e.getBoundingClientRect(),r=n.left+n.width/2,i=n.top+n.height/2,a=t.clientX-r,o=t.clientY-i,s=Math.hypot(a,o),c=n.width*1.35;if(s>c){this._ctaSetX(0),this._ctaSetY(0),e.classList.remove(`is-magnetic`);return}let l=(1-s/c)*.4;this._ctaSetX(a*l),this._ctaSetY(o*l),e.classList.add(`is-magnetic`)},this._ctaLeave=()=>{this._ctaSetX(0),this._ctaSetY(0),e.classList.remove(`is-magnetic`)},window.addEventListener(`mousemove`,this._ctaMove,{passive:!0}),window.addEventListener(`mouseleave`,this._ctaLeave))}_computeCameraTarget(e,t){if(!this._beatEls.length){e.set(0,3.6,5.6),t.set(0,.35,-.2);return}let n=window.innerHeight,r=n/2,i=n*U,a=0,o=0,s=0,c=0,l=0,u=0,d=0;for(let{el:e,beat:t}of this._beatEls){let n=e.getBoundingClientRect(),f=n.top+n.height/2,p=Math.abs(f-r),m=Math.max(0,1-p/i),h=m*m*(3-2*m);a+=h,o+=t.cam.pos[0]*h,s+=t.cam.pos[1]*h,c+=t.cam.pos[2]*h,l+=t.cam.look[0]*h,u+=t.cam.look[1]*h,d+=t.cam.look[2]*h}if(a<.001){let n=0,i=1/0;this._beatEls.forEach(({el:e},t)=>{let a=e.getBoundingClientRect(),o=a.top+a.height/2,s=Math.abs(o-r);s<i&&(i=s,n=t)});let a=this._beatEls[n].beat;e.set(a.cam.pos[0],a.cam.pos[1],a.cam.pos[2]),t.set(a.cam.look[0],a.cam.look[1],a.cam.look[2]);return}e.set(o/a,s/a,c/a),t.set(l/a,u/a,d/a)}_startLoop(){this._active=!0,this._prevTime=performance.now();let e=t=>{if(!this._active)return;let n=(t-this._prevTime)/1e3,r=Math.min(n,.05);if(this._prevTime=t,this._elapsed+=r,this._computeCameraTarget(this._targetPos,this._targetLook),!this._reducedMotion){let e=Math.sin(this._elapsed*V*Math.PI*2)*B;this._targetPos.x+=e}let i=1-(1-z)**(r*60);this.camera.position.lerp(this._targetPos,i),this._lookNow.lerp(this._targetLook,i),this.camera.lookAt(this._lookNow),this._props.diamond&&!this._reducedMotion&&(this._props.diamond.rotation.y+=r*.28),this._updateCylinder(),this._composer.render(),this._rafId=requestAnimationFrame(e)};this._rafId=requestAnimationFrame(e)}},K=new u(window.innerWidth<768||`ontouchstart`in window?{smoothTouch:!1,touchMultiplier:.75}:{duration:1.6,smoothWheel:!0,wheelMultiplier:.55,touchMultiplier:1.2,smoothTouch:!1});d.ticker.lagSmoothing(0);function q(e){K.raf(e),requestAnimationFrame(q)}requestAnimationFrame(q);var J=new g({lenis:K});J.mount();var Y=new G({lenis:K});Y.init(),S(document),C(),window.addEventListener(`load`,()=>{setTimeout(v,200)}),window.addEventListener(`pagehide`,()=>{Y.destroy(),J.destroy?.(),K.destroy?.()});