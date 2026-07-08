import{B as e,C as t,Ft as n,Kt as r,M as i,Nt as a,St as o,Wt as s,X as c,Xt as l,at as u,bt as d,d as f,dt as p,f as m,ft as h,g,i as _,k as v,kt as ee,l as y,lt as b,n as x,o as S,ot as C,qt as w,r as te,s as ne,st as re,t as ie,u as ae,v as oe,vt as T,w as E,xt as D,y as O}from"./menu-0hhtnfiO.js";var k=class extends n{constructor(){super(),this.name=`RoomEnvironment`,this.position.y=-3.5;let t=new g;t.deleteAttribute(`uv`);let n=new h({side:1}),r=new h,i=new o(16777215,900,28,2);i.position.set(.418,16.199,.3),this.add(i);let a=new C(t,n);a.position.set(-.757,13.219,.717),a.scale.set(31.713,28.305,28.591),this.add(a);let s=new e(t,r,6),c=new T;c.position.set(-10.906,2.009,1.846),c.rotation.set(0,-.195,0),c.scale.set(2.328,7.905,4.651),c.updateMatrix(),s.setMatrixAt(0,c.matrix),c.position.set(-5.607,-.754,-.758),c.rotation.set(0,.994,0),c.scale.set(1.97,1.534,3.955),c.updateMatrix(),s.setMatrixAt(1,c.matrix),c.position.set(6.167,.857,7.803),c.rotation.set(0,.561,0),c.scale.set(3.927,6.285,3.687),c.updateMatrix(),s.setMatrixAt(2,c.matrix),c.position.set(-2.017,.018,6.124),c.rotation.set(0,.333,0),c.scale.set(2.002,4.566,2.064),c.updateMatrix(),s.setMatrixAt(3,c.matrix),c.position.set(2.291,-.756,-2.621),c.rotation.set(0,-.286,0),c.scale.set(1.546,1.552,1.496),c.updateMatrix(),s.setMatrixAt(4,c.matrix),c.position.set(-2.193,-.369,-5.547),c.rotation.set(0,.516,0),c.scale.set(3.875,3.487,2.986),c.updateMatrix(),s.setMatrixAt(5,c.matrix),this.add(s);let l=new C(t,A(50));l.position.set(-16.116,14.37,8.208),l.scale.set(.1,2.428,2.739),this.add(l);let u=new C(t,A(50));u.position.set(-16.109,18.021,-8.207),u.scale.set(.1,2.425,2.751),this.add(u);let d=new C(t,A(17));d.position.set(14.904,12.198,-1.832),d.scale.set(.15,4.265,6.331),this.add(d);let f=new C(t,A(43));f.position.set(-.462,8.89,14.52),f.scale.set(4.38,5.441,.088),this.add(f);let p=new C(t,A(20));p.position.set(3.235,11.486,-12.541),p.scale.set(2.5,2,.1),this.add(p);let m=new C(t,A(100));m.position.set(0,20,0),m.scale.set(1,.1,1),this.add(m)}dispose(){let e=new Set;this.traverse(t=>{t.isMesh&&(e.add(t.geometry),e.add(t.material))});for(let t of e)t.dispose()}};function A(e){return new b({color:0,emissive:16777215,emissiveIntensity:e})}var j={name:`OutputShader`,uniforms:{tDiffuse:{value:null},toneMappingExposure:{value:1}},vertexShader:`
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

		}`},M=class extends ne{constructor(){super(),this.isOutputPass=!0,this.uniforms=s.clone(j.uniforms),this.material=new ee({name:j.name,uniforms:this.uniforms,vertexShader:j.vertexShader,fragmentShader:j.fragmentShader}),this._fsQuad=new S(this.material),this._outputColorSpace=null,this._toneMapping=null}render(e,t,n){this.uniforms.tDiffuse.value=n.texture,this.uniforms.toneMappingExposure.value=e.toneMappingExposure,(this._outputColorSpace!==e.outputColorSpace||this._toneMapping!==e.toneMapping)&&(this._outputColorSpace=e.outputColorSpace,this._toneMapping=e.toneMapping,this.material.defines={},E.getTransfer(this._outputColorSpace)===`srgb`&&(this.material.defines.SRGB_TRANSFER=``),this._toneMapping===1?this.material.defines.LINEAR_TONE_MAPPING=``:this._toneMapping===2?this.material.defines.REINHARD_TONE_MAPPING=``:this._toneMapping===3?this.material.defines.CINEON_TONE_MAPPING=``:this._toneMapping===4?this.material.defines.ACES_FILMIC_TONE_MAPPING=``:this._toneMapping===6?this.material.defines.AGX_TONE_MAPPING=``:this._toneMapping===7?this.material.defines.NEUTRAL_TONE_MAPPING=``:this._toneMapping===5&&(this.material.defines.CUSTOM_TONE_MAPPING=``),this.material.needsUpdate=!0),this.renderToScreen===!0?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this._fsQuad.render(e))}dispose(){this.material.dispose(),this._fsQuad.dispose()}},N=.16,P=.09,F=.18,I=5.6,L=1.85,R=4.4,z=.95,B=.75,V=[{x:0,y:0,scale:1.2,side:null,hasText:!1},{x:.34,y:.03,scale:1,side:`left`,hasText:!0},{x:-.34,y:-.05,scale:1.24,side:`right`,hasText:!0},{x:0,y:.08,scale:.62,side:`left`,hasText:!0},{x:-.3,y:.06,scale:1.18,side:`right`,hasText:!0},{x:.28,y:-.04,scale:1.28,side:`left`,hasText:!0},{x:0,y:.02,scale:1.35,side:`center-below`,hasText:!0}],H=1,U=16773852,W=9023716,G=12108014,K=.012,q=1.05;`${K.toFixed(4)}${q.toFixed(4)}${q.toFixed(4)}${.35.toFixed(4)}${320 .toFixed(1)}`;var J=[[`Some studios tell stories.`,`We work toward a single moment.`],[`The moment a rough idea holds still —`,`and becomes something finished.`],[`It is rare. It forms under pressure.`,`The way carbon becomes a diamond.`],[`So that is the shape we keep returning to.`,`Not decoration. A reminder of what we are after.`],[`Between sketch and masterpiece,`,`there is patience.`],[`Ready to create your moment.`]],Y=`Let's talk`,se=`/contact/`,ce=class{constructor({lenis:e}={}){this.lenis=e||null,this._reducedMotion=window.matchMedia(`(prefers-reduced-motion: reduce)`).matches,this._isMobile=window.innerWidth<768||`ontouchstart`in window,this.renderer=null,this.scene=null,this.camera=null,this.diamond=null,this.envMap=null,this._lights=[],this._heroPlane=null,this.container=null,this.canvas=null,this.blocks=[],this._rafId=null,this._active=!1,this._prevTime=0,this._scrollT=0,this._idleSpin=0,this._ctaEl=null,this._ctaMove=null,this._ctaLeave=null,this._ctaSetX=null,this._ctaSetY=null,this._ctaInnerSetX=null,this._ctaInnerSetY=null,this._targetPos=new w,this._targetScale=new w(1,1,1),this._targetTilt=0,this._pressure=0,this._mouseNdc=new r(-99,-99),this._mouseWorld=new w,this._mouseWorldSmooth=new w(999,999,999),this._invMat=new u,this._elapsed=0,this._onResize=this._onResize.bind(this),this._onLenisScroll=this._onLenisScroll.bind(this),this._onNativeScroll=this._onNativeScroll.bind(this),this._onPointerMove=this._onPointerMove.bind(this),this._observer=null}init(){this._createDOM(),this._createThree(),this._bindScroll(),this._bindResize(),this._bindPointer(),this._observeBlocks(),this._bindCtaMagnetic(),this._startLoop()}_bindPointer(){window.addEventListener(`pointermove`,this._onPointerMove,{passive:!0})}_onPointerMove(e){this._mouseNdc.set(e.clientX/window.innerWidth*2-1,-(e.clientY/window.innerHeight*2-1))}destroy(){this._active=!1,this._rafId&&cancelAnimationFrame(this._rafId),window.removeEventListener(`resize`,this._onResize),window.removeEventListener(`pointermove`,this._onPointerMove),this.lenis&&this._lenisScrollBound?this.lenis.off(`scroll`,this._onLenisScroll):window.removeEventListener(`scroll`,this._onNativeScroll),this._observer&&this._observer.disconnect(),this._ctaMove&&window.removeEventListener(`mousemove`,this._ctaMove),this._ctaLeave&&window.removeEventListener(`mouseleave`,this._ctaLeave),this.diamond&&(this.diamond.geometry.dispose(),this.diamond.material.dispose()),this._heroPlane&&(this._heroPlane.geometry.dispose(),this._heroPlane.material.map?.dispose(),this._heroPlane.material.dispose()),this.envMap&&this.envMap.dispose();for(let e of this._lights)this.scene?.remove(e);this.renderer&&(this.renderer.dispose(),this.renderer.forceContextLoss?.()),this.container?.parentNode&&this.container.parentNode.removeChild(this.container),this.renderer=this.scene=this.camera=null,this.diamond=this.envMap=null,this.container=this.canvas=null}_createDOM(){let e=document.createElement(`div`);e.className=`holm-philosophy`,this._reducedMotion&&e.classList.add(`is-reduced-motion`);let t=0;if(e.innerHTML=`
      <canvas class="holm-philosophy__canvas" aria-hidden="true"></canvas>

      <section class="holm-philosophy__intro" data-beat="0" aria-hidden="true"></section>

      <main class="holm-philosophy__beats">
        ${V.map((e,n)=>{if(!e.hasText)return``;let r=J[t],i=t===J.length-1;t++;let a=r.map(e=>`
          <div class="holm-philosophy__line">
            <span class="holm-philosophy__line-inner">${e}</span>
          </div>
        `).join(``),o=i?`
          <a class="holm-philosophy__cta" href="${se}" aria-label="${Y}">
            <span class="holm-philosophy__cta-ring" aria-hidden="true"></span>
            <span class="holm-philosophy__cta-inner">
              <span class="holm-philosophy__cta-stack">
                <span class="holm-philosophy__cta-label">${Y}</span>
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
    `,document.body.appendChild(e),this.container=e,this.canvas=e.querySelector(`.holm-philosophy__canvas`),this.blocks=[...e.querySelectorAll(`.holm-philosophy__beat`)],this._beatEls=[],e.querySelectorAll(`[data-beat]`).forEach(e=>{let t=parseInt(e.dataset.beat,10);Number.isFinite(t)&&V[t]&&this._beatEls.push({el:e,beat:V[t]})}),!this._reducedMotion){let t=e.querySelectorAll(`.holm-philosophy__line-inner`);y.set(t,{yPercent:108,opacity:0})}}_createThree(){this.renderer=new f({canvas:this.canvas,antialias:!0,alpha:!1,powerPreference:`high-performance`}),this.renderer.setPixelRatio(Math.min(window.devicePixelRatio,this._isMobile?1.5:2)),this.renderer.setSize(window.innerWidth,window.innerHeight),this.renderer.toneMapping=4,this.renderer.toneMappingExposure=1.05,this.renderer.outputColorSpace=a,this.scene=new n,this.scene.background=this._buildBackdrop(),this.camera=new d(36,window.innerWidth/window.innerHeight,.1,100),this.camera.position.set(0,0,I),this.camera.lookAt(0,0,0);let e=new ae(this.renderer),t=new k;this.envMap=e.fromScene(t,.04).texture,e.dispose(),this.scene.environment=this.envMap,this.scene.environmentIntensity=L,this._composer=new _(this.renderer),this._composer.setPixelRatio(this.renderer.getPixelRatio()),this._composer.setSize(window.innerWidth,window.innerHeight),this._composer.addPass(new te(this.scene,this.camera)),this._bloom=new x(new r(window.innerWidth,window.innerHeight),.85,.55,.82),this._composer.addPass(this._bloom),this._composer.addPass(new M),this._createDiamond(),this._createHeroPlane(),this._addLights()}_createHeroPlane(){let e=document.createElement(`canvas`);e.width=2560,e.height=640;let t=e.getContext(`2d`);t.fillStyle=`rgba(224, 236, 255, 0.28)`,t.font=`italic 300 480px 'Fraunces', 'Times New Roman', serif`,t.textAlign=`center`,t.textBaseline=`middle`,t.fillText(`philosophy`,e.width/2,e.height/2+30);let n=new O(e);n.colorSpace=a,n.minFilter=c,n.magFilter=c,n.anisotropy=this.renderer.capabilities.getMaxAnisotropy();let r=new re({map:n,transparent:!0,depthWrite:!1,opacity:1}),i=I- -8,o=this.camera.fov*Math.PI/360,s=Math.tan(o)*i*this.camera.aspect,l=Math.max(s*2*1.15,20),u=new D(l,l/(e.width/e.height));this._heroPlane=new C(u,r),this._heroPlane.position.z=-8,this._heroPlane.renderOrder=-1,this.scene.add(this._heroPlane)}_buildBackdrop(){return new t(0)}_createDiamond(){let e=this._createBrilliantGeometry(48);e.scale(1.25,1.4,1.25),e.computeVertexNormals();let n=new p({color:16777215,metalness:0,roughness:0,transmission:1,thickness:this._isMobile?1.2:1.8,ior:2.417,attenuationDistance:6,attenuationColor:new t(16777215),envMapIntensity:2.2,iridescence:.35,iridescenceIOR:1.55,iridescenceThicknessRange:[400,900],clearcoat:1,clearcoatRoughness:0,transparent:!0,side:2});`dispersion`in n&&(n.dispersion=3.2),this.diamond=new C(e,n),this.diamond.rotation.x=-.18,this.scene.add(this.diamond)}_createBrilliantGeometry(e=24){let t=[],n=[],r=Math.PI/e,a=[[.62,0,0],[.62,.4,0],[.4,.7,r],[.08,1,0],[-.22,.88,r],[-.72,.42,0],[-1.08,0,0]],o=[];for(let[n,r,i]of a)if(o.push(t.length/3),r===0)t.push(0,n,0);else for(let a=0;a<e;a++){let o=a/e*Math.PI*2+i;t.push(Math.cos(o)*r,n,Math.sin(o)*r)}for(let t=0;t<a.length-1;t++){let[,r]=a[t],[,i]=a[t+1],s=o[t],c=o[t+1];if(r===0&&i>0)for(let t=0;t<e;t++){let r=(t+1)%e;n.push(s,c+t,c+r)}else if(r>0&&i===0)for(let t=0;t<e;t++){let r=(t+1)%e;n.push(s+t,s+r,c)}else for(let t=0;t<e;t++){let r=(t+1)%e;n.push(s+t,s+r,c+t),n.push(s+r,c+r,c+t)}}let s=new oe;return s.setAttribute(`position`,new i(t,3)),s.setIndex(n),s}_addLights(){let e=new v(U,R);e.position.set(3.5,4,3.2),this.scene.add(e),this._lights.push(e);let t=new v(W,z);t.position.set(-4,1,-2),this.scene.add(t),this._lights.push(t);let n=new v(G,B);n.position.set(0,-3,-4),this.scene.add(n),this._lights.push(n);let r=new m(1185830,.35);this.scene.add(r),this._lights.push(r)}_bindScroll(){this.lenis&&typeof this.lenis.on==`function`?(this.lenis.on(`scroll`,this._onLenisScroll),this._lenisScrollBound=!0):window.addEventListener(`scroll`,this._onNativeScroll,{passive:!0})}_onLenisScroll({scroll:e,limit:t}){this._scrollT=t>0?Math.min(e/t,1):0}_onNativeScroll(){let e=document.documentElement.scrollHeight-window.innerHeight;this._scrollT=e>0?Math.min(window.scrollY/e,1):0}_bindResize(){window.addEventListener(`resize`,this._onResize)}_onResize(){let e=window.innerWidth,t=window.innerHeight;this.camera&&(this.camera.aspect=e/t,this.camera.updateProjectionMatrix()),this.renderer&&this.renderer.setSize(e,t),this._composer&&this._composer.setSize(e,t),this._bloom&&this._bloom.setSize(e,t),this._isMobile=e<768||`ontouchstart`in window}_observeBlocks(){this._observer=new IntersectionObserver(e=>{e.forEach(e=>{if(!e.isIntersecting||e.target.classList.contains(`is-revealed`))return;e.target.classList.add(`is-revealed`);let t=e.target.dataset.final===`true`?e.target.querySelector(`.holm-philosophy__cta`):null;if(this._reducedMotion){e.target.classList.add(`is-in`),t&&y.set(t,{opacity:1});return}let n=e.target.querySelectorAll(`.holm-philosophy__line-inner`);y.to(n,{yPercent:0,opacity:1,duration:1.15,stagger:.14,ease:`power3.out`}),t&&y.fromTo(t,{opacity:0,scale:.85},{opacity:1,scale:1,duration:.9,delay:.55,ease:`power3.out`})})},{threshold:.35,rootMargin:`0px 0px -8% 0px`}),this.blocks.forEach(e=>this._observer.observe(e))}_bindCtaMagnetic(){if(this._reducedMotion)return;let e=this.container.querySelector(`.holm-philosophy__cta`),t=this.container.querySelector(`.holm-philosophy__cta-inner`);!e||!t||(this._ctaEl=e,y.set(e,{opacity:0,x:0,y:0}),y.set(t,{x:0,y:0}),this._ctaSetX=y.quickTo(e,`x`,{duration:.55,ease:`power3`}),this._ctaSetY=y.quickTo(e,`y`,{duration:.55,ease:`power3`}),this._ctaInnerSetX=y.quickTo(t,`x`,{duration:.75,ease:`power3`}),this._ctaInnerSetY=y.quickTo(t,`y`,{duration:.75,ease:`power3`}),this._ctaMove=t=>{let n=e.getBoundingClientRect(),r=n.left+n.width/2,i=n.top+n.height/2,a=t.clientX-r,o=t.clientY-i,s=Math.hypot(a,o),c=n.width*1.35;if(s>c){this._ctaSetX(0),this._ctaSetY(0),this._ctaInnerSetX(0),this._ctaInnerSetY(0),e.classList.remove(`is-magnetic`);return}let l=(1-s/c)*.4;this._ctaSetX(a*l),this._ctaSetY(o*l),this._ctaInnerSetX(a*l*.35),this._ctaInnerSetY(o*l*.35),e.classList.add(`is-magnetic`)},this._ctaLeave=()=>{this._ctaSetX(0),this._ctaSetY(0),this._ctaInnerSetX(0),this._ctaInnerSetY(0),e.classList.remove(`is-magnetic`)},window.addEventListener(`mousemove`,this._ctaMove,{passive:!0}),window.addEventListener(`mouseleave`,this._ctaLeave))}_computeBeatTarget(){if(!this._beatEls||this._beatEls.length===0)return{x:0,y:0,scale:1};let e=window.innerHeight,t=e/2,n=e*H,r=0,i=0,a=0,o=0;for(let{el:e,beat:s}of this._beatEls){let c=e.getBoundingClientRect(),l=c.top+c.height/2,u=Math.abs(l-t),d=Math.max(0,1-u/n),f=d*d*(3-2*d);r+=f,i+=s.x*f,a+=s.y*f,o+=s.scale*f}if(r<.001){let e=0,n=1/0;this._beatEls.forEach(({el:r},i)=>{let a=r.getBoundingClientRect(),o=a.top+a.height/2,s=Math.abs(o-t);s<n&&(n=s,e=i)});let r=this._beatEls[e].beat;return{x:r.x,y:r.y,scale:r.scale}}return{x:i/r,y:a/r,scale:o/r}}_startLoop(){this._active=!0,this._prevTime=performance.now();let e=t=>{if(!this._active)return;let n=(t-this._prevTime)/1e3,r=Math.min(n,.05);this._prevTime=t,this._idleSpin+=N*r;let i=this._reducedMotion?{x:0,y:0,scale:1.2}:this._computeBeatTarget(),a=this.camera.fov*Math.PI/360,o=Math.tan(a)*I,s=o*this.camera.aspect,c=this._isMobile?i.x*.2:i.x,l=i.y;this._targetPos.set(c*s,l*o,0);let u=1-(1-P)**(r*60);this.diamond.position.lerp(this._targetPos,u);let d=this.diamond.scale.x+(i.scale-this.diamond.scale.x)*u;if(this.diamond.scale.setScalar(d),this._heroPlane){let e=Math.max(0,1-this._scrollT*4),t=e*e*(3-2*e);this._heroPlane.material.opacity=t,this._heroPlane.visible=t>.005}let f=this._reducedMotion?-.18:-.18+Math.sin(this._scrollT*Math.PI)*F;this.diamond.rotation.y=this._idleSpin,this.diamond.rotation.x=f,this._elapsed+=r,this._composer.render(),this._rafId=requestAnimationFrame(e)};this._rafId=requestAnimationFrame(e)}},X=new l(window.innerWidth<768||`ontouchstart`in window?{smoothTouch:!1,touchMultiplier:.75}:{duration:1.6,smoothWheel:!0,wheelMultiplier:.55,touchMultiplier:1.2,smoothTouch:!1});y.ticker.lagSmoothing(0);function Z(e){X.raf(e),requestAnimationFrame(Z)}requestAnimationFrame(Z);var Q=new ie({lenis:X});Q.mount();var $=new ce({lenis:X});$.init(),window.addEventListener(`pagehide`,()=>{$.destroy(),Q.destroy?.(),X.destroy?.()});