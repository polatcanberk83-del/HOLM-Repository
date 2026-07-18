import{$t as e,Et as t,F as n,Ht as r,N as i,P as a,Pt as o,S as s,T as c,Ut as l,Vt as u,Xt as d,an as f,et as p,f as m,h,ht as g,i as _,it as v,m as y,n as b,nn as x,o as ee,on as te,p as ne,r as re,s as ie,t as ae,tn as S,ut as C,v as w,wt as T,z as E,zt as D}from"./pageTransition-C1rQ-lDC.js";import{n as O,t as k}from"./holm new logo-JiLmqs7J.js";import{t as A}from"./RoomEnvironment-BiuEbDbv.js";var j=class extends v{constructor(e){super(e)}load(e,t,r,i){let a=this,o=new n(this.manager);o.setPath(this.path),o.setRequestHeader(this.requestHeader),o.setWithCredentials(this.withCredentials),o.load(e,function(e){let n=a.parse(JSON.parse(e));t&&t(n)},r,i)}parse(e){return new M(e)}},M=class{constructor(e){this.isFont=!0,this.type=`Font`,this.data=e}generateShapes(e,t=100,n=`ltr`){let r=[],i=N(e,t,this.data,n);for(let e=0,t=i.length;e<t;e++)r.push(...i[e].toShapes());return r}};function N(e,t,n,r){let i=Array.from(e),a=t/n.resolution,o=(n.boundingBox.yMax-n.boundingBox.yMin+n.underlineThickness)*a,s=[],c=0,l=0;(r==`rtl`||r==`tb`)&&i.reverse();for(let e=0;e<i.length;e++){let t=i[e];if(t===`
`)c=0,l-=o;else{let e=P(t,a,c,l,n);r==`tb`?(c=0,l+=n.ascender*a):c+=e.offsetX,s.push(e.path)}}return s}function P(e,t,n,r,i){let a=i.glyphs[e]||i.glyphs[`?`];if(!a){console.error(`THREE.Font: character "`+e+`" does not exists in font family `+i.familyName+`.`);return}let o=new l,s,c,u,d,f,p,m,h;if(a.o){let e=a._cachedOutline||=a.o.split(` `);for(let i=0,a=e.length;i<a;)switch(e[i++]){case`m`:s=e[i++]*t+n,c=e[i++]*t+r,o.moveTo(s,c);break;case`l`:s=e[i++]*t+n,c=e[i++]*t+r,o.lineTo(s,c);break;case`q`:u=e[i++]*t+n,d=e[i++]*t+r,f=e[i++]*t+n,p=e[i++]*t+r,o.quadraticCurveTo(f,p,u,d);break;case`b`:u=e[i++]*t+n,d=e[i++]*t+r,f=e[i++]*t+n,p=e[i++]*t+r,m=e[i++]*t+n,h=e[i++]*t+r,o.bezierCurveTo(f,p,m,h,u,d);break}}return{offsetX:a.ha*t,path:o}}var F=class e extends a{constructor(e,t={}){let n=t.font;if(n===void 0)super();else{let r=n.generateShapes(e,t.size,t.direction);t.depth===void 0&&(t.depth=50),t.bevelThickness===void 0&&(t.bevelThickness=10),t.bevelSize===void 0&&(t.bevelSize=8),t.bevelEnabled===void 0&&(t.bevelEnabled=!1),super(r,t)}this.type=`TextGeometry`}toJSON(){return super.toJSON()}static fromJSON(t){let n=t.options;return n.font=new M(n.font.data),new e(n.text,n)}},I=`
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`,L=`
uniform sampler2D uTexture;
uniform vec2  uResolution;
uniform vec2  uTextureSize;
uniform vec2  uMouse;
uniform float uParallaxStrength;
uniform float uDistortionMultiplier;
uniform float uGlassStrength;
uniform float ustripesFrequency;
uniform float uglassSmoothness;
uniform float uEdgePadding;

varying vec2 vUv;

vec2 getCoverUV(vec2 uv, vec2 textureSize) {
  if (textureSize.x < 1.0 || textureSize.y < 1.0) return uv;

  vec2 s = uResolution / textureSize;
  float scale = max(s.x, s.y);

  vec2 scaledSize = textureSize * scale;
  vec2 offset = (uResolution - scaledSize) * 0.5;

  return (uv * uResolution - offset) / scaledSize;
}

float displacement(float x, float num_stripes, float strength) {
  float modulus = 1.0 / num_stripes;
  return mod(x, modulus) * strength;
}

float fractalGlass(float x) {
  float d = 0.0;
  for (int i = -5; i <= 5; i++) {
    d += displacement(x + float(i) * uglassSmoothness, ustripesFrequency, uGlassStrength);
  }
  d = d / 11.0;
  return x + d;
}

float smoothEdge(float x, float padding) {
  float edge = padding;
  if (x < edge) {
    return smoothstep(0.0, edge, x);
  } else if (x > 1.0 - edge) {
    return smoothstep(1.0, 1.0 - edge, x);
  }
  return 1.0;
}

void main() {
  vec2 uv = vUv;
  float originalX = uv.x;

  float edgeFactor = smoothEdge(originalX, uEdgePadding);
  float distortedX = fractalGlass(originalX);
  uv.x = mix(originalX, distortedX, edgeFactor);

  float distortionFactor = uv.x - originalX;

  float parallaxDirection = -sign(0.5 - uMouse.x);
  vec2 parallaxOffset = vec2(
    parallaxDirection * abs(uMouse.x - 0.5) * uParallaxStrength * (1.0 + abs(distortionFactor) * uDistortionMultiplier),
    0.0
  );
  parallaxOffset *= edgeFactor;
  uv += parallaxOffset;

  vec2 coverUV = getCoverUV(uv, uTextureSize);
  if (coverUV.x < 0.0 || coverUV.x > 1.0 || coverUV.y < 0.0 || coverUV.y > 1.0) {
    coverUV = clamp(coverUV, 0.0, 1.0);
  }

  gl_FragColor = texture2D(uTexture, coverUV);
}
`,oe={imageUrl:null,lerpFactor:.035,parallaxStrength:.1,distortionMultiplier:10,glassStrength:2,glassSmoothness:1e-4,stripesFrequency:35,edgePadding:.1,respondsToPointer:!0},R=class{constructor(n,i={}){this.renderer=n,this.opts={...oe,...i};let a=window.innerWidth,c=window.innerHeight;this._target=new f(a,c,{minFilter:p,magFilter:p,format:o,type:e,depthBuffer:!1,stencilBuffer:!1}),this._target.texture.colorSpace=D,this._mat=new r({vertexShader:I,fragmentShader:L,uniforms:{uTexture:{value:null},uResolution:{value:new S(a,c)},uTextureSize:{value:new S(1,1)},uMouse:{value:new S(.5,.5)},uParallaxStrength:{value:this.opts.parallaxStrength},uDistortionMultiplier:{value:this.opts.distortionMultiplier},uGlassStrength:{value:this.opts.glassStrength},ustripesFrequency:{value:this.opts.stripesFrequency},uglassSmoothness:{value:this.opts.glassSmoothness},uEdgePadding:{value:this.opts.edgePadding}}}),this._quadCam=new s,this._quadScene=new u,this._quadMesh=new C(new t(2,2),this._mat),this._quadScene.add(this._quadMesh),this._mouse=new S(.5,.5),this._targetMouse=new S(.5,.5),this.opts.imageUrl&&this._loadImage(this.opts.imageUrl)}_loadImage(e){new d().load(e,e=>{e.colorSpace=D,e.minFilter=p,e.magFilter=p,e.wrapS=c,e.wrapT=c,this._mat.uniforms.uTexture.value=e;let t=e.image?.naturalWidth||e.image?.width||1,n=e.image?.naturalHeight||e.image?.height||1;this._mat.uniforms.uTextureSize.value.set(t,n),this._texture=e})}get texture(){return this._target.texture}setPointer(e,t){this.opts.respondsToPointer&&(this._targetMouse.x=e/window.innerWidth,this._targetMouse.y=1-t/window.innerHeight)}resize(){let e=window.innerWidth,t=window.innerHeight;this._target.setSize(e,t),this._mat.uniforms.uResolution.value.set(e,t)}step(){let e=this.opts.lerpFactor;this._mouse.x+=(this._targetMouse.x-this._mouse.x)*e,this._mouse.y+=(this._targetMouse.y-this._mouse.y)*e,this._mat.uniforms.uMouse.value.copy(this._mouse),this.renderer.setRenderTarget(this._target),this.renderer.clear(),this.renderer.render(this._quadScene,this._quadCam),this.renderer.setRenderTarget(null)}dispose(){this._target.dispose(),this._mat.dispose(),this._quadMesh.geometry.dispose(),this._texture?.dispose()}},z=`/assets/new%20contact%20img%203-uUuKEviS.png`,B=`/assets/droid_serif_regular.typeface-CEzF_7la.json`,V=6.2,H=1.05,U=1.15,W=5.6,G=.09,K=.16,q=.09,se=.13,ce=.09,le=.19,ue=14,J=.5,Y=[{id:`book`,label:`Book a call`,href:`#book`,external:!1},{id:`linkedin`,label:`LinkedIn`,href:`https://www.linkedin.com/in/canberk-polat-679bab403/`,external:!0},{id:`email`,label:`email`,href:`mailto:contact@byholm.co`,external:!1}],de=class{constructor(){this._reducedMotion=window.matchMedia(`(prefers-reduced-motion: reduce)`).matches,this._isMobile=window.innerWidth<768||`ontouchstart`in window,this.container=null,this.canvas=null,this.renderer=null,this.scene=null,this.camera=null,this.envMap=null,this._composer=null,this._bg=null,this._logoGroup=null,this._lights=[],this._rafId=null,this._active=!1,this._prevTime=0,this._elapsed=0,this._onResize=this._onResize.bind(this),this._onPointerMove=this._onPointerMove.bind(this)}init(){this._createDOM(),this._createThree(),this._createLogo(),window.addEventListener(`resize`,this._onResize),window.addEventListener(`pointermove`,this._onPointerMove,{passive:!0}),this._revealButtons(),this._startLoop()}destroy(){this._active=!1,this._rafId&&cancelAnimationFrame(this._rafId),window.removeEventListener(`resize`,this._onResize),window.removeEventListener(`pointermove`,this._onPointerMove),this._logoGroup&&this._logoGroup.traverse(e=>{e.geometry?.dispose(),e.material?.dispose()}),this.envMap?.dispose(),this._bg?.dispose();for(let e of this._lights)this.scene?.remove(e);this.renderer&&(this.renderer.dispose(),this.renderer.forceContextLoss?.()),this.container?.parentNode&&this.container.parentNode.removeChild(this.container),this.renderer=this.scene=this.camera=null,this.container=this.canvas=null}_createDOM(){let e=document.createElement(`div`);e.className=`holm-contact`,this._reducedMotion&&e.classList.add(`is-reduced-motion`),e.innerHTML=`
      <canvas class="holm-contact__canvas" aria-hidden="true"></canvas>
      <a class="holm-contact__brand" href="/" aria-label="HOLM — home">
        <img src="${k}" alt="HOLM" />
      </a>
      <main id="contact-content"
            class="holm-contact__stage"
            tabindex="-1"
            aria-label="HOLM contact">
        <div class="holm-contact__logo-anchor" aria-hidden="true"></div>
        <nav class="holm-contact__links" aria-label="Contact">
          ${Y.map(e=>`
      <a class="holm-contact__orb"
         href="${e.href}"
         data-link="${e.id}"
         ${e.external?`target="_blank" rel="noopener noreferrer"`:``}
         data-hover-roll
         data-hover-roll-copy="${e.label} →">
        <span class="holm-contact__orb-label">${e.label}</span>
      </a>
    `).join(``)}
        </nav>
      </main>
    `,document.body.appendChild(e),this.container=e,this.canvas=e.querySelector(`.holm-contact__canvas`)}_revealButtons(){let e=this.container.querySelectorAll(`.holm-contact__orb`);if(this._reducedMotion){m.set(e,{opacity:1,scale:1,y:0});return}m.set(e,{opacity:0,y:40,scale:.85}),m.to(e,{opacity:1,y:0,scale:1,duration:.9,stagger:.12,delay:.35,ease:`back.out(1.4)`,onComplete:()=>{e.forEach(e=>{e.style.transform=``})}})}_createThree(){this.renderer=new y({canvas:this.canvas,antialias:!0,alpha:!1,powerPreference:`high-performance`}),this.renderer.setPixelRatio(Math.min(window.devicePixelRatio,this._isMobile?1.5:2)),this.renderer.setSize(window.innerWidth,window.innerHeight),this.renderer.toneMapping=4,this.renderer.toneMappingExposure=.7,this.renderer.outputColorSpace=D,this.scene=new u,this._bg=new R(this.renderer,{imageUrl:z}),this.scene.background=this._bg.texture,this.camera=new T(36,window.innerWidth/window.innerHeight,.1,100),this.camera.position.set(0,0,V),this.camera.lookAt(0,0,0);let e=new ne(this.renderer),t=new A;this.envMap=e.fromScene(t,.04).texture,e.dispose(),this.scene.environment=this.envMap,this.scene.environmentIntensity=1.4,this._composer=new ie(this.renderer),this._composer.setPixelRatio(this.renderer.getPixelRatio()),this._composer.setSize(window.innerWidth,window.innerHeight),this._composer.addPass(new ee(this.scene,this.camera)),this._composer.addPass(new O);let n=new i(16770760,3.6);n.position.set(3,4,3),this.scene.add(n),this._lights.push(n);let r=new i(8955606,1.2);r.position.set(-3.5,.5,-1.5),this.scene.add(r),this._lights.push(r);let a=new i(13688063,.9);a.position.set(0,-2.5,-3),this.scene.add(a),this._lights.push(a);let o=new h(1712184,.5);this.scene.add(o),this._lights.push(o)}_createLogo(){new j().load(B,e=>{let t=new g({color:1711916,metalness:.1,roughness:.25,clearcoat:1,clearcoatRoughness:.09,envMapIntensity:1.1}),n=new F(`contact`,{font:e,size:40,depth:ue,curveSegments:24,bevelEnabled:!0,bevelThickness:J,bevelSize:J,bevelSegments:4});n.center();let r=new E;r.add(new C(n,t));let i=new w().setFromObject(r),a=new x;i.getSize(a);let o=new E;o.position.y=H,o.add(r),this._logoBaseY=H,this._logoSize=a.clone();let s=this._computeLogoScale();o.scale.setScalar(s),this._logoScale=s,this._logoInner=r,this._logoGroup=o,this.scene.add(o),this._reducedMotion?o.scale.setScalar(s):(t.transparent=!0,t.opacity=0,o.scale.setScalar(s*.85),m.to(t,{opacity:1,duration:1.1,delay:.25,ease:`power2.out`}),m.to(o.scale,{x:s,y:s,z:s,duration:1.3,delay:.2,ease:`power3.out`}))})}_onPointerMove(e){this._bg?.setPointer(e.clientX,e.clientY)}_computeLogoScale(){if(!this._logoSize)return 1;let e=window.innerWidth/window.innerHeight,t=window.innerWidth<640?.72:U,n=Math.min(W,e*3.9),r=t/Math.max(this._logoSize.y,.001),i=n/Math.max(this._logoSize.x,.001);return Math.min(r,i)}_onResize(){let e=window.innerWidth,t=window.innerHeight;if(this.camera.aspect=e/t,this.camera.updateProjectionMatrix(),this.renderer.setSize(e,t),this._composer.setSize(e,t),this._bg?.resize(),this._isMobile=e<768||`ontouchstart`in window,this._logoGroup){let e=this._computeLogoScale();this._logoGroup.scale.setScalar(e),this._logoScale=e}}_startLoop(){this._active=!0,this._prevTime=performance.now();let e=t=>{if(!this._active)return;let n=(t-this._prevTime)/1e3,r=Math.min(n,.05);if(this._prevTime=t,this._elapsed+=r,this._bg?.step(this._elapsed),this._logoInner&&!this._reducedMotion){let e=Math.PI*2;this._logoInner.rotation.x=Math.sin(this._elapsed*q*e)*G,this._logoInner.rotation.y=Math.sin(this._elapsed*se*e)*K}if(this._logoGroup&&this._logoBaseY!=null&&!this._reducedMotion){let e=Math.sin(this._elapsed*le*Math.PI*2)*ce;this._logoGroup.position.y=this._logoBaseY+e}this._composer.render(),this._rafId=requestAnimationFrame(e)};this._rafId=requestAnimationFrame(e)}},X=new te(window.innerWidth<768||`ontouchstart`in window?{smoothTouch:!1,touchMultiplier:.75}:{duration:1.6,smoothWheel:!0,wheelMultiplier:.55,touchMultiplier:1.2,smoothTouch:!1});m.ticker.lagSmoothing(0);function Z(e){X.raf(e),requestAnimationFrame(Z)}requestAnimationFrame(Z);var Q=new _({lenis:X});Q.mount();var $=new de;$.init(),re(document),ae(),window.addEventListener(`load`,()=>{setTimeout(b,200)}),window.addEventListener(`pagehide`,()=>{$.destroy(),Q.destroy?.(),X.destroy?.()});