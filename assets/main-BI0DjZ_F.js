import{$ as e,A as t,At as n,B as r,Bt as i,C as a,Ct as o,D as s,Dt as c,E as l,Et as u,F as d,Ft as f,G as p,H as m,I as h,It as g,J as _,K as v,L as y,Lt as b,M as x,Mt as S,N as C,Nt as w,O as T,Ot as E,P as D,Pt as O,Q as k,R as ee,Rt as A,S as j,St as M,T as N,Tt as P,U as F,V as te,W as ne,X as re,Y as ie,Z as I,_ as L,_t as R,a as z,at as ae,b as oe,bt as se,c as ce,ct as le,d as ue,dt as de,et as fe,ft as pe,g as B,gt as me,h as he,ht as ge,i as _e,it as ve,j as ye,jt as be,k as xe,kt as V,l as Se,lt as Ce,m as we,mt as Te,n as H,nt as U,o as Ee,ot as De,p as Oe,pt as ke,q as W,rt as G,s as Ae,st as je,t as Me,tt as Ne,u as Pe,ut as Fe,v as Ie,vt as Le,w as Re,wt as ze,x as Be,xt as Ve,y as He,yt as Ue,z as We,zt as Ge}from"./menu-BT2WraHj.js";function Ke(e,t=!1){let n=new _e({canvas:e,antialias:!t});n.setPixelRatio(Math.min(window.devicePixelRatio,t?1:2)),n.setSize(window.innerWidth,window.innerHeight),n.toneMapping=4,n.toneMappingExposure=6.5,n.shadowMap.enabled=!t,n.shadowMap.type=2,n.outputColorSpace=o;let r=new ze;r.background=new B(394762),r.fog=new l(394762,.022);let i=new de(60,window.innerWidth/window.innerHeight,.1,100);i.position.set(0,1.8,8),i.lookAt(0,1.5,0);let a={uTime:{value:0}},s=new P({uniforms:a,side:1,vertexShader:`
      varying vec3 vWorldPos;
      void main() {
        vWorldPos   = (modelMatrix * vec4(position, 1.0)).xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,fragmentShader:`
      precision highp float;
      uniform float uTime;
      varying vec3  vWorldPos;

      float hash(vec2 p) {
        p = fract(p * vec2(234.34, 435.35));
        p += dot(p, p + 34.23);
        return fract(p.x * p.y);
      }
      float noise(vec2 p) {
        vec2 i = floor(p), f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        return mix(mix(hash(i), hash(i+vec2(1,0)), f.x),
                   mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x), f.y);
      }
      float fbm(vec2 p) {
        float v = 0.0, a = 0.5;
        for (int i = 0; i < 5; i++) { v += a * noise(p); p = p * 2.3 + vec2(1.7, 0.9); a *= 0.45; }
        return v;
      }

      void main() {
        float z = clamp((vWorldPos.z + 80.0) / 90.0, 0.0, 1.0); // 0=uzak, 1=yakın
        float y = vWorldPos.y / 8.0;

        // Domain-warped FBM: her katman bir öncekini bükuyor
        float n1 = fbm(vec2(z * 2.5  - uTime * 0.08,  y * 1.5  + uTime * 0.05));
        float n2 = fbm(vec2(z * 5.0  + uTime * 0.13  + n1 * 0.8, y * 3.0 - uTime * 0.09));
        float n3 = fbm(vec2(z * 3.5  - uTime * 0.06  + n2 * 0.5, y * 2.0 + uTime * 0.07));
        float g  = n1 * 0.50 + n2 * 0.30 + n3 * 0.20;

        // Renk paleti: derin lacivert → elektrik mavi → indigo
        vec3 c1  = vec3(0.018, 0.028, 0.10);
        vec3 c2  = vec3(0.040, 0.100, 0.32);
        vec3 c3  = vec3(0.080, 0.200, 0.52);
        vec3 col = mix(c1, c2, smoothstep(0.0, 0.45, g));
        col      = mix(col, c3, smoothstep(0.45, 0.85, g));
        col      = mix(col, c2 * 0.7, smoothstep(0.75, 1.0, g) * n3);

        // Koridor derinliği: uzaklaştıkça kararır
        col *= (0.22 + z * 0.78);

        // Üst/alt kenar karartması
        col *= (0.35 + smoothstep(0.0, 0.20, y) * smoothstep(1.0, 0.80, y) * 0.65);

        // Kir/grunge katmanı — statik yüksek frekanslı leke deseni
        float dirt = fbm(vec2(vWorldPos.x * 5.5 + vWorldPos.z * 1.2, vWorldPos.y * 9.0));
        float dirt2 = fbm(vec2(vWorldPos.z * 3.0 + dirt * 0.6, vWorldPos.x * 7.0 + vWorldPos.y * 4.0));
        col *= (0.93 + dirt * 0.04 + dirt2 * 0.03);

        col *= 5.2; // genel parlaklık — ince ayar buradan
        gl_FragColor = vec4(col, 1.0);
      }
    `}),c=new k(new Se(20,8,102),s);c.position.set(0,4,-39),c.receiveShadow=!0,r.add(c);let u=new G({color:2434352,roughness:.85,metalness:.1,emissive:new B(1579040),emissiveIntensity:10}),d=new k(new pe(20,102),u);d.rotation.x=-Math.PI/2,d.position.set(0,.001,-39),d.receiveShadow=!0,r.add(d);let f=new z(2109520,75);r.add(f);let p=new xe(3162208,526352,55);r.add(p);let m=new V(13162751,30,22,.6,.75,2);m.position.set(0,6,0),m.castShadow=!t,m.shadow.mapSize.set(t?512:1024,t?512:1024),m.shadow.bias=-.002,r.add(m),r.add(m.target);let h=new V(13691135,0,18,.5,.85,2);h.position.set(0,7,-48),h.target.position.set(0,0,-48),h.castShadow=!t,h.shadow.mapSize.set(t?512:1024,t?512:1024),h.shadow.bias=-.002,h.target.updateMatrixWorld(),r.add(h),r.add(h.target);let g=new ke(5271728,3e3,30,2);g.position.set(0,5,-83),r.add(g);function _(){i.aspect=window.innerWidth/window.innerHeight,i.updateProjectionMatrix(),n.setSize(window.innerWidth,window.innerHeight)}return window.addEventListener(`resize`,_),{scene:r,renderer:n,camera:i,spotLight:m,armSpot:h,ambient:f,hemi:p,wallUniforms:a,onResize:_}}function qe(e){let t=new P({uniforms:{uTime:{value:0}},vertexShader:`
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,fragmentShader:`
      uniform float uTime;
      varying vec2 vUv;

      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
      }

      void main() {
        // Soft rectangular mask — falls off toward edges
        vec2 d = abs(vUv - 0.5) * 2.0;
        float mask = (1.0 - smoothstep(0.55, 1.0, d.x))
                   * (1.0 - smoothstep(0.55, 1.0, d.y));

        // Multi-frequency flicker
        float flicker = 0.88
          + 0.07 * sin(uTime * 19.3)
          + 0.05 * sin(uTime * 7.7 + 1.2);

        // Subtle scanline noise
        float scan = 1.0 - hash(vec2(floor(vUv.y * 130.0), uTime * 25.0)) * 0.045;

        vec3 col = vec3(0.80, 0.90, 1.0) * flicker * scan;
        gl_FragColor = vec4(col, mask * 0.35);
      }
    `,transparent:!0,blending:2,depthWrite:!1,side:0}),n=new k(new pe(32,18),t);return n.position.set(0,4,-89.5),n.visible=!1,e.add(n),n}function Je(){let e=new P({uniforms:{uColor:{value:new B(1721548)}},vertexShader:`
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,fragmentShader:`
      uniform vec3 uColor;
      varying vec2 vUv;
      void main() {
        float d = length(vUv - 0.5) * 2.0;
        float alpha = pow(clamp(1.0 - d, 0.0, 1.0), 2.0) * 0.55;
        gl_FragColor = vec4(uColor, alpha);
      }
    `,transparent:!0,blending:2,depthWrite:!1,side:2}),t=new k(new pe(2,2),e);return t.rotation.x=-Math.PI/2,t}var Ye={name:`CopyShader`,uniforms:{tDiffuse:{value:null},opacity:{value:1}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform float opacity;

		uniform sampler2D tDiffuse;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );
			gl_FragColor = opacity * texel;


		}`},Xe=class{constructor(){this.isPass=!0,this.enabled=!0,this.needsSwap=!0,this.clear=!1,this.renderToScreen=!1}setSize(){}render(){console.error(`THREE.Pass: .render() must be implemented in derived pass.`)}dispose(){}},Ze=new Fe(-1,1,1,-1,0,1),Qe=new class extends ue{constructor(){super(),this.setAttribute(`position`,new Re([-1,3,0,-1,-1,0,3,-1,0],3)),this.setAttribute(`uv`,new Re([0,2,0,0,2,0],2))}},$e=class{constructor(e){this._mesh=new k(Qe,e)}dispose(){this._mesh.geometry.dispose()}render(e){e.render(this._mesh,Ze)}get material(){return this._mesh.material}set material(e){this._mesh.material=e}},et=class extends Xe{constructor(e,t=`tDiffuse`){super(),this.textureID=t,this.uniforms=null,this.material=null,e instanceof P?(this.uniforms=e.uniforms,this.material=e):e&&(this.uniforms=O.clone(e.uniforms),this.material=new P({name:e.name===void 0?`unspecified`:e.name,defines:Object.assign({},e.defines),uniforms:this.uniforms,vertexShader:e.vertexShader,fragmentShader:e.fragmentShader})),this._fsQuad=new $e(this.material)}render(e,t,n){this.uniforms[this.textureID]&&(this.uniforms[this.textureID].value=n.texture),this._fsQuad.material=this.material,this.renderToScreen?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this._fsQuad.render(e))}dispose(){this.material.dispose(),this._fsQuad.dispose()}},tt=class extends Xe{constructor(e,t){super(),this.scene=e,this.camera=t,this.clear=!0,this.needsSwap=!1,this.inverse=!1}render(e,t,n){let r=e.getContext(),i=e.state;i.buffers.color.setMask(!1),i.buffers.depth.setMask(!1),i.buffers.color.setLocked(!0),i.buffers.depth.setLocked(!0);let a,o;this.inverse?(a=0,o=1):(a=1,o=0),i.buffers.stencil.setTest(!0),i.buffers.stencil.setOp(r.REPLACE,r.REPLACE,r.REPLACE),i.buffers.stencil.setFunc(r.ALWAYS,a,4294967295),i.buffers.stencil.setClear(o),i.buffers.stencil.setLocked(!0),e.setRenderTarget(n),this.clear&&e.clear(),e.render(this.scene,this.camera),e.setRenderTarget(t),this.clear&&e.clear(),e.render(this.scene,this.camera),i.buffers.color.setLocked(!1),i.buffers.depth.setLocked(!1),i.buffers.color.setMask(!0),i.buffers.depth.setMask(!0),i.buffers.stencil.setLocked(!1),i.buffers.stencil.setFunc(r.EQUAL,1,4294967295),i.buffers.stencil.setOp(r.KEEP,r.KEEP,r.KEEP),i.buffers.stencil.setLocked(!0)}},nt=class extends Xe{constructor(){super(),this.needsSwap=!1}render(e){e.state.buffers.stencil.setLocked(!1),e.state.buffers.stencil.setTest(!1)}},rt=class{constructor(e,t){if(this.renderer=e,this._pixelRatio=e.getPixelRatio(),t===void 0){let n=e.getSize(new g);this._width=n.width,this._height=n.height,t=new Ge(this._width*this._pixelRatio,this._height*this._pixelRatio,{type:T}),t.texture.name=`EffectComposer.rt1`}else this._width=t.width,this._height=t.height;this.renderTarget1=t,this.renderTarget2=t.clone(),this.renderTarget2.texture.name=`EffectComposer.rt2`,this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2,this.renderToScreen=!0,this.passes=[],this.copyPass=new et(Ye),this.copyPass.material.blending=0,this.timer=new S}swapBuffers(){let e=this.readBuffer;this.readBuffer=this.writeBuffer,this.writeBuffer=e}addPass(e){this.passes.push(e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}insertPass(e,t){this.passes.splice(t,0,e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}removePass(e){let t=this.passes.indexOf(e);t!==-1&&this.passes.splice(t,1)}isLastEnabledPass(e){for(let t=e+1;t<this.passes.length;t++)if(this.passes[t].enabled)return!1;return!0}render(e){this.timer.update(),e===void 0&&(e=this.timer.getDelta());let t=this.renderer.getRenderTarget(),n=!1;for(let t=0,r=this.passes.length;t<r;t++){let r=this.passes[t];if(r.enabled!==!1){if(r.renderToScreen=this.renderToScreen&&this.isLastEnabledPass(t),r.render(this.renderer,this.writeBuffer,this.readBuffer,e,n),r.needsSwap){if(n){let t=this.renderer.getContext(),n=this.renderer.state.buffers.stencil;n.setFunc(t.NOTEQUAL,1,4294967295),this.copyPass.render(this.renderer,this.writeBuffer,this.readBuffer,e),n.setFunc(t.EQUAL,1,4294967295)}this.swapBuffers()}tt!==void 0&&(r instanceof tt?n=!0:r instanceof nt&&(n=!1))}}this.renderer.setRenderTarget(t)}reset(e){if(e===void 0){let t=this.renderer.getSize(new g);this._pixelRatio=this.renderer.getPixelRatio(),this._width=t.width,this._height=t.height,e=this.renderTarget1.clone(),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.renderTarget1=e,this.renderTarget2=e.clone(),this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2}setSize(e,t){this._width=e,this._height=t;let n=this._width*this._pixelRatio,r=this._height*this._pixelRatio;this.renderTarget1.setSize(n,r),this.renderTarget2.setSize(n,r);for(let e=0;e<this.passes.length;e++)this.passes[e].setSize(n,r)}setPixelRatio(e){this._pixelRatio=e,this.setSize(this._width,this._height)}dispose(){this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.copyPass.dispose()}},it=class extends Xe{constructor(e,t,n=null,r=null,i=null){super(),this.scene=e,this.camera=t,this.overrideMaterial=n,this.clearColor=r,this.clearAlpha=i,this.clear=!0,this.clearDepth=!1,this.needsSwap=!1,this.isRenderPass=!0,this._oldClearColor=new B}render(e,t,n){let r=e.autoClear;e.autoClear=!1;let i,a;this.overrideMaterial!==null&&(a=this.scene.overrideMaterial,this.scene.overrideMaterial=this.overrideMaterial),this.clearColor!==null&&(e.getClearColor(this._oldClearColor),e.setClearColor(this.clearColor,e.getClearAlpha())),this.clearAlpha!==null&&(i=e.getClearAlpha(),e.setClearAlpha(this.clearAlpha)),this.clearDepth==1&&e.clearDepth(),e.setRenderTarget(this.renderToScreen?null:n),this.clear===!0&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),e.render(this.scene,this.camera),this.clearColor!==null&&e.setClearColor(this._oldClearColor),this.clearAlpha!==null&&e.setClearAlpha(i),this.overrideMaterial!==null&&(this.scene.overrideMaterial=a),e.autoClear=r}},at={name:`LuminosityHighPassShader`,uniforms:{tDiffuse:{value:null},luminosityThreshold:{value:1},smoothWidth:{value:1},defaultColor:{value:new B(0)},defaultOpacity:{value:0}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform sampler2D tDiffuse;
		uniform vec3 defaultColor;
		uniform float defaultOpacity;
		uniform float luminosityThreshold;
		uniform float smoothWidth;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );

			float v = luminance( texel.xyz );

			vec4 outputColor = vec4( defaultColor.rgb, defaultOpacity );

			float alpha = smoothstep( luminosityThreshold, luminosityThreshold + smoothWidth, v );

			gl_FragColor = mix( outputColor, texel, alpha );

		}`},ot=class t extends Xe{constructor(t,n=1,r,i){super(),this.strength=n,this.radius=r,this.threshold=i,this.resolution=t===void 0?new g(256,256):new g(t.x,t.y),this.clearColor=new B(0,0,0),this.needsSwap=!1,this.renderTargetsHorizontal=[],this.renderTargetsVertical=[],this.nMips=5;let a=Math.round(this.resolution.x/2),o=Math.round(this.resolution.y/2);this.renderTargetBright=new Ge(a,o,{type:T}),this.renderTargetBright.texture.name=`UnrealBloomPass.bright`,this.renderTargetBright.texture.generateMipmaps=!1;for(let e=0;e<this.nMips;e++){let t=new Ge(a,o,{type:T});t.texture.name=`UnrealBloomPass.h`+e,t.texture.generateMipmaps=!1,this.renderTargetsHorizontal.push(t);let n=new Ge(a,o,{type:T});n.texture.name=`UnrealBloomPass.v`+e,n.texture.generateMipmaps=!1,this.renderTargetsVertical.push(n),a=Math.round(a/2),o=Math.round(o/2)}let s=at;this.highPassUniforms=O.clone(s.uniforms),this.highPassUniforms.luminosityThreshold.value=i,this.highPassUniforms.smoothWidth.value=.01,this.materialHighPassFilter=new P({uniforms:this.highPassUniforms,vertexShader:s.vertexShader,fragmentShader:s.fragmentShader}),this.separableBlurMaterials=[];let c=[6,10,14,18,22];a=Math.round(this.resolution.x/2),o=Math.round(this.resolution.y/2);for(let e=0;e<this.nMips;e++)this.separableBlurMaterials.push(this._getSeparableBlurMaterial(c[e])),this.separableBlurMaterials[e].uniforms.invSize.value=new g(1/a,1/o),a=Math.round(a/2),o=Math.round(o/2);this.compositeMaterial=this._getCompositeMaterial(this.nMips),this.compositeMaterial.uniforms.blurTexture1.value=this.renderTargetsVertical[0].texture,this.compositeMaterial.uniforms.blurTexture2.value=this.renderTargetsVertical[1].texture,this.compositeMaterial.uniforms.blurTexture3.value=this.renderTargetsVertical[2].texture,this.compositeMaterial.uniforms.blurTexture4.value=this.renderTargetsVertical[3].texture,this.compositeMaterial.uniforms.blurTexture5.value=this.renderTargetsVertical[4].texture,this.compositeMaterial.uniforms.bloomStrength.value=n,this.compositeMaterial.uniforms.bloomRadius.value=.1;let l=[1,.8,.6,.4,.2];this.compositeMaterial.uniforms.bloomFactors.value=l,this.bloomTintColors=[new b(1,1,1),new b(1,1,1),new b(1,1,1),new b(1,1,1),new b(1,1,1)],this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,this.copyUniforms=O.clone(Ye.uniforms),this.blendMaterial=new P({uniforms:this.copyUniforms,vertexShader:Ye.vertexShader,fragmentShader:Ye.fragmentShader,premultipliedAlpha:!0,blending:2,depthTest:!1,depthWrite:!1,transparent:!0}),this._oldClearColor=new B,this._oldClearAlpha=1,this._basic=new e,this._fsQuad=new $e(null)}dispose(){for(let e=0;e<this.renderTargetsHorizontal.length;e++)this.renderTargetsHorizontal[e].dispose();for(let e=0;e<this.renderTargetsVertical.length;e++)this.renderTargetsVertical[e].dispose();this.renderTargetBright.dispose();for(let e=0;e<this.separableBlurMaterials.length;e++)this.separableBlurMaterials[e].dispose();this.compositeMaterial.dispose(),this.blendMaterial.dispose(),this._basic.dispose(),this._fsQuad.dispose()}setSize(e,t){let n=Math.round(e/2),r=Math.round(t/2);this.renderTargetBright.setSize(n,r);for(let e=0;e<this.nMips;e++)this.renderTargetsHorizontal[e].setSize(n,r),this.renderTargetsVertical[e].setSize(n,r),this.separableBlurMaterials[e].uniforms.invSize.value=new g(1/n,1/r),n=Math.round(n/2),r=Math.round(r/2)}render(e,n,r,i,a){e.getClearColor(this._oldClearColor),this._oldClearAlpha=e.getClearAlpha();let o=e.autoClear;e.autoClear=!1,e.setClearColor(this.clearColor,0),a&&e.state.buffers.stencil.setTest(!1),this.renderToScreen&&(this._fsQuad.material=this._basic,this._basic.map=r.texture,e.setRenderTarget(null),e.clear(),this._fsQuad.render(e)),this.highPassUniforms.tDiffuse.value=r.texture,this.highPassUniforms.luminosityThreshold.value=this.threshold,this._fsQuad.material=this.materialHighPassFilter,e.setRenderTarget(this.renderTargetBright),e.clear(),this._fsQuad.render(e);let s=this.renderTargetBright;for(let n=0;n<this.nMips;n++)this._fsQuad.material=this.separableBlurMaterials[n],this.separableBlurMaterials[n].uniforms.colorTexture.value=s.texture,this.separableBlurMaterials[n].uniforms.direction.value=t.BlurDirectionX,e.setRenderTarget(this.renderTargetsHorizontal[n]),e.clear(),this._fsQuad.render(e),this.separableBlurMaterials[n].uniforms.colorTexture.value=this.renderTargetsHorizontal[n].texture,this.separableBlurMaterials[n].uniforms.direction.value=t.BlurDirectionY,e.setRenderTarget(this.renderTargetsVertical[n]),e.clear(),this._fsQuad.render(e),s=this.renderTargetsVertical[n];this._fsQuad.material=this.compositeMaterial,this.compositeMaterial.uniforms.bloomStrength.value=this.strength,this.compositeMaterial.uniforms.bloomRadius.value=this.radius,this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,e.setRenderTarget(this.renderTargetsHorizontal[0]),e.clear(),this._fsQuad.render(e),this._fsQuad.material=this.blendMaterial,this.copyUniforms.tDiffuse.value=this.renderTargetsHorizontal[0].texture,a&&e.state.buffers.stencil.setTest(!0),this.renderToScreen?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(r),this._fsQuad.render(e)),e.setClearColor(this._oldClearColor,this._oldClearAlpha),e.autoClear=o}_getSeparableBlurMaterial(e){let t=[],n=e/3;for(let r=0;r<e;r++)t.push(.39894*Math.exp(-.5*r*r/(n*n))/n);return new P({defines:{KERNEL_RADIUS:e},uniforms:{colorTexture:{value:null},invSize:{value:new g(.5,.5)},direction:{value:new g(.5,.5)},gaussianCoefficients:{value:t}},vertexShader:`

				varying vec2 vUv;

				void main() {

					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

				}`,fragmentShader:`

				#include <common>

				varying vec2 vUv;

				uniform sampler2D colorTexture;
				uniform vec2 invSize;
				uniform vec2 direction;
				uniform float gaussianCoefficients[KERNEL_RADIUS];

				void main() {

					float weightSum = gaussianCoefficients[0];
					vec3 diffuseSum = texture2D( colorTexture, vUv ).rgb * weightSum;

					for ( int i = 1; i < KERNEL_RADIUS; i ++ ) {

						float x = float( i );
						float w = gaussianCoefficients[i];
						vec2 uvOffset = direction * invSize * x;
						vec3 sample1 = texture2D( colorTexture, vUv + uvOffset ).rgb;
						vec3 sample2 = texture2D( colorTexture, vUv - uvOffset ).rgb;
						diffuseSum += ( sample1 + sample2 ) * w;

					}

					gl_FragColor = vec4( diffuseSum, 1.0 );

				}`})}_getCompositeMaterial(e){return new P({defines:{NUM_MIPS:e},uniforms:{blurTexture1:{value:null},blurTexture2:{value:null},blurTexture3:{value:null},blurTexture4:{value:null},blurTexture5:{value:null},bloomStrength:{value:1},bloomFactors:{value:null},bloomTintColors:{value:null},bloomRadius:{value:0}},vertexShader:`

				varying vec2 vUv;

				void main() {

					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

				}`,fragmentShader:`

				varying vec2 vUv;

				uniform sampler2D blurTexture1;
				uniform sampler2D blurTexture2;
				uniform sampler2D blurTexture3;
				uniform sampler2D blurTexture4;
				uniform sampler2D blurTexture5;
				uniform float bloomStrength;
				uniform float bloomRadius;
				uniform float bloomFactors[NUM_MIPS];
				uniform vec3 bloomTintColors[NUM_MIPS];

				float lerpBloomFactor( const in float factor ) {

					float mirrorFactor = 1.2 - factor;
					return mix( factor, mirrorFactor, bloomRadius );

				}

				void main() {

					// 3.0 for backwards compatibility with previous alpha-based intensity
					vec3 bloom = 3.0 * bloomStrength * (
						lerpBloomFactor( bloomFactors[ 0 ] ) * bloomTintColors[ 0 ] * texture2D( blurTexture1, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 1 ] ) * bloomTintColors[ 1 ] * texture2D( blurTexture2, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 2 ] ) * bloomTintColors[ 2 ] * texture2D( blurTexture3, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 3 ] ) * bloomTintColors[ 3 ] * texture2D( blurTexture4, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 4 ] ) * bloomTintColors[ 4 ] * texture2D( blurTexture5, vUv ).rgb
					);

					float bloomAlpha = max( bloom.r, max( bloom.g, bloom.b ) );
					gl_FragColor = vec4( bloom, bloomAlpha );

				}`})}};ot.BlurDirectionX=new g(1,0),ot.BlurDirectionY=new g(0,1);var st=class{constructor(e=Math){this.grad3=[[1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],[1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],[0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]],this.grad4=[[0,1,1,1],[0,1,1,-1],[0,1,-1,1],[0,1,-1,-1],[0,-1,1,1],[0,-1,1,-1],[0,-1,-1,1],[0,-1,-1,-1],[1,0,1,1],[1,0,1,-1],[1,0,-1,1],[1,0,-1,-1],[-1,0,1,1],[-1,0,1,-1],[-1,0,-1,1],[-1,0,-1,-1],[1,1,0,1],[1,1,0,-1],[1,-1,0,1],[1,-1,0,-1],[-1,1,0,1],[-1,1,0,-1],[-1,-1,0,1],[-1,-1,0,-1],[1,1,1,0],[1,1,-1,0],[1,-1,1,0],[1,-1,-1,0],[-1,1,1,0],[-1,1,-1,0],[-1,-1,1,0],[-1,-1,-1,0]],this.p=[];for(let t=0;t<256;t++)this.p[t]=Math.floor(e.random()*256);this.perm=[];for(let e=0;e<512;e++)this.perm[e]=this.p[e&255];this.simplex=[[0,1,2,3],[0,1,3,2],[0,0,0,0],[0,2,3,1],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,2,3,0],[0,2,1,3],[0,0,0,0],[0,3,1,2],[0,3,2,1],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,3,2,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,2,0,3],[0,0,0,0],[1,3,0,2],[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,3,0,1],[2,3,1,0],[1,0,2,3],[1,0,3,2],[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,0,3,1],[0,0,0,0],[2,1,3,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,0,1,3],[0,0,0,0],[0,0,0,0],[0,0,0,0],[3,0,1,2],[3,0,2,1],[0,0,0,0],[3,1,2,0],[2,1,0,3],[0,0,0,0],[0,0,0,0],[0,0,0,0],[3,1,0,2],[0,0,0,0],[3,2,0,1],[3,2,1,0]]}noise(e,t){let n,r,i,a=.5*(Math.sqrt(3)-1),o=(e+t)*a,s=Math.floor(e+o),c=Math.floor(t+o),l=(3-Math.sqrt(3))/6,u=(s+c)*l,d=s-u,f=c-u,p=e-d,m=t-f,h,g;p>m?(h=1,g=0):(h=0,g=1);let _=p-h+l,v=m-g+l,y=p-1+2*l,b=m-1+2*l,x=s&255,S=c&255,C=this.perm[x+this.perm[S]]%12,w=this.perm[x+h+this.perm[S+g]]%12,T=this.perm[x+1+this.perm[S+1]]%12,E=.5-p*p-m*m;E<0?n=0:(E*=E,n=E*E*this._dot(this.grad3[C],p,m));let D=.5-_*_-v*v;D<0?r=0:(D*=D,r=D*D*this._dot(this.grad3[w],_,v));let O=.5-y*y-b*b;return O<0?i=0:(O*=O,i=O*O*this._dot(this.grad3[T],y,b)),70*(n+r+i)}noise3d(e,t,n){let r,i,a,o,s=(e+t+n)*(1/3),c=Math.floor(e+s),l=Math.floor(t+s),u=Math.floor(n+s),d=1/6,f=(c+l+u)*d,p=c-f,m=l-f,h=u-f,g=e-p,_=t-m,v=n-h,y,b,x,S,C,w;g>=_?_>=v?(y=1,b=0,x=0,S=1,C=1,w=0):g>=v?(y=1,b=0,x=0,S=1,C=0,w=1):(y=0,b=0,x=1,S=1,C=0,w=1):_<v?(y=0,b=0,x=1,S=0,C=1,w=1):g<v?(y=0,b=1,x=0,S=0,C=1,w=1):(y=0,b=1,x=0,S=1,C=1,w=0);let T=g-y+d,E=_-b+d,D=v-x+d,O=g-S+2*d,k=_-C+2*d,ee=v-w+2*d,A=g-1+3*d,j=_-1+3*d,M=v-1+3*d,N=c&255,P=l&255,F=u&255,te=this.perm[N+this.perm[P+this.perm[F]]]%12,ne=this.perm[N+y+this.perm[P+b+this.perm[F+x]]]%12,re=this.perm[N+S+this.perm[P+C+this.perm[F+w]]]%12,ie=this.perm[N+1+this.perm[P+1+this.perm[F+1]]]%12,I=.6-g*g-_*_-v*v;I<0?r=0:(I*=I,r=I*I*this._dot3(this.grad3[te],g,_,v));let L=.6-T*T-E*E-D*D;L<0?i=0:(L*=L,i=L*L*this._dot3(this.grad3[ne],T,E,D));let R=.6-O*O-k*k-ee*ee;R<0?a=0:(R*=R,a=R*R*this._dot3(this.grad3[re],O,k,ee));let z=.6-A*A-j*j-M*M;return z<0?o=0:(z*=z,o=z*z*this._dot3(this.grad3[ie],A,j,M)),32*(r+i+a+o)}noise4d(e,t,n,r){let i=this.grad4,a=this.simplex,o=this.perm,s=(Math.sqrt(5)-1)/4,c=(5-Math.sqrt(5))/20,l,u,d,f,p,m=(e+t+n+r)*s,h=Math.floor(e+m),g=Math.floor(t+m),_=Math.floor(n+m),v=Math.floor(r+m),y=(h+g+_+v)*c,b=h-y,x=g-y,S=_-y,C=v-y,w=e-b,T=t-x,E=n-S,D=r-C,O=w>T?32:0,k=w>E?16:0,ee=T>E?8:0,A=w>D?4:0,j=T>D?2:0,M=+(E>D),N=O+k+ee+A+j+M,P=+(a[N][0]>=3),F=+(a[N][1]>=3),te=+(a[N][2]>=3),ne=+(a[N][3]>=3),re=+(a[N][0]>=2),ie=+(a[N][1]>=2),I=+(a[N][2]>=2),L=+(a[N][3]>=2),R=+(a[N][0]>=1),z=+(a[N][1]>=1),ae=+(a[N][2]>=1),oe=+(a[N][3]>=1),se=w-P+c,ce=T-F+c,le=E-te+c,ue=D-ne+c,de=w-re+2*c,fe=T-ie+2*c,pe=E-I+2*c,B=D-L+2*c,me=w-R+3*c,he=T-z+3*c,ge=E-ae+3*c,_e=D-oe+3*c,ve=w-1+4*c,ye=T-1+4*c,be=E-1+4*c,xe=D-1+4*c,V=h&255,Se=g&255,Ce=_&255,we=v&255,Te=o[V+o[Se+o[Ce+o[we]]]]%32,H=o[V+P+o[Se+F+o[Ce+te+o[we+ne]]]]%32,U=o[V+re+o[Se+ie+o[Ce+I+o[we+L]]]]%32,Ee=o[V+R+o[Se+z+o[Ce+ae+o[we+oe]]]]%32,De=o[V+1+o[Se+1+o[Ce+1+o[we+1]]]]%32,Oe=.6-w*w-T*T-E*E-D*D;Oe<0?l=0:(Oe*=Oe,l=Oe*Oe*this._dot4(i[Te],w,T,E,D));let ke=.6-se*se-ce*ce-le*le-ue*ue;ke<0?u=0:(ke*=ke,u=ke*ke*this._dot4(i[H],se,ce,le,ue));let W=.6-de*de-fe*fe-pe*pe-B*B;W<0?d=0:(W*=W,d=W*W*this._dot4(i[U],de,fe,pe,B));let G=.6-me*me-he*he-ge*ge-_e*_e;G<0?f=0:(G*=G,f=G*G*this._dot4(i[Ee],me,he,ge,_e));let Ae=.6-ve*ve-ye*ye-be*be-xe*xe;return Ae<0?p=0:(Ae*=Ae,p=Ae*Ae*this._dot4(i[De],ve,ye,be,xe)),27*(l+u+d+f+p)}_dot(e,t,n){return e[0]*t+e[1]*n}_dot3(e,t,n,r){return e[0]*t+e[1]*n+e[2]*r}_dot4(e,t,n,r,i){return e[0]*t+e[1]*n+e[2]*r+e[3]*i}},ct={name:`SSAOShader`,defines:{PERSPECTIVE_CAMERA:1,KERNEL_SIZE:32},uniforms:{tNormal:{value:null},tDepth:{value:null},tNoise:{value:null},kernel:{value:null},cameraNear:{value:null},cameraFar:{value:null},resolution:{value:new g},cameraProjectionMatrix:{value:new I},cameraInverseProjectionMatrix:{value:new I},kernelRadius:{value:8},minDistance:{value:.005},maxDistance:{value:.05}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`
		uniform highp sampler2D tNormal;
		uniform highp sampler2D tDepth;
		uniform sampler2D tNoise;

		uniform vec3 kernel[ KERNEL_SIZE ];

		uniform vec2 resolution;

		uniform float cameraNear;
		uniform float cameraFar;
		uniform mat4 cameraProjectionMatrix;
		uniform mat4 cameraInverseProjectionMatrix;

		uniform float kernelRadius;
		uniform float minDistance; // avoid artifacts caused by neighbour fragments with minimal depth difference
		uniform float maxDistance; // avoid the influence of fragments which are too far away

		varying vec2 vUv;

		#include <packing>

		#ifdef USE_REVERSED_DEPTH_BUFFER

			const float depthThreshold = 0.0;

		#else

			const float depthThreshold = 1.0;

		#endif

		float getDepth( const in vec2 screenPosition ) {

			return texture2D( tDepth, screenPosition ).x;

		}

		float getLinearDepth( const in vec2 screenPosition ) {

			#if PERSPECTIVE_CAMERA == 1

				float fragCoordZ = texture2D( tDepth, screenPosition ).x;
				float viewZ = perspectiveDepthToViewZ( fragCoordZ, cameraNear, cameraFar );
				return viewZToOrthographicDepth( viewZ, cameraNear, cameraFar );

			#else

				return texture2D( tDepth, screenPosition ).x;

			#endif

		}

		float getViewZ( const in float depth ) {

			#if PERSPECTIVE_CAMERA == 1

				return perspectiveDepthToViewZ( depth, cameraNear, cameraFar );

			#else

				return orthographicDepthToViewZ( depth, cameraNear, cameraFar );

			#endif

		}

		vec3 getViewPosition( const in vec2 screenPosition, const in float depth, const in float viewZ ) {

			float clipW = cameraProjectionMatrix[2][3] * viewZ + cameraProjectionMatrix[3][3];

			vec4 clipPosition = vec4( ( vec3( screenPosition, depth ) - 0.5 ) * 2.0, 1.0 );

			clipPosition *= clipW; // unprojection.

			return ( cameraInverseProjectionMatrix * clipPosition ).xyz;

		}

		vec3 getViewNormal( const in vec2 screenPosition ) {

			return unpackRGBToNormal( texture2D( tNormal, screenPosition ).xyz );

		}

		void main() {

			float depth = getDepth( vUv );

			if ( depth == depthThreshold ) {

				gl_FragColor = vec4( 1.0 ); // don't influence background

			} else {

				float viewZ = getViewZ( depth );

				vec3 viewPosition = getViewPosition( vUv, depth, viewZ );
				vec3 viewNormal = getViewNormal( vUv );

				vec2 noiseScale = vec2( resolution.x / 4.0, resolution.y / 4.0 );
				vec3 random = vec3( texture2D( tNoise, vUv * noiseScale ).r );

				// compute matrix used to reorient a kernel vector

				vec3 tangent = normalize( random - viewNormal * dot( random, viewNormal ) );
				vec3 bitangent = cross( viewNormal, tangent );
				mat3 kernelMatrix = mat3( tangent, bitangent, viewNormal );

				float occlusion = 0.0;

				for ( int i = 0; i < KERNEL_SIZE; i ++ ) {

					vec3 sampleVector = kernelMatrix * kernel[ i ]; // reorient sample vector in view space
					vec3 samplePoint = viewPosition + ( sampleVector * kernelRadius ); // calculate sample point

					vec4 samplePointNDC = cameraProjectionMatrix * vec4( samplePoint, 1.0 ); // project point and calculate NDC
					samplePointNDC /= samplePointNDC.w;

					vec2 samplePointUv = samplePointNDC.xy * 0.5 + 0.5; // compute uv coordinates

					float realDepth = getLinearDepth( samplePointUv ); // get linear depth from depth texture
					float sampleDepth = viewZToOrthographicDepth( samplePoint.z, cameraNear, cameraFar ); // compute linear depth of the sample view Z value
					float delta = sampleDepth - realDepth;

					if ( delta > minDistance && delta < maxDistance ) { // if fragment is before sample point, increase occlusion

						occlusion += 1.0;

					}

				}

				occlusion = clamp( occlusion / float( KERNEL_SIZE ), 0.0, 1.0 );

				gl_FragColor = vec4( vec3( 1.0 - occlusion ), 1.0 );

			}

		}`},lt={name:`SSAODepthShader`,defines:{PERSPECTIVE_CAMERA:1},uniforms:{tDepth:{value:null},cameraNear:{value:null},cameraFar:{value:null}},vertexShader:`varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`uniform sampler2D tDepth;

		uniform float cameraNear;
		uniform float cameraFar;

		varying vec2 vUv;

		#include <packing>

		float getLinearDepth( const in vec2 screenPosition ) {

			#if PERSPECTIVE_CAMERA == 1

				float fragCoordZ = texture2D( tDepth, screenPosition ).x;
				float viewZ = perspectiveDepthToViewZ( fragCoordZ, cameraNear, cameraFar );
				return viewZToOrthographicDepth( viewZ, cameraNear, cameraFar );

			#else

				return texture2D( tDepth, screenPosition ).x;

			#endif

		}

		void main() {

			float depth = getLinearDepth( vUv );
			gl_FragColor = vec4( vec3( 1.0 - depth ), 1.0 );

		}`},ut={name:`SSAOBlurShader`,uniforms:{tDiffuse:{value:null},resolution:{value:new g}},vertexShader:`varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`uniform sampler2D tDiffuse;

		uniform vec2 resolution;

		varying vec2 vUv;

		void main() {

			vec2 texelSize = ( 1.0 / resolution );
			float result = 0.0;

			for ( int i = - 2; i <= 2; i ++ ) {

				for ( int j = - 2; j <= 2; j ++ ) {

					vec2 offset = ( vec2( float( i ), float( j ) ) ) * texelSize;
					result += texture2D( tDiffuse, vUv + offset ).r;

				}

			}

			gl_FragColor = vec4( vec3( result / ( 5.0 * 5.0 ) ), 1.0 );

		}`},dt=class e extends Xe{constructor(e,t,n=512,r=512,i=32){super(),this.width=n,this.height=r,this.clear=!0,this.needsSwap=!1,this.camera=t,this.scene=e,this.kernelRadius=8,this.kernel=[],this.noiseTexture=null,this.output=0,this.minDistance=.005,this.maxDistance=.1,this._visibilityCache=[],this._generateSampleKernel(i),this._generateRandomKernelRotations();let a=new Be;a.format=oe,a.type=f,this.normalRenderTarget=new Ge(this.width,this.height,{minFilter:ae,magFilter:ae,type:T,depthTexture:a}),this.ssaoRenderTarget=new Ge(this.width,this.height,{type:T}),this.blurRenderTarget=this.ssaoRenderTarget.clone(),this.ssaoMaterial=new P({defines:Object.assign({},ct.defines),uniforms:O.clone(ct.uniforms),vertexShader:ct.vertexShader,fragmentShader:ct.fragmentShader,blending:0}),this.ssaoMaterial.defines.KERNEL_SIZE=i,this.ssaoMaterial.uniforms.tNormal.value=this.normalRenderTarget.texture,this.ssaoMaterial.uniforms.tDepth.value=this.normalRenderTarget.depthTexture,this.ssaoMaterial.uniforms.tNoise.value=this.noiseTexture,this.ssaoMaterial.uniforms.kernel.value=this.kernel,this.ssaoMaterial.uniforms.cameraNear.value=this.camera.near,this.ssaoMaterial.uniforms.cameraFar.value=this.camera.far,this.ssaoMaterial.uniforms.resolution.value.set(this.width,this.height),this.ssaoMaterial.uniforms.cameraProjectionMatrix.value.copy(this.camera.projectionMatrix),this.ssaoMaterial.uniforms.cameraInverseProjectionMatrix.value.copy(this.camera.projectionMatrixInverse),this.normalMaterial=new Ne,this.normalMaterial.blending=0,this.blurMaterial=new P({defines:Object.assign({},ut.defines),uniforms:O.clone(ut.uniforms),vertexShader:ut.vertexShader,fragmentShader:ut.fragmentShader}),this.blurMaterial.uniforms.tDiffuse.value=this.ssaoRenderTarget.texture,this.blurMaterial.uniforms.resolution.value.set(this.width,this.height),this.depthRenderMaterial=new P({defines:Object.assign({},lt.defines),uniforms:O.clone(lt.uniforms),vertexShader:lt.vertexShader,fragmentShader:lt.fragmentShader,blending:0}),this.depthRenderMaterial.uniforms.tDepth.value=this.normalRenderTarget.depthTexture,this.depthRenderMaterial.uniforms.cameraNear.value=this.camera.near,this.depthRenderMaterial.uniforms.cameraFar.value=this.camera.far,this.copyMaterial=new P({uniforms:O.clone(Ye.uniforms),vertexShader:Ye.vertexShader,fragmentShader:Ye.fragmentShader,transparent:!0,depthTest:!1,depthWrite:!1,blendSrc:208,blendDst:200,blendEquation:100,blendSrcAlpha:206,blendDstAlpha:200,blendEquationAlpha:100}),this._fsQuad=new $e(null),this._originalClearColor=new B}dispose(){this.normalRenderTarget.dispose(),this.ssaoRenderTarget.dispose(),this.blurRenderTarget.dispose(),this.normalMaterial.dispose(),this.blurMaterial.dispose(),this.copyMaterial.dispose(),this.depthRenderMaterial.dispose(),this._fsQuad.dispose()}render(t,n,r){switch(this._overrideVisibility(),this._renderOverride(t,this.normalMaterial,this.normalRenderTarget,7829503,1),this._restoreVisibility(),this.ssaoMaterial.uniforms.kernelRadius.value=this.kernelRadius,this.ssaoMaterial.uniforms.minDistance.value=this.minDistance,this.ssaoMaterial.uniforms.maxDistance.value=this.maxDistance,this._renderPass(t,this.ssaoMaterial,this.ssaoRenderTarget),this._renderPass(t,this.blurMaterial,this.blurRenderTarget),this.output){case e.OUTPUT.SSAO:this.copyMaterial.uniforms.tDiffuse.value=this.ssaoRenderTarget.texture,this.copyMaterial.blending=0,this._renderPass(t,this.copyMaterial,this.renderToScreen?null:r);break;case e.OUTPUT.Blur:this.copyMaterial.uniforms.tDiffuse.value=this.blurRenderTarget.texture,this.copyMaterial.blending=0,this._renderPass(t,this.copyMaterial,this.renderToScreen?null:r);break;case e.OUTPUT.Depth:this._renderPass(t,this.depthRenderMaterial,this.renderToScreen?null:r);break;case e.OUTPUT.Normal:this.copyMaterial.uniforms.tDiffuse.value=this.normalRenderTarget.texture,this.copyMaterial.blending=0,this._renderPass(t,this.copyMaterial,this.renderToScreen?null:r);break;case e.OUTPUT.Default:this.copyMaterial.uniforms.tDiffuse.value=this.blurRenderTarget.texture,this.copyMaterial.blending=5,this._renderPass(t,this.copyMaterial,this.renderToScreen?null:r);break;default:console.warn(`THREE.SSAOPass: Unknown output type.`)}}setSize(e,t){this.width=e,this.height=t,this.ssaoRenderTarget.setSize(e,t),this.normalRenderTarget.setSize(e,t),this.blurRenderTarget.setSize(e,t),this.ssaoMaterial.uniforms.resolution.value.set(e,t),this.ssaoMaterial.uniforms.cameraProjectionMatrix.value.copy(this.camera.projectionMatrix),this.ssaoMaterial.uniforms.cameraInverseProjectionMatrix.value.copy(this.camera.projectionMatrixInverse),this.blurMaterial.uniforms.resolution.value.set(e,t)}_renderPass(e,t,n,r,i){e.getClearColor(this._originalClearColor);let a=e.getClearAlpha(),o=e.autoClear;e.setRenderTarget(n),e.autoClear=!1,r!=null&&(e.setClearColor(r),e.setClearAlpha(i||0),e.clear()),this._fsQuad.material=t,this._fsQuad.render(e),e.autoClear=o,e.setClearColor(this._originalClearColor),e.setClearAlpha(a)}_renderOverride(e,t,n,r,i){e.getClearColor(this._originalClearColor);let a=e.getClearAlpha(),o=e.autoClear;e.setRenderTarget(n),e.autoClear=!1,r=t.clearColor||r,i=t.clearAlpha||i,r!=null&&(e.setClearColor(r),e.setClearAlpha(i||0),e.clear()),this.scene.overrideMaterial=t,e.render(this.scene,this.camera),this.scene.overrideMaterial=null,e.autoClear=o,e.setClearColor(this._originalClearColor),e.setClearAlpha(a)}_generateSampleKernel(e){let t=this.kernel;for(let n=0;n<e;n++){let r=new b;r.x=Math.random()*2-1,r.y=Math.random()*2-1,r.z=Math.random(),r.normalize();let i=n/e;i=re.lerp(.1,1,i*i),r.multiplyScalar(i),t.push(r)}}_generateRandomKernelRotations(){let e=new st,t=new Float32Array(16);for(let n=0;n<16;n++){let r=Math.random()*2-1,i=Math.random()*2-1;t[n]=e.noise3d(r,i,0)}this.noiseTexture=new He(t,4,4,Ve,N),this.noiseTexture.wrapS=M,this.noiseTexture.wrapT=M,this.noiseTexture.needsUpdate=!0}_overrideVisibility(){let e=this.scene,t=this._visibilityCache;e.traverse(function(e){(e.isPoints||e.isLine||e.isLine2)&&e.visible&&(e.visible=!1,t.push(e))})}_restoreVisibility(){let e=this._visibilityCache;for(let t=0;t<e.length;t++)e[t].visible=!0;e.length=0}};dt.OUTPUT={Default:0,SSAO:1,Blur:2,Depth:3,Normal:4};var ft={name:`BokehShader`,defines:{DEPTH_PACKING:1,PERSPECTIVE_CAMERA:1},uniforms:{tColor:{value:null},tDepth:{value:null},focus:{value:1},aspect:{value:1},aperture:{value:.025},maxblur:{value:.01},nearClip:{value:1},farClip:{value:1e3}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		#include <common>

		varying vec2 vUv;

		uniform sampler2D tColor;
		uniform sampler2D tDepth;

		uniform float maxblur; // max blur amount
		uniform float aperture; // aperture - bigger values for shallower depth of field

		uniform float nearClip;
		uniform float farClip;

		uniform float focus;
		uniform float aspect;

		#include <packing>

		float getDepth( const in vec2 screenPosition ) {
			#if DEPTH_PACKING == 1
			return unpackRGBAToDepth( texture2D( tDepth, screenPosition ) );
			#else
			return texture2D( tDepth, screenPosition ).x;
			#endif
		}

		float getViewZ( const in float depth ) {
			#if PERSPECTIVE_CAMERA == 1
			return perspectiveDepthToViewZ( depth, nearClip, farClip );
			#else
			return orthographicDepthToViewZ( depth, nearClip, farClip );
			#endif
		}


		void main() {

			vec2 aspectcorrect = vec2( 1.0, aspect );

			float viewZ = getViewZ( getDepth( vUv ) );

			float factor = ( focus + viewZ ); // viewZ is <= 0, so this is a difference equation

			vec2 dofblur = vec2 ( clamp( factor * aperture, -maxblur, maxblur ) );

			vec2 dofblur9 = dofblur * 0.9;
			vec2 dofblur7 = dofblur * 0.7;
			vec2 dofblur4 = dofblur * 0.4;

			vec4 col = vec4( 0.0 );

			col += texture2D( tColor, vUv.xy );
			col += texture2D( tColor, vUv.xy + ( vec2(  0.0,   0.4  ) * aspectcorrect ) * dofblur );
			col += texture2D( tColor, vUv.xy + ( vec2(  0.15,  0.37 ) * aspectcorrect ) * dofblur );
			col += texture2D( tColor, vUv.xy + ( vec2(  0.29,  0.29 ) * aspectcorrect ) * dofblur );
			col += texture2D( tColor, vUv.xy + ( vec2( -0.37,  0.15 ) * aspectcorrect ) * dofblur );
			col += texture2D( tColor, vUv.xy + ( vec2(  0.40,  0.0  ) * aspectcorrect ) * dofblur );
			col += texture2D( tColor, vUv.xy + ( vec2(  0.37, -0.15 ) * aspectcorrect ) * dofblur );
			col += texture2D( tColor, vUv.xy + ( vec2(  0.29, -0.29 ) * aspectcorrect ) * dofblur );
			col += texture2D( tColor, vUv.xy + ( vec2( -0.15, -0.37 ) * aspectcorrect ) * dofblur );
			col += texture2D( tColor, vUv.xy + ( vec2(  0.0,  -0.4  ) * aspectcorrect ) * dofblur );
			col += texture2D( tColor, vUv.xy + ( vec2( -0.15,  0.37 ) * aspectcorrect ) * dofblur );
			col += texture2D( tColor, vUv.xy + ( vec2( -0.29,  0.29 ) * aspectcorrect ) * dofblur );
			col += texture2D( tColor, vUv.xy + ( vec2(  0.37,  0.15 ) * aspectcorrect ) * dofblur );
			col += texture2D( tColor, vUv.xy + ( vec2( -0.4,   0.0  ) * aspectcorrect ) * dofblur );
			col += texture2D( tColor, vUv.xy + ( vec2( -0.37, -0.15 ) * aspectcorrect ) * dofblur );
			col += texture2D( tColor, vUv.xy + ( vec2( -0.29, -0.29 ) * aspectcorrect ) * dofblur );
			col += texture2D( tColor, vUv.xy + ( vec2(  0.15, -0.37 ) * aspectcorrect ) * dofblur );

			col += texture2D( tColor, vUv.xy + ( vec2(  0.15,  0.37 ) * aspectcorrect ) * dofblur9 );
			col += texture2D( tColor, vUv.xy + ( vec2( -0.37,  0.15 ) * aspectcorrect ) * dofblur9 );
			col += texture2D( tColor, vUv.xy + ( vec2(  0.37, -0.15 ) * aspectcorrect ) * dofblur9 );
			col += texture2D( tColor, vUv.xy + ( vec2( -0.15, -0.37 ) * aspectcorrect ) * dofblur9 );
			col += texture2D( tColor, vUv.xy + ( vec2( -0.15,  0.37 ) * aspectcorrect ) * dofblur9 );
			col += texture2D( tColor, vUv.xy + ( vec2(  0.37,  0.15 ) * aspectcorrect ) * dofblur9 );
			col += texture2D( tColor, vUv.xy + ( vec2( -0.37, -0.15 ) * aspectcorrect ) * dofblur9 );
			col += texture2D( tColor, vUv.xy + ( vec2(  0.15, -0.37 ) * aspectcorrect ) * dofblur9 );

			col += texture2D( tColor, vUv.xy + ( vec2(  0.29,  0.29 ) * aspectcorrect ) * dofblur7 );
			col += texture2D( tColor, vUv.xy + ( vec2(  0.40,  0.0  ) * aspectcorrect ) * dofblur7 );
			col += texture2D( tColor, vUv.xy + ( vec2(  0.29, -0.29 ) * aspectcorrect ) * dofblur7 );
			col += texture2D( tColor, vUv.xy + ( vec2(  0.0,  -0.4  ) * aspectcorrect ) * dofblur7 );
			col += texture2D( tColor, vUv.xy + ( vec2( -0.29,  0.29 ) * aspectcorrect ) * dofblur7 );
			col += texture2D( tColor, vUv.xy + ( vec2( -0.4,   0.0  ) * aspectcorrect ) * dofblur7 );
			col += texture2D( tColor, vUv.xy + ( vec2( -0.29, -0.29 ) * aspectcorrect ) * dofblur7 );
			col += texture2D( tColor, vUv.xy + ( vec2(  0.0,   0.4  ) * aspectcorrect ) * dofblur7 );

			col += texture2D( tColor, vUv.xy + ( vec2(  0.29,  0.29 ) * aspectcorrect ) * dofblur4 );
			col += texture2D( tColor, vUv.xy + ( vec2(  0.4,   0.0  ) * aspectcorrect ) * dofblur4 );
			col += texture2D( tColor, vUv.xy + ( vec2(  0.29, -0.29 ) * aspectcorrect ) * dofblur4 );
			col += texture2D( tColor, vUv.xy + ( vec2(  0.0,  -0.4  ) * aspectcorrect ) * dofblur4 );
			col += texture2D( tColor, vUv.xy + ( vec2( -0.29,  0.29 ) * aspectcorrect ) * dofblur4 );
			col += texture2D( tColor, vUv.xy + ( vec2( -0.4,   0.0  ) * aspectcorrect ) * dofblur4 );
			col += texture2D( tColor, vUv.xy + ( vec2( -0.29, -0.29 ) * aspectcorrect ) * dofblur4 );
			col += texture2D( tColor, vUv.xy + ( vec2(  0.0,   0.4  ) * aspectcorrect ) * dofblur4 );

			gl_FragColor = col / 41.0;
			gl_FragColor.a = 1.0;

		}`},pt=class extends Xe{constructor(e,t,n){super(),this.scene=e,this.camera=t;let r=n.focus===void 0?1:n.focus,i=n.aperture===void 0?.025:n.aperture,a=n.maxblur===void 0?1:n.maxblur;this._renderTargetDepth=new Ge(1,1,{minFilter:ae,magFilter:ae,type:T}),this._renderTargetDepth.texture.name=`BokehPass.depth`,this._materialDepth=new fe,this._materialDepth.depthPacking=Ue,this._materialDepth.blending=0;let o=O.clone(ft.uniforms);o.tDepth.value=this._renderTargetDepth.texture,o.focus.value=r,o.aspect.value=t.aspect,o.aperture.value=i,o.maxblur.value=a,o.nearClip.value=t.near,o.farClip.value=t.far,this.materialBokeh=new P({defines:Object.assign({},ft.defines),uniforms:o,vertexShader:ft.vertexShader,fragmentShader:ft.fragmentShader}),this.uniforms=o,this._fsQuad=new $e(this.materialBokeh),this._oldClearColor=new B}render(e,t,n){this.scene.overrideMaterial=this._materialDepth,e.getClearColor(this._oldClearColor);let r=e.getClearAlpha(),i=e.autoClear;e.autoClear=!1,e.setClearColor(16777215),e.setClearAlpha(1),e.setRenderTarget(this._renderTargetDepth),e.clear(),e.render(this.scene,this.camera),this.uniforms.tColor.value=n.texture,this.uniforms.nearClip.value=this.camera.near,this.uniforms.farClip.value=this.camera.far,this.renderToScreen?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(t),e.clear(),this._fsQuad.render(e)),this.scene.overrideMaterial=null,e.setClearColor(this._oldClearColor),e.setClearAlpha(r),e.autoClear=i}setSize(e,t){this.materialBokeh.uniforms.aspect.value=e/t,this._renderTargetDepth.setSize(e,t)}dispose(){this._renderTargetDepth.dispose(),this._materialDepth.dispose(),this.materialBokeh.dispose(),this._fsQuad.dispose()}},mt={uniforms:{tDiffuse:{value:null},amount:{value:.01}},vertexShader:`
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,fragmentShader:`
    uniform sampler2D tDiffuse;
    uniform float amount;
    varying vec2 vUv;
    void main() {
      vec2 dir   = vUv - 0.5;
      float dist = length(dir);
      vec2 off   = dir * dist * amount;
      float r = texture2D(tDiffuse, vUv + off).r;
      float g = texture2D(tDiffuse, vUv).g;
      float b = texture2D(tDiffuse, vUv - off).b;
      gl_FragColor = vec4(r, g, b, 1.0);
    }
  `},ht={uniforms:{tDiffuse:{value:null},uTime:{value:0},uGrainAmp:{value:.04}},vertexShader:`
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,fragmentShader:`
    uniform sampler2D tDiffuse;
    uniform float uTime;
    uniform float uGrainAmp;
    varying vec2 vUv;

    float filmGrain(vec2 uv, float t) {
      vec2 seed = uv * vec2(t * 127.1, t * 311.7);
      return fract(sin(dot(seed, vec2(12.9898, 78.233))) * 43758.5453) - 0.5;
    }

    void main() {
      vec4 color = texture2D(tDiffuse, vUv);

      // Film grain — skipped on mobile (uGrainAmp = 0)
      color.rgb += filmGrain(vUv, uTime) * uGrainAmp;

      // Vignette — smooth darkening toward edges
      vec2  vig         = (vUv - 0.5) * 2.0;
      float vigDist     = length(vig);
      float vignette    = 1.0 - smoothstep(0.3, 1.2, vigDist);
      color.rgb        *= vignette;

      gl_FragColor = color;
    }
  `};function gt(e,t,n,r=!1){let i=window.innerWidth,a=window.innerHeight,o=new rt(e);o.addPass(new it(t,n));let s=null,c=null;r||(s=new dt(t,n,i,a),s.kernelRadius=8,s.minDistance=.005,s.maxDistance=.1,o.addPass(s));let l=new ot(r?new g(i/2,a/2):new g(i,a),r?.18:.25,r?.35:.4,r?.92:.9);o.addPass(l),r||(c=new pt(t,n,{focus:4,aperture:1e-4,maxblur:.005}),o.addPass(c));let u=null;r||(u=new et(mt),o.addPass(u));let d=new et(ht);return r&&(d.uniforms.uGrainAmp.value=0),d.renderToScreen=!0,o.addPass(d),{composer:o,bloom:l,chroma:u,ssao:s,bokeh:c,grainVignette:d,setSize(e,t){o.setSize(e,t),l&&l.setSize(e,t),s&&s.setSize(e,t)}}}function _t(e,t){if(t===0)return console.warn(`THREE.BufferGeometryUtils.toTrianglesDrawMode(): Geometry already defined as triangles.`),e;if(t===2||t===1){let n=e.getIndex();if(n===null){let t=[],r=e.getAttribute(`position`);if(r!==void 0){for(let e=0;e<r.count;e++)t.push(e);e.setIndex(t),n=e.getIndex()}else return console.error(`THREE.BufferGeometryUtils.toTrianglesDrawMode(): Undefined position attribute. Processing not possible.`),e}let r=n.count-2,i=[];if(t===2)for(let e=1;e<=r;e++)i.push(n.getX(0)),i.push(n.getX(e)),i.push(n.getX(e+1));else for(let e=0;e<r;e++)e%2==0?(i.push(n.getX(e)),i.push(n.getX(e+1)),i.push(n.getX(e+2))):(i.push(n.getX(e+2)),i.push(n.getX(e+1)),i.push(n.getX(e)));i.length/3!==r&&console.error(`THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unable to generate correct amount of triangles.`);let a=e.clone();return a.setIndex(i),a.clearGroups(),a}else return console.error(`THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unknown draw mode:`,t),e}function vt(e){let t=new Map,n=new Map,r=e.clone();return yt(e,r,function(e,r){t.set(r,e),n.set(e,r)}),r.traverse(function(e){if(!e.isSkinnedMesh)return;let r=e,i=t.get(e),a=i.skeleton.bones;r.skeleton=i.skeleton.clone(),r.bindMatrix.copy(i.bindMatrix),r.skeleton.bones=a.map(function(e){return n.get(e)}),r.bind(r.skeleton,r.bindMatrix)}),r}function yt(e,t,n){n(e,t);for(let r=0;r<e.children.length;r++)yt(e.children[r],t.children[r],n)}var bt=class extends v{constructor(e){super(e),this.dracoLoader=null,this.ktx2Loader=null,this.meshoptDecoder=null,this.pluginCallbacks=[],this.register(function(e){return new Tt(e)}),this.register(function(e){return new Et(e)}),this.register(function(e){return new Ft(e)}),this.register(function(e){return new It(e)}),this.register(function(e){return new Lt(e)}),this.register(function(e){return new Ot(e)}),this.register(function(e){return new kt(e)}),this.register(function(e){return new At(e)}),this.register(function(e){return new jt(e)}),this.register(function(e){return new wt(e)}),this.register(function(e){return new Mt(e)}),this.register(function(e){return new Dt(e)}),this.register(function(e){return new Pt(e)}),this.register(function(e){return new Nt(e)}),this.register(function(e){return new St(e)}),this.register(function(e){return new Rt(e,q.EXT_MESHOPT_COMPRESSION)}),this.register(function(e){return new Rt(e,q.KHR_MESHOPT_COMPRESSION)}),this.register(function(e){return new zt(e)})}load(e,t,n,r){let i=this,o;if(this.resourcePath!==``)o=this.resourcePath;else if(this.path!==``){let t=W.extractUrlBase(e);o=W.resolveURL(t,this.path)}else o=W.extractUrlBase(e);this.manager.itemStart(e);let s=function(t){r?r(t):console.error(t),i.manager.itemError(e),i.manager.itemEnd(e)},c=new a(this.manager);c.setPath(this.path),c.setResponseType(`arraybuffer`),c.setRequestHeader(this.requestHeader),c.setWithCredentials(this.withCredentials),c.load(e,function(n){try{i.parse(n,o,function(n){t(n),i.manager.itemEnd(e)},s)}catch(e){s(e)}},n,s)}setDRACOLoader(e){return this.dracoLoader=e,this}setKTX2Loader(e){return this.ktx2Loader=e,this}setMeshoptDecoder(e){return this.meshoptDecoder=e,this}register(e){return this.pluginCallbacks.indexOf(e)===-1&&this.pluginCallbacks.push(e),this}unregister(e){return this.pluginCallbacks.indexOf(e)!==-1&&this.pluginCallbacks.splice(this.pluginCallbacks.indexOf(e),1),this}parse(e,t,n,r){let i,a={},o={},s=new TextDecoder;if(typeof e==`string`)i=JSON.parse(e);else if(e instanceof ArrayBuffer)if(s.decode(new Uint8Array(e,0,4))===Bt){try{a[q.KHR_BINARY_GLTF]=new Ut(e)}catch(e){r&&r(e);return}i=JSON.parse(a[q.KHR_BINARY_GLTF].content)}else i=JSON.parse(s.decode(e));else i=e;if(i.asset===void 0||i.asset.version[0]<2){r&&r(Error(`THREE.GLTFLoader: Unsupported asset. glTF versions >=2.0 are supported.`));return}let c=new mn(i,{path:t||this.resourcePath||``,crossOrigin:this.crossOrigin,requestHeader:this.requestHeader,manager:this.manager,ktx2Loader:this.ktx2Loader,meshoptDecoder:this.meshoptDecoder});c.fileLoader.setRequestHeader(this.requestHeader);for(let e=0;e<this.pluginCallbacks.length;e++){let t=this.pluginCallbacks[e](c);t.name||console.error(`THREE.GLTFLoader: Invalid plugin found: missing name`),o[t.name]=t,a[t.name]=!0}if(i.extensionsUsed)for(let e=0;e<i.extensionsUsed.length;++e){let t=i.extensionsUsed[e],n=i.extensionsRequired||[];switch(t){case q.KHR_MATERIALS_UNLIT:a[t]=new Ct;break;case q.KHR_DRACO_MESH_COMPRESSION:a[t]=new Wt(i,this.dracoLoader);break;case q.KHR_TEXTURE_TRANSFORM:a[t]=new Gt;break;case q.KHR_MESH_QUANTIZATION:a[t]=new Kt;break;default:n.indexOf(t)>=0&&o[t]===void 0&&console.warn(`THREE.GLTFLoader: Unknown extension "`+t+`".`)}}c.setExtensions(a),c.setPlugins(o),c.parse(n,r)}parseAsync(e,t){let n=this;return new Promise(function(r,i){n.parse(e,t,r,i)})}};function xt(){let e={};return{get:function(t){return e[t]},add:function(t,n){e[t]=n},remove:function(t){delete e[t]},removeAll:function(){e={}}}}function K(e,t,n){let r=e.json.materials[t];return r.extensions&&r.extensions[n]?r.extensions[n]:null}var q={KHR_BINARY_GLTF:`KHR_binary_glTF`,KHR_DRACO_MESH_COMPRESSION:`KHR_draco_mesh_compression`,KHR_LIGHTS_PUNCTUAL:`KHR_lights_punctual`,KHR_MATERIALS_CLEARCOAT:`KHR_materials_clearcoat`,KHR_MATERIALS_DISPERSION:`KHR_materials_dispersion`,KHR_MATERIALS_IOR:`KHR_materials_ior`,KHR_MATERIALS_SHEEN:`KHR_materials_sheen`,KHR_MATERIALS_SPECULAR:`KHR_materials_specular`,KHR_MATERIALS_TRANSMISSION:`KHR_materials_transmission`,KHR_MATERIALS_IRIDESCENCE:`KHR_materials_iridescence`,KHR_MATERIALS_ANISOTROPY:`KHR_materials_anisotropy`,KHR_MATERIALS_UNLIT:`KHR_materials_unlit`,KHR_MATERIALS_VOLUME:`KHR_materials_volume`,KHR_TEXTURE_BASISU:`KHR_texture_basisu`,KHR_TEXTURE_TRANSFORM:`KHR_texture_transform`,KHR_MESH_QUANTIZATION:`KHR_mesh_quantization`,KHR_MATERIALS_EMISSIVE_STRENGTH:`KHR_materials_emissive_strength`,EXT_MATERIALS_BUMP:`EXT_materials_bump`,EXT_TEXTURE_WEBP:`EXT_texture_webp`,EXT_TEXTURE_AVIF:`EXT_texture_avif`,EXT_MESHOPT_COMPRESSION:`EXT_meshopt_compression`,KHR_MESHOPT_COMPRESSION:`KHR_meshopt_compression`,EXT_MESH_GPU_INSTANCING:`EXT_mesh_gpu_instancing`},St=class{constructor(e){this.parser=e,this.name=q.KHR_LIGHTS_PUNCTUAL,this.cache={refs:{},uses:{}}}_markDefs(){let e=this.parser,t=this.parser.json.nodes||[];for(let n=0,r=t.length;n<r;n++){let r=t[n];r.extensions&&r.extensions[this.name]&&r.extensions[this.name].light!==void 0&&e._addNodeRef(this.cache,r.extensions[this.name].light)}}_loadLight(e){let t=this.parser,n=`light:`+e,r=t.cache.get(n);if(r)return r;let i=t.json,a=((i.extensions&&i.extensions[this.name]||{}).lights||[])[e],o,s=new B(16777215);a.color!==void 0&&s.setRGB(a.color[0],a.color[1],a.color[2],p);let c=a.range===void 0?0:a.range;switch(a.type){case`directional`:o=new j(s),o.target.position.set(0,0,-1),o.add(o.target);break;case`point`:o=new ke(s),o.distance=c;break;case`spot`:o=new V(s),o.distance=c,a.spot=a.spot||{},a.spot.innerConeAngle=a.spot.innerConeAngle===void 0?0:a.spot.innerConeAngle,a.spot.outerConeAngle=a.spot.outerConeAngle===void 0?Math.PI/4:a.spot.outerConeAngle,o.angle=a.spot.outerConeAngle,o.penumbra=1-a.spot.innerConeAngle/a.spot.outerConeAngle,o.target.position.set(0,0,-1),o.add(o.target);break;default:throw Error(`THREE.GLTFLoader: Unexpected light type: `+a.type)}return o.position.set(0,0,0),Y(o,a),a.intensity!==void 0&&(o.intensity=a.intensity),o.name=t.createUniqueName(a.name||`light_`+e),r=Promise.resolve(o),t.cache.add(n,r),r}getDependency(e,t){if(e===`light`)return this._loadLight(t)}createNodeAttachment(e){let t=this,n=this.parser,r=n.json.nodes[e],i=(r.extensions&&r.extensions[this.name]||{}).light;return i===void 0?null:this._loadLight(i).then(function(e){return n._getNodeRef(t.cache,i,e)})}},Ct=class{constructor(){this.name=q.KHR_MATERIALS_UNLIT}getMaterialType(){return e}extendParams(e,t,n){let r=[];e.color=new B(1,1,1),e.opacity=1;let i=t.pbrMetallicRoughness;if(i){if(Array.isArray(i.baseColorFactor)){let t=i.baseColorFactor;e.color.setRGB(t[0],t[1],t[2],p),e.opacity=t[3]}i.baseColorTexture!==void 0&&r.push(n.assignTexture(e,`map`,i.baseColorTexture,o))}return Promise.all(r)}},wt=class{constructor(e){this.parser=e,this.name=q.KHR_MATERIALS_EMISSIVE_STRENGTH}extendMaterialParams(e,t){let n=K(this.parser,e,this.name);return n===null||n.emissiveStrength!==void 0&&(t.emissiveIntensity=n.emissiveStrength),Promise.resolve()}},Tt=class{constructor(e){this.parser=e,this.name=q.KHR_MATERIALS_CLEARCOAT}getMaterialType(e){return K(this.parser,e,this.name)===null?null:U}extendMaterialParams(e,t){let n=K(this.parser,e,this.name);if(n===null)return Promise.resolve();let r=[];if(n.clearcoatFactor!==void 0&&(t.clearcoat=n.clearcoatFactor),n.clearcoatTexture!==void 0&&r.push(this.parser.assignTexture(t,`clearcoatMap`,n.clearcoatTexture)),n.clearcoatRoughnessFactor!==void 0&&(t.clearcoatRoughness=n.clearcoatRoughnessFactor),n.clearcoatRoughnessTexture!==void 0&&r.push(this.parser.assignTexture(t,`clearcoatRoughnessMap`,n.clearcoatRoughnessTexture)),n.clearcoatNormalTexture!==void 0&&(r.push(this.parser.assignTexture(t,`clearcoatNormalMap`,n.clearcoatNormalTexture)),n.clearcoatNormalTexture.scale!==void 0)){let e=n.clearcoatNormalTexture.scale;t.clearcoatNormalScale=new g(e,e)}return Promise.all(r)}},Et=class{constructor(e){this.parser=e,this.name=q.KHR_MATERIALS_DISPERSION}getMaterialType(e){return K(this.parser,e,this.name)===null?null:U}extendMaterialParams(e,t){let n=K(this.parser,e,this.name);return n===null||(t.dispersion=n.dispersion===void 0?0:n.dispersion),Promise.resolve()}},Dt=class{constructor(e){this.parser=e,this.name=q.KHR_MATERIALS_IRIDESCENCE}getMaterialType(e){return K(this.parser,e,this.name)===null?null:U}extendMaterialParams(e,t){let n=K(this.parser,e,this.name);if(n===null)return Promise.resolve();let r=[];return n.iridescenceFactor!==void 0&&(t.iridescence=n.iridescenceFactor),n.iridescenceTexture!==void 0&&r.push(this.parser.assignTexture(t,`iridescenceMap`,n.iridescenceTexture)),n.iridescenceIor!==void 0&&(t.iridescenceIOR=n.iridescenceIor),t.iridescenceThicknessRange===void 0&&(t.iridescenceThicknessRange=[100,400]),n.iridescenceThicknessMinimum!==void 0&&(t.iridescenceThicknessRange[0]=n.iridescenceThicknessMinimum),n.iridescenceThicknessMaximum!==void 0&&(t.iridescenceThicknessRange[1]=n.iridescenceThicknessMaximum),n.iridescenceThicknessTexture!==void 0&&r.push(this.parser.assignTexture(t,`iridescenceThicknessMap`,n.iridescenceThicknessTexture)),Promise.all(r)}},Ot=class{constructor(e){this.parser=e,this.name=q.KHR_MATERIALS_SHEEN}getMaterialType(e){return K(this.parser,e,this.name)===null?null:U}extendMaterialParams(e,t){let n=K(this.parser,e,this.name);if(n===null)return Promise.resolve();let r=[];if(t.sheenColor=new B(0,0,0),t.sheenRoughness=0,t.sheen=1,n.sheenColorFactor!==void 0){let e=n.sheenColorFactor;t.sheenColor.setRGB(e[0],e[1],e[2],p)}return n.sheenRoughnessFactor!==void 0&&(t.sheenRoughness=n.sheenRoughnessFactor),n.sheenColorTexture!==void 0&&r.push(this.parser.assignTexture(t,`sheenColorMap`,n.sheenColorTexture,o)),n.sheenRoughnessTexture!==void 0&&r.push(this.parser.assignTexture(t,`sheenRoughnessMap`,n.sheenRoughnessTexture)),Promise.all(r)}},kt=class{constructor(e){this.parser=e,this.name=q.KHR_MATERIALS_TRANSMISSION}getMaterialType(e){return K(this.parser,e,this.name)===null?null:U}extendMaterialParams(e,t){let n=K(this.parser,e,this.name);if(n===null)return Promise.resolve();let r=[];return n.transmissionFactor!==void 0&&(t.transmission=n.transmissionFactor),n.transmissionTexture!==void 0&&r.push(this.parser.assignTexture(t,`transmissionMap`,n.transmissionTexture)),Promise.all(r)}},At=class{constructor(e){this.parser=e,this.name=q.KHR_MATERIALS_VOLUME}getMaterialType(e){return K(this.parser,e,this.name)===null?null:U}extendMaterialParams(e,t){let n=K(this.parser,e,this.name);if(n===null)return Promise.resolve();let r=[];t.thickness=n.thicknessFactor===void 0?0:n.thicknessFactor,n.thicknessTexture!==void 0&&r.push(this.parser.assignTexture(t,`thicknessMap`,n.thicknessTexture)),t.attenuationDistance=n.attenuationDistance||1/0;let i=n.attenuationColor||[1,1,1];return t.attenuationColor=new B().setRGB(i[0],i[1],i[2],p),Promise.all(r)}},jt=class{constructor(e){this.parser=e,this.name=q.KHR_MATERIALS_IOR}getMaterialType(e){return K(this.parser,e,this.name)===null?null:U}extendMaterialParams(e,t){let n=K(this.parser,e,this.name);return n===null?Promise.resolve():(t.ior=n.ior===void 0?1.5:n.ior,t.ior===0&&(t.ior=1e3),Promise.resolve())}},Mt=class{constructor(e){this.parser=e,this.name=q.KHR_MATERIALS_SPECULAR}getMaterialType(e){return K(this.parser,e,this.name)===null?null:U}extendMaterialParams(e,t){let n=K(this.parser,e,this.name);if(n===null)return Promise.resolve();let r=[];t.specularIntensity=n.specularFactor===void 0?1:n.specularFactor,n.specularTexture!==void 0&&r.push(this.parser.assignTexture(t,`specularIntensityMap`,n.specularTexture));let i=n.specularColorFactor||[1,1,1];return t.specularColor=new B().setRGB(i[0],i[1],i[2],p),n.specularColorTexture!==void 0&&r.push(this.parser.assignTexture(t,`specularColorMap`,n.specularColorTexture,o)),Promise.all(r)}},Nt=class{constructor(e){this.parser=e,this.name=q.EXT_MATERIALS_BUMP}getMaterialType(e){return K(this.parser,e,this.name)===null?null:U}extendMaterialParams(e,t){let n=K(this.parser,e,this.name);if(n===null)return Promise.resolve();let r=[];return t.bumpScale=n.bumpFactor===void 0?1:n.bumpFactor,n.bumpTexture!==void 0&&r.push(this.parser.assignTexture(t,`bumpMap`,n.bumpTexture)),Promise.all(r)}},Pt=class{constructor(e){this.parser=e,this.name=q.KHR_MATERIALS_ANISOTROPY}getMaterialType(e){return K(this.parser,e,this.name)===null?null:U}extendMaterialParams(e,t){let n=K(this.parser,e,this.name);if(n===null)return Promise.resolve();let r=[];return n.anisotropyStrength!==void 0&&(t.anisotropy=n.anisotropyStrength),n.anisotropyRotation!==void 0&&(t.anisotropyRotation=n.anisotropyRotation),n.anisotropyTexture!==void 0&&r.push(this.parser.assignTexture(t,`anisotropyMap`,n.anisotropyTexture)),Promise.all(r)}},Ft=class{constructor(e){this.parser=e,this.name=q.KHR_TEXTURE_BASISU}loadTexture(e){let t=this.parser,n=t.json,r=n.textures[e];if(!r.extensions||!r.extensions[this.name])return null;let i=r.extensions[this.name],a=t.options.ktx2Loader;if(!a){if(n.extensionsRequired&&n.extensionsRequired.indexOf(this.name)>=0)throw Error(`THREE.GLTFLoader: setKTX2Loader must be called before loading KTX2 textures`);return null}return t.loadTextureImage(e,i.source,a)}},It=class{constructor(e){this.parser=e,this.name=q.EXT_TEXTURE_WEBP}loadTexture(e){let t=this.name,n=this.parser,r=n.json,i=r.textures[e];if(!i.extensions||!i.extensions[t])return null;let a=i.extensions[t],o=r.images[a.source],s=n.textureLoader;if(o.uri){let e=n.options.manager.getHandler(o.uri);e!==null&&(s=e)}return n.loadTextureImage(e,a.source,s)}},Lt=class{constructor(e){this.parser=e,this.name=q.EXT_TEXTURE_AVIF}loadTexture(e){let t=this.name,n=this.parser,r=n.json,i=r.textures[e];if(!i.extensions||!i.extensions[t])return null;let a=i.extensions[t],o=r.images[a.source],s=n.textureLoader;if(o.uri){let e=n.options.manager.getHandler(o.uri);e!==null&&(s=e)}return n.loadTextureImage(e,a.source,s)}},Rt=class{constructor(e,t){this.name=t,this.parser=e}loadBufferView(e){let t=this.parser.json,n=t.bufferViews[e];if(n.extensions&&n.extensions[this.name]){let e=n.extensions[this.name],r=this.parser.getDependency(`buffer`,e.buffer),i=this.parser.options.meshoptDecoder;if(!i||!i.supported){if(t.extensionsRequired&&t.extensionsRequired.indexOf(this.name)>=0)throw Error(`THREE.GLTFLoader: setMeshoptDecoder must be called before loading compressed files`);return null}return r.then(function(t){let n=e.byteOffset||0,r=e.byteLength||0,a=e.count,o=e.byteStride,s=new Uint8Array(t,n,r);return i.decodeGltfBufferAsync?i.decodeGltfBufferAsync(a,o,s,e.mode,e.filter).then(function(e){return e.buffer}):i.ready.then(function(){let t=new ArrayBuffer(a*o);return i.decodeGltfBuffer(new Uint8Array(t),a,o,s,e.mode,e.filter),t})})}else return null}},zt=class{constructor(e){this.name=q.EXT_MESH_GPU_INSTANCING,this.parser=e}createNodeMesh(e){let t=this.parser.json,n=t.nodes[e];if(!n.extensions||!n.extensions[this.name]||n.mesh===void 0)return null;let r=t.meshes[n.mesh];for(let e of r.primitives)if(e.mode!==J.TRIANGLES&&e.mode!==J.TRIANGLE_STRIP&&e.mode!==J.TRIANGLE_FAN&&e.mode!==void 0)return null;let i=n.extensions[this.name].attributes,a=[],o={};for(let e in i)a.push(this.parser.getDependency(`accessor`,i[e]).then(t=>(o[e]=t,o[e])));return a.length<1?null:(a.push(this.parser.createNodeMesh(e)),Promise.all(a).then(e=>{let t=e.pop(),n=t.isGroup?t.children:[t],r=e[0].count,i=[];for(let e of n){let t=new I,n=new b,a=new R,s=new b(1,1,1),c=new x(e.geometry,e.material,r);for(let e=0;e<r;e++)o.TRANSLATION&&n.fromBufferAttribute(o.TRANSLATION,e),o.ROTATION&&a.fromBufferAttribute(o.ROTATION,e),o.SCALE&&s.fromBufferAttribute(o.SCALE,e),c.setMatrixAt(e,t.compose(n,a,s));for(let t in o)if(t===`_COLOR_0`){let e=o[t];c.instanceColor=new ye(e.array,e.itemSize,e.normalized)}else t!==`TRANSLATION`&&t!==`ROTATION`&&t!==`SCALE`&&e.geometry.setAttribute(t,o[t]);Ce.prototype.copy.call(c,e),this.parser.assignFinalMaterial(c),i.push(c)}return t.isGroup?(t.clear(),t.add(...i),t):i[0]}))}},Bt=`glTF`,Vt=12,Ht={JSON:1313821514,BIN:5130562},Ut=class{constructor(e){this.name=q.KHR_BINARY_GLTF,this.content=null,this.body=null;let t=new DataView(e,0,Vt),n=new TextDecoder;if(this.header={magic:n.decode(new Uint8Array(e.slice(0,4))),version:t.getUint32(4,!0),length:t.getUint32(8,!0)},this.header.magic!==Bt)throw Error(`THREE.GLTFLoader: Unsupported glTF-Binary header.`);if(this.header.version<2)throw Error(`THREE.GLTFLoader: Legacy binary file detected.`);let r=this.header.length-Vt,i=new DataView(e,Vt),a=0;for(;a<r;){let t=i.getUint32(a,!0);a+=4;let r=i.getUint32(a,!0);if(a+=4,r===Ht.JSON){let r=new Uint8Array(e,Vt+a,t);this.content=n.decode(r)}else if(r===Ht.BIN){let n=Vt+a;this.body=e.slice(n,n+t)}a+=t}if(this.content===null)throw Error(`THREE.GLTFLoader: JSON content not found.`)}},Wt=class{constructor(e,t){if(!t)throw Error(`THREE.GLTFLoader: No DRACOLoader instance provided.`);this.name=q.KHR_DRACO_MESH_COMPRESSION,this.json=e,this.dracoLoader=t,this.dracoLoader.preload()}decodePrimitive(e,t){let n=this.json,r=this.dracoLoader,i=e.extensions[this.name].bufferView,a=e.extensions[this.name].attributes,o={},s={},c={};for(let e in a){let t=en[e]||e.toLowerCase();o[t]=a[e]}for(let t in e.attributes){let r=en[t]||t.toLowerCase();if(a[t]!==void 0){let i=n.accessors[e.attributes[t]];c[r]=Xt[i.componentType].name,s[r]=i.normalized===!0}}return t.getDependency(`bufferView`,i).then(function(e){return new Promise(function(t,n){r.decodeDracoFile(e,function(e){for(let t in e.attributes){let n=e.attributes[t],r=s[t];r!==void 0&&(n.normalized=r)}t(e)},o,c,p,n)})})}},Gt=class{constructor(){this.name=q.KHR_TEXTURE_TRANSFORM}extendTexture(e,t){return(t.texCoord===void 0||t.texCoord===e.channel)&&t.offset===void 0&&t.rotation===void 0&&t.scale===void 0?e:(e=e.clone(),t.texCoord!==void 0&&(e.channel=t.texCoord),t.offset!==void 0&&e.offset.fromArray(t.offset),t.rotation!==void 0&&(e.rotation=t.rotation),t.scale!==void 0&&e.repeat.fromArray(t.scale),e.needsUpdate=!0,e)}},Kt=class{constructor(){this.name=q.KHR_MESH_QUANTIZATION}},qt=class extends d{constructor(e,t,n,r){super(e,t,n,r)}copySampleValue_(e){let t=this.resultBuffer,n=this.sampleValues,r=this.valueSize,i=e*r*3+r;for(let e=0;e!==r;e++)t[e]=n[i+e];return t}interpolate_(e,t,n,r){let i=this.resultBuffer,a=this.sampleValues,o=this.valueSize,s=o*2,c=o*3,l=r-t,u=(n-t)/l,d=u*u,f=d*u,p=e*c,m=p-c,h=-2*f+3*d,g=f-d,_=1-h,v=g-d+u;for(let e=0;e!==o;e++){let t=a[m+e+o],n=a[m+e+s]*l,r=a[p+e+o],c=a[p+e]*l;i[e]=_*t+v*n+h*r+g*c}return i}},Jt=new R,Yt=class extends qt{interpolate_(e,t,n,r){let i=super.interpolate_(e,t,n,r);return Jt.fromArray(i).normalize().toArray(i),i}},J={FLOAT:5126,FLOAT_MAT3:35675,FLOAT_MAT4:35676,FLOAT_VEC2:35664,FLOAT_VEC3:35665,FLOAT_VEC4:35666,LINEAR:9729,REPEAT:10497,SAMPLER_2D:35678,POINTS:0,LINES:1,LINE_LOOP:2,LINE_STRIP:3,TRIANGLES:4,TRIANGLE_STRIP:5,TRIANGLE_FAN:6,UNSIGNED_BYTE:5121,UNSIGNED_SHORT:5123},Xt={5120:Int8Array,5121:Uint8Array,5122:Int16Array,5123:Uint16Array,5125:Uint32Array,5126:Float32Array},Zt={9728:ae,9729:m,9984:je,9985:ne,9986:De,9987:F},Qt={33071:we,33648:ve,10497:M},$t={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT2:4,MAT3:9,MAT4:16},en={POSITION:`position`,NORMAL:`normal`,TANGENT:`tangent`,TEXCOORD_0:`uv`,TEXCOORD_1:`uv1`,TEXCOORD_2:`uv2`,TEXCOORD_3:`uv3`,COLOR_0:`color`,WEIGHTS_0:`skinWeight`,JOINTS_0:`skinIndex`},tn={scale:`scale`,translation:`position`,rotation:`quaternion`,weights:`morphTargetInfluences`},nn={CUBICSPLINE:void 0,LINEAR:y,STEP:h},rn={OPAQUE:`OPAQUE`,MASK:`MASK`,BLEND:`BLEND`};function an(e){return e.DefaultMaterial===void 0&&(e.DefaultMaterial=new G({color:16777215,emissive:0,metalness:1,roughness:1,transparent:!1,depthTest:!0,side:0})),e.DefaultMaterial}function on(e,t,n){for(let r in n.extensions)e[r]===void 0&&(t.userData.gltfExtensions=t.userData.gltfExtensions||{},t.userData.gltfExtensions[r]=n.extensions[r])}function Y(e,t){t.extras!==void 0&&(typeof t.extras==`object`?Object.assign(e.userData,t.extras):console.warn(`THREE.GLTFLoader: Ignoring primitive type .extras, `+t.extras))}function sn(e,t,n){let r=!1,i=!1,a=!1;for(let e=0,n=t.length;e<n;e++){let n=t[e];if(n.POSITION!==void 0&&(r=!0),n.NORMAL!==void 0&&(i=!0),n.COLOR_0!==void 0&&(a=!0),r&&i&&a)break}if(!r&&!i&&!a)return Promise.resolve(e);let o=[],s=[],c=[];for(let l=0,u=t.length;l<u;l++){let u=t[l];if(r){let t=u.POSITION===void 0?e.attributes.position:n.getDependency(`accessor`,u.POSITION);o.push(t)}if(i){let t=u.NORMAL===void 0?e.attributes.normal:n.getDependency(`accessor`,u.NORMAL);s.push(t)}if(a){let t=u.COLOR_0===void 0?e.attributes.color:n.getDependency(`accessor`,u.COLOR_0);c.push(t)}}return Promise.all([Promise.all(o),Promise.all(s),Promise.all(c)]).then(function(t){let n=t[0],o=t[1],s=t[2];return r&&(e.morphAttributes.position=n),i&&(e.morphAttributes.normal=o),a&&(e.morphAttributes.color=s),e.morphTargetsRelative=!0,e})}function cn(e,t){if(e.updateMorphTargets(),t.weights!==void 0)for(let n=0,r=t.weights.length;n<r;n++)e.morphTargetInfluences[n]=t.weights[n];if(t.extras&&Array.isArray(t.extras.targetNames)){let n=t.extras.targetNames;if(e.morphTargetInfluences.length===n.length){e.morphTargetDictionary={};for(let t=0,r=n.length;t<r;t++)e.morphTargetDictionary[n[t]]=t}else console.warn(`THREE.GLTFLoader: Invalid extras.targetNames length. Ignoring names.`)}}function ln(e){let t,n=e.extensions&&e.extensions[q.KHR_DRACO_MESH_COMPRESSION];if(t=n?`draco:`+n.bufferView+`:`+n.indices+`:`+un(n.attributes):e.indices+`:`+un(e.attributes)+`:`+e.mode,e.targets!==void 0)for(let n=0,r=e.targets.length;n<r;n++)t+=`:`+un(e.targets[n]);return t}function un(e){let t=``,n=Object.keys(e).sort();for(let r=0,i=n.length;r<i;r++)t+=n[r]+`:`+e[n[r]]+`;`;return t}function dn(e){switch(e){case Int8Array:return 1/127;case Uint8Array:return 1/255;case Int16Array:return 1/32767;case Uint16Array:return 1/65535;default:throw Error(`THREE.GLTFLoader: Unsupported normalized accessor component type.`)}}function fn(e){return e.search(/\.jpe?g($|\?)/i)>0||e.search(/^data\:image\/jpeg/)===0?`image/jpeg`:e.search(/\.webp($|\?)/i)>0||e.search(/^data\:image\/webp/)===0?`image/webp`:e.search(/\.ktx2($|\?)/i)>0||e.search(/^data\:image\/ktx2/)===0?`image/ktx2`:`image/png`}var pn=new I,mn=class{constructor(e={},n={}){this.json=e,this.extensions={},this.plugins={},this.options=n,this.cache=new xt,this.associations=new Map,this.primitiveCache={},this.nodeCache={},this.meshCache={refs:{},uses:{}},this.cameraCache={refs:{},uses:{}},this.lightCache={refs:{},uses:{}},this.sourceCache={},this.textureCache={},this.nodeNamesUsed={};let r=!1,i=-1,o=!1,s=-1;if(typeof navigator<`u`&&navigator.userAgent!==void 0){let e=navigator.userAgent;r=/^((?!chrome|android).)*safari/i.test(e)===!0;let t=e.match(/Version\/(\d+)/);i=r&&t?parseInt(t[1],10):-1,o=e.indexOf(`Firefox`)>-1,s=o?e.match(/Firefox\/([0-9]+)\./)[1]:-1}typeof createImageBitmap>`u`||r&&i<17||o&&s<98?this.textureLoader=new be(this.options.manager):this.textureLoader=new t(this.options.manager),this.textureLoader.setCrossOrigin(this.options.crossOrigin),this.textureLoader.setRequestHeader(this.options.requestHeader),this.fileLoader=new a(this.options.manager),this.fileLoader.setResponseType(`arraybuffer`),this.options.crossOrigin===`use-credentials`&&this.fileLoader.setWithCredentials(!0)}setExtensions(e){this.extensions=e}setPlugins(e){this.plugins=e}parse(e,t){let n=this,r=this.json,i=this.extensions;this.cache.removeAll(),this.nodeCache={},this._invokeAll(function(e){return e._markDefs&&e._markDefs()}),Promise.all(this._invokeAll(function(e){return e.beforeRoot&&e.beforeRoot()})).then(function(){return Promise.all([n.getDependencies(`scene`),n.getDependencies(`animation`),n.getDependencies(`camera`)])}).then(function(t){let a={scene:t[0][r.scene||0],scenes:t[0],animations:t[1],cameras:t[2],asset:r.asset,parser:n,userData:{}};return on(i,a,r),Y(a,r),Promise.all(n._invokeAll(function(e){return e.afterRoot&&e.afterRoot(a)})).then(function(){for(let e of a.scenes)e.updateMatrixWorld();e(a)})}).catch(t)}_markDefs(){let e=this.json.nodes||[],t=this.json.skins||[],n=this.json.meshes||[];for(let n=0,r=t.length;n<r;n++){let r=t[n].joints;for(let t=0,n=r.length;t<n;t++)e[r[t]].isBone=!0}for(let t=0,r=e.length;t<r;t++){let r=e[t];r.mesh!==void 0&&(this._addNodeRef(this.meshCache,r.mesh),r.skin!==void 0&&(n[r.mesh].isSkinnedMesh=!0)),r.camera!==void 0&&this._addNodeRef(this.cameraCache,r.camera)}}_addNodeRef(e,t){t!==void 0&&(e.refs[t]===void 0&&(e.refs[t]=e.uses[t]=0),e.refs[t]++)}_getNodeRef(e,t,n){if(e.refs[t]<=1)return n;let r=n.clone(),i=(e,t)=>{let n=this.associations.get(e);n!=null&&this.associations.set(t,n);for(let[n,r]of e.children.entries())i(r,t.children[n])};return i(n,r),r.name+=`_instance_`+ e.uses[t]++,r}_invokeOne(e){let t=Object.values(this.plugins);t.push(this);for(let n=0;n<t.length;n++){let r=e(t[n]);if(r)return r}return null}_invokeAll(e){let t=Object.values(this.plugins);t.unshift(this);let n=[];for(let r=0;r<t.length;r++){let i=e(t[r]);i&&n.push(i)}return n}getDependency(e,t){let n=e+`:`+t,r=this.cache.get(n);if(!r){switch(e){case`scene`:r=this.loadScene(t);break;case`node`:r=this._invokeOne(function(e){return e.loadNode&&e.loadNode(t)});break;case`mesh`:r=this._invokeOne(function(e){return e.loadMesh&&e.loadMesh(t)});break;case`accessor`:r=this.loadAccessor(t);break;case`bufferView`:r=this._invokeOne(function(e){return e.loadBufferView&&e.loadBufferView(t)});break;case`buffer`:r=this.loadBuffer(t);break;case`material`:r=this._invokeOne(function(e){return e.loadMaterial&&e.loadMaterial(t)});break;case`texture`:r=this._invokeOne(function(e){return e.loadTexture&&e.loadTexture(t)});break;case`skin`:r=this.loadSkin(t);break;case`animation`:r=this._invokeOne(function(e){return e.loadAnimation&&e.loadAnimation(t)});break;case`camera`:r=this.loadCamera(t);break;default:if(r=this._invokeOne(function(n){return n!=this&&n.getDependency&&n.getDependency(e,t)}),!r)throw Error(`Unknown type: `+e);break}this.cache.add(n,r)}return r}getDependencies(e){let t=this.cache.get(e);if(!t){let n=this,r=this.json[e+(e===`mesh`?`es`:`s`)]||[];t=Promise.all(r.map(function(t,r){return n.getDependency(e,r)})),this.cache.add(e,t)}return t}loadBuffer(e){let t=this.json.buffers[e],n=this.fileLoader;if(t.type&&t.type!==`arraybuffer`)throw Error(`THREE.GLTFLoader: `+t.type+` buffer type is not supported.`);if(t.uri===void 0&&e===0)return Promise.resolve(this.extensions[q.KHR_BINARY_GLTF].body);let r=this.options;return new Promise(function(e,i){n.load(W.resolveURL(t.uri,r.path),e,void 0,function(){i(Error(`THREE.GLTFLoader: Failed to load buffer "`+t.uri+`".`))})})}loadBufferView(e){let t=this.json.bufferViews[e];return this.getDependency(`buffer`,t.buffer).then(function(e){let n=t.byteLength||0,r=t.byteOffset||0;return e.slice(r,r+n)})}loadAccessor(e){let t=this,n=this.json,r=this.json.accessors[e];if(r.bufferView===void 0&&r.sparse===void 0){let e=$t[r.type],t=Xt[r.componentType],n=r.normalized===!0,i=new t(r.count*e);return Promise.resolve(new Pe(i,e,n))}let i=[];return r.bufferView===void 0?i.push(null):i.push(this.getDependency(`bufferView`,r.bufferView)),r.sparse!==void 0&&(i.push(this.getDependency(`bufferView`,r.sparse.indices.bufferView)),i.push(this.getDependency(`bufferView`,r.sparse.values.bufferView))),Promise.all(i).then(function(e){let i=e[0],a=$t[r.type],o=Xt[r.componentType],s=o.BYTES_PER_ELEMENT,c=s*a,l=r.byteOffset||0,u=r.bufferView===void 0?void 0:n.bufferViews[r.bufferView].byteStride,d=r.normalized===!0,f,p;if(u&&u!==c){let e=Math.floor(l/u),n=`InterleavedBuffer:`+r.bufferView+`:`+r.componentType+`:`+e+`:`+r.count,c=t.cache.get(n);c||(f=new o(i,e*u,r.count*u/s),c=new C(f,u/s),t.cache.add(n,c)),p=new D(c,a,l%u/s,d)}else f=i===null?new o(r.count*a):new o(i,l,r.count*a),p=new Pe(f,a,d);if(r.sparse!==void 0){let t=$t.SCALAR,n=Xt[r.sparse.indices.componentType],s=r.sparse.indices.byteOffset||0,c=r.sparse.values.byteOffset||0,l=new n(e[1],s,r.sparse.count*t),u=new o(e[2],c,r.sparse.count*a);i!==null&&(p=new Pe(p.array.slice(),p.itemSize,p.normalized)),p.normalized=!1;for(let e=0,t=l.length;e<t;e++){let t=l[e];if(p.setX(t,u[e*a]),a>=2&&p.setY(t,u[e*a+1]),a>=3&&p.setZ(t,u[e*a+2]),a>=4&&p.setW(t,u[e*a+3]),a>=5)throw Error(`THREE.GLTFLoader: Unsupported itemSize in sparse BufferAttribute.`)}p.normalized=d}return p})}loadTexture(e){let t=this.json,n=this.options,r=t.textures[e].source,i=t.images[r],a=this.textureLoader;if(i.uri){let e=n.manager.getHandler(i.uri);e!==null&&(a=e)}return this.loadTextureImage(e,r,a)}loadTextureImage(e,t,n){let r=this,i=this.json,a=i.textures[e],o=i.images[t],s=(o.uri||o.bufferView)+`:`+a.sampler;if(this.textureCache[s])return this.textureCache[s];let c=this.loadImageSource(t,n).then(function(t){t.flipY=!1,t.name=a.name||o.name||``,t.name===``&&typeof o.uri==`string`&&o.uri.startsWith(`data:image/`)===!1&&(t.name=o.uri);let n=(i.samplers||{})[a.sampler]||{};return t.magFilter=Zt[n.magFilter]||1006,t.minFilter=Zt[n.minFilter]||1008,t.wrapS=Qt[n.wrapS]||1e3,t.wrapT=Qt[n.wrapT]||1e3,t.generateMipmaps=!t.isCompressedTexture&&t.minFilter!==1003&&t.minFilter!==1006,r.associations.set(t,{textures:e}),t}).catch(function(){return null});return this.textureCache[s]=c,c}loadImageSource(e,t){let r=this,i=this.json,a=this.options;if(this.sourceCache[e]!==void 0)return this.sourceCache[e].then(e=>e.clone());let o=i.images[e],s=self.URL||self.webkitURL,c=o.uri||``,l=!1;if(o.bufferView!==void 0)c=r.getDependency(`bufferView`,o.bufferView).then(function(e){l=!0;let t=new Blob([e],{type:o.mimeType});return c=s.createObjectURL(t),c});else if(o.uri===void 0)throw Error(`THREE.GLTFLoader: Image `+e+` is missing URI and bufferView`);let u=Promise.resolve(c).then(function(e){return new Promise(function(r,i){let o=r;t.isImageBitmapLoader===!0&&(o=function(e){let t=new n(e);t.needsUpdate=!0,r(t)}),t.load(W.resolveURL(e,a.path),o,void 0,i)})}).then(function(e){return l===!0&&s.revokeObjectURL(c),Y(e,o),e.userData.mimeType=o.mimeType||fn(o.uri),e}).catch(function(e){throw console.error(`THREE.GLTFLoader: Couldn't load texture`,c),e});return this.sourceCache[e]=u,u}assignTexture(e,t,n,r){let i=this;return this.getDependency(`texture`,n.index).then(function(a){if(!a)return null;if(n.texCoord!==void 0&&n.texCoord>0&&(a=a.clone(),a.channel=n.texCoord),i.extensions[q.KHR_TEXTURE_TRANSFORM]){let e=n.extensions===void 0?void 0:n.extensions[q.KHR_TEXTURE_TRANSFORM];if(e){let t=i.associations.get(a);a=i.extensions[q.KHR_TEXTURE_TRANSFORM].extendTexture(a,e),i.associations.set(a,t)}}return r!==void 0&&(a.colorSpace=r),e[t]=a,a})}assignFinalMaterial(e){let t=e.geometry,n=e.material,r=t.attributes.tangent===void 0,i=t.attributes.color!==void 0,a=t.attributes.normal===void 0;if(e.isPoints){let e=`PointsMaterial:`+n.uuid,t=this.cache.get(e);t||(t=new ge,ie.prototype.copy.call(t,n),t.color.copy(n.color),t.map=n.map,t.sizeAttenuation=!1,this.cache.add(e,t)),n=t}else if(e.isLine){let e=`LineBasicMaterial:`+n.uuid,t=this.cache.get(e);t||(t=new We,ie.prototype.copy.call(t,n),t.color.copy(n.color),t.map=n.map,this.cache.add(e,t)),n=t}if(r||i||a){let e=`ClonedMaterial:`+n.uuid+`:`;r&&(e+=`derivative-tangents:`),i&&(e+=`vertex-colors:`),a&&(e+=`flat-shading:`);let t=this.cache.get(e);t||(t=n.clone(),i&&(t.vertexColors=!0),a&&(t.flatShading=!0),r&&(t.normalScale&&(t.normalScale.y*=-1),t.clearcoatNormalScale&&(t.clearcoatNormalScale.y*=-1)),this.cache.add(e,t),this.associations.set(t,this.associations.get(n))),n=t}e.material=n}getMaterialType(){return G}loadMaterial(t){let n=this,r=this.json,i=this.extensions,a=r.materials[t],s,c={},l=a.extensions||{},u=[];if(l[q.KHR_MATERIALS_UNLIT]){let e=i[q.KHR_MATERIALS_UNLIT];s=e.getMaterialType(),u.push(e.extendParams(c,a,n))}else{let e=a.pbrMetallicRoughness||{};if(c.color=new B(1,1,1),c.opacity=1,Array.isArray(e.baseColorFactor)){let t=e.baseColorFactor;c.color.setRGB(t[0],t[1],t[2],p),c.opacity=t[3]}e.baseColorTexture!==void 0&&u.push(n.assignTexture(c,`map`,e.baseColorTexture,o)),c.metalness=e.metallicFactor===void 0?1:e.metallicFactor,c.roughness=e.roughnessFactor===void 0?1:e.roughnessFactor,e.metallicRoughnessTexture!==void 0&&(u.push(n.assignTexture(c,`metalnessMap`,e.metallicRoughnessTexture)),u.push(n.assignTexture(c,`roughnessMap`,e.metallicRoughnessTexture))),s=this._invokeOne(function(e){return e.getMaterialType&&e.getMaterialType(t)}),u.push(Promise.all(this._invokeAll(function(e){return e.extendMaterialParams&&e.extendMaterialParams(t,c)})))}a.doubleSided===!0&&(c.side=2);let d=a.alphaMode||rn.OPAQUE;if(d===rn.BLEND?(c.transparent=!0,c.depthWrite=!1):(c.transparent=!1,d===rn.MASK&&(c.alphaTest=a.alphaCutoff===void 0?.5:a.alphaCutoff)),a.normalTexture!==void 0&&s!==e&&(u.push(n.assignTexture(c,`normalMap`,a.normalTexture)),c.normalScale=new g(1,1),a.normalTexture.scale!==void 0)){let e=a.normalTexture.scale;c.normalScale.set(e,e)}if(a.occlusionTexture!==void 0&&s!==e&&(u.push(n.assignTexture(c,`aoMap`,a.occlusionTexture)),a.occlusionTexture.strength!==void 0&&(c.aoMapIntensity=a.occlusionTexture.strength)),a.emissiveFactor!==void 0&&s!==e){let e=a.emissiveFactor;c.emissive=new B().setRGB(e[0],e[1],e[2],p)}return a.emissiveTexture!==void 0&&s!==e&&u.push(n.assignTexture(c,`emissiveMap`,a.emissiveTexture,o)),Promise.all(u).then(function(){let e=new s(c);return a.name&&(e.name=a.name),Y(e,a),n.associations.set(e,{materials:t}),a.extensions&&on(i,e,a),e})}createUniqueName(e){let t=me.sanitizeNodeName(e||``);return t in this.nodeNamesUsed?t+`_`+ ++this.nodeNamesUsed[t]:(this.nodeNamesUsed[t]=0,t)}loadGeometries(e){let t=this,n=this.extensions,r=this.primitiveCache;function i(e){return n[q.KHR_DRACO_MESH_COMPRESSION].decodePrimitive(e,t).then(function(n){return gn(n,e,t)})}let a=[];for(let n=0,o=e.length;n<o;n++){let o=e[n],s=ln(o),c=r[s];if(c)a.push(c.promise);else{let e;e=o.extensions&&o.extensions[q.KHR_DRACO_MESH_COMPRESSION]?i(o):gn(new ue,o,t),r[s]={primitive:o,promise:e},a.push(e)}}return Promise.all(a)}loadMesh(e){let t=this,n=this.json,i=this.extensions,a=n.meshes[e],o=a.primitives,l=[];for(let e=0,t=o.length;e<t;e++){let t=o[e].material===void 0?an(this.cache):this.getDependency(`material`,o[e].material);l.push(t)}return l.push(t.loadGeometries(o)),Promise.all(l).then(function(n){let l=n.slice(0,n.length-1),u=n[n.length-1],d=[];for(let n=0,s=u.length;n<s;n++){let s=u[n],f=o[n],p,m=l[n];if(f.mode===J.TRIANGLES||f.mode===J.TRIANGLE_STRIP||f.mode===J.TRIANGLE_FAN||f.mode===void 0)p=a.isSkinnedMesh===!0?new c(s,m):new k(s,m),p.isSkinnedMesh===!0&&p.normalizeSkinWeights(),f.mode===J.TRIANGLE_STRIP?p.geometry=_t(p.geometry,1):f.mode===J.TRIANGLE_FAN&&(p.geometry=_t(p.geometry,2));else if(f.mode===J.LINES)p=new te(s,m);else if(f.mode===J.LINE_STRIP)p=new ee(s,m);else if(f.mode===J.LINE_LOOP)p=new r(s,m);else if(f.mode===J.POINTS)p=new Te(s,m);else throw Error(`THREE.GLTFLoader: Primitive mode unsupported: `+f.mode);Object.keys(p.geometry.morphAttributes).length>0&&cn(p,a),p.name=t.createUniqueName(a.name||`mesh_`+e),Y(p,a),f.extensions&&on(i,p,f),t.assignFinalMaterial(p),d.push(p)}for(let n=0,r=d.length;n<r;n++)t.associations.set(d[n],{meshes:e,primitives:n});if(d.length===1)return a.extensions&&on(i,d[0],a),d[0];let f=new s;a.extensions&&on(i,f,a),t.associations.set(f,{meshes:e});for(let e=0,t=d.length;e<t;e++)f.add(d[e]);return f})}loadCamera(e){let t,n=this.json.cameras[e],r=n[n.type];if(!r){console.warn(`THREE.GLTFLoader: Missing camera parameters.`);return}return n.type===`perspective`?t=new de(re.radToDeg(r.yfov),r.aspectRatio||1,r.znear||1,r.zfar||2e6):n.type===`orthographic`&&(t=new Fe(-r.xmag,r.xmag,r.ymag,-r.ymag,r.znear,r.zfar)),n.name&&(t.name=this.createUniqueName(n.name)),Y(t,n),Promise.resolve(t)}loadSkin(e){let t=this.json.skins[e],n=[];for(let e=0,r=t.joints.length;e<r;e++)n.push(this._loadNodeShallow(t.joints[e]));return t.inverseBindMatrices===void 0?n.push(null):n.push(this.getDependency(`accessor`,t.inverseBindMatrices)),Promise.all(n).then(function(e){let n=e.pop(),r=e,i=[],a=[];for(let e=0,o=r.length;e<o;e++){let o=r[e];if(o){i.push(o);let t=new I;n!==null&&t.fromArray(n.array,e*16),a.push(t)}else console.warn(`THREE.GLTFLoader: Joint "%s" could not be found.`,t.joints[e])}return new u(i,a)})}loadAnimation(e){let t=this.json,n=this,r=t.animations[e],i=r.name?r.name:`animation_`+e,a=[],o=[],s=[],c=[],l=[];for(let e=0,t=r.channels.length;e<t;e++){let t=r.channels[e],n=r.samplers[t.sampler],i=t.target,u=i.node,d=r.parameters===void 0?n.input:r.parameters[n.input],f=r.parameters===void 0?n.output:r.parameters[n.output];i.node!==void 0&&(a.push(this.getDependency(`node`,u)),o.push(this.getDependency(`accessor`,d)),s.push(this.getDependency(`accessor`,f)),c.push(n),l.push(i))}return Promise.all([Promise.all(a),Promise.all(o),Promise.all(s),Promise.all(c),Promise.all(l)]).then(function(e){let t=e[0],a=e[1],o=e[2],s=e[3],c=e[4],l=[];for(let e=0,r=t.length;e<r;e++){let r=t[e],i=a[e],u=o[e],d=s[e],f=c[e];if(r===void 0)continue;r.updateMatrix&&r.updateMatrix();let p=n._createAnimationTracks(r,i,u,d,f);if(p)for(let e=0;e<p.length;e++)l.push(p[e])}let u=new Ee(i,void 0,l);return Y(u,r),u})}createNodeMesh(e){let t=this.json,n=this,r=t.nodes[e];return r.mesh===void 0?null:n.getDependency(`mesh`,r.mesh).then(function(e){let t=n._getNodeRef(n.meshCache,r.mesh,e);return r.weights!==void 0&&t.traverse(function(e){if(e.isMesh)for(let t=0,n=r.weights.length;t<n;t++)e.morphTargetInfluences[t]=r.weights[t]}),t})}loadNode(e){let t=this.json,n=this,r=t.nodes[e],i=n._loadNodeShallow(e),a=[],o=r.children||[];for(let e=0,t=o.length;e<t;e++)a.push(n.getDependency(`node`,o[e]));let s=r.skin===void 0?Promise.resolve(null):n.getDependency(`skin`,r.skin);return Promise.all([i,Promise.all(a),s]).then(function(e){let t=e[0],n=e[1],r=e[2];r!==null&&t.traverse(function(e){e.isSkinnedMesh&&e.bind(r,pn)});for(let e=0,r=n.length;e<r;e++)t.add(n[e]);if(t.userData.pivot!==void 0&&n.length>0){let e=t.userData.pivot,r=n[0];t.pivot=new b().fromArray(e),t.position.x-=e[0],t.position.y-=e[1],t.position.z-=e[2],r.position.set(0,0,0),delete t.userData.pivot}return t})}_loadNodeShallow(e){let t=this.json,n=this.extensions,r=this;if(this.nodeCache[e]!==void 0)return this.nodeCache[e];let i=t.nodes[e],a=i.name?r.createUniqueName(i.name):``,o=[],c=r._invokeOne(function(t){return t.createNodeMesh&&t.createNodeMesh(e)});return c&&o.push(c),i.camera!==void 0&&o.push(r.getDependency(`camera`,i.camera).then(function(e){return r._getNodeRef(r.cameraCache,i.camera,e)})),r._invokeAll(function(t){return t.createNodeAttachment&&t.createNodeAttachment(e)}).forEach(function(e){o.push(e)}),this.nodeCache[e]=Promise.all(o).then(function(t){let o;if(o=i.isBone===!0?new Ae:t.length>1?new s:t.length===1?t[0]:new Ce,o!==t[0])for(let e=0,n=t.length;e<n;e++)o.add(t[e]);if(i.name&&(o.userData.name=i.name,o.name=a),Y(o,i),i.extensions&&on(n,o,i),i.matrix!==void 0){let e=new I;e.fromArray(i.matrix),o.applyMatrix4(e)}else i.translation!==void 0&&o.position.fromArray(i.translation),i.rotation!==void 0&&o.quaternion.fromArray(i.rotation),i.scale!==void 0&&o.scale.fromArray(i.scale);if(!r.associations.has(o))r.associations.set(o,{});else if(i.mesh!==void 0&&r.meshCache.refs[i.mesh]>1){let e=r.associations.get(o);r.associations.set(o,{...e})}return r.associations.get(o).nodes=e,o}),this.nodeCache[e]}loadScene(e){let t=this.extensions,r=this.json.scenes[e],i=this,a=new s;r.name&&(a.name=i.createUniqueName(r.name)),Y(a,r),r.extensions&&on(t,a,r);let o=r.nodes||[],c=[];for(let e=0,t=o.length;e<t;e++)c.push(i.getDependency(`node`,o[e]));return Promise.all(c).then(function(e){for(let t=0,n=e.length;t<n;t++){let n=e[t];n.parent===null?a.add(n):a.add(vt(n))}return i.associations=(e=>{let t=new Map;for(let[e,r]of i.associations)(e instanceof ie||e instanceof n)&&t.set(e,r);return e.traverse(e=>{let n=i.associations.get(e);n!=null&&t.set(e,n)}),t})(a),a})}_createAnimationTracks(e,t,n,r,i){let a=[],o=e.name?e.name:e.uuid,s=[];function c(e){e.morphTargetInfluences&&s.push(e.name?e.name:e.uuid)}tn[i.path]===tn.weights?(c(e),e.isGroup&&e.children.forEach(c)):s.push(o);let l;switch(tn[i.path]){case tn.weights:l=le;break;case tn.rotation:l=Le;break;case tn.translation:case tn.scale:l=A;break;default:switch(n.itemSize){case 1:l=le;break;default:l=A;break}break}let u=r.interpolation===void 0?y:nn[r.interpolation],d=this._getArrayFromAccessor(n);for(let e=0,n=s.length;e<n;e++){let n=new l(s[e]+`.`+tn[i.path],t.array,d,u);r.interpolation===`CUBICSPLINE`&&this._createCubicSplineTrackInterpolant(n),a.push(n)}return a}_getArrayFromAccessor(e){let t=e.array;if(e.normalized){let e=dn(t.constructor),n=new Float32Array(t.length);for(let r=0,i=t.length;r<i;r++)n[r]=t[r]*e;t=n}return t}_createCubicSplineTrackInterpolant(e){e.createInterpolant=function(e){return new(this instanceof Le?Yt:qt)(this.times,this.values,this.getValueSize()/3,e)},e.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline=!0}};function hn(e,t,n){let r=t.attributes,i=new ce;if(r.POSITION!==void 0){let e=n.json.accessors[r.POSITION],t=e.min,a=e.max;if(t!==void 0&&a!==void 0){if(i.set(new b(t[0],t[1],t[2]),new b(a[0],a[1],a[2])),e.normalized){let t=dn(Xt[e.componentType]);i.min.multiplyScalar(t),i.max.multiplyScalar(t)}}else{console.warn(`THREE.GLTFLoader: Missing min/max properties for accessor POSITION.`);return}}else return;let a=t.targets;if(a!==void 0){let e=new b,t=new b;for(let r=0,i=a.length;r<i;r++){let i=a[r];if(i.POSITION!==void 0){let r=n.json.accessors[i.POSITION],a=r.min,o=r.max;if(a!==void 0&&o!==void 0){if(t.setX(Math.max(Math.abs(a[0]),Math.abs(o[0]))),t.setY(Math.max(Math.abs(a[1]),Math.abs(o[1]))),t.setZ(Math.max(Math.abs(a[2]),Math.abs(o[2]))),r.normalized){let e=dn(Xt[r.componentType]);t.multiplyScalar(e)}e.max(t)}else console.warn(`THREE.GLTFLoader: Missing min/max properties for accessor POSITION.`)}}i.expandByVector(e)}e.boundingBox=i;let o=new E;i.getCenter(o.center),o.radius=i.min.distanceTo(i.max)/2,e.boundingSphere=o}function gn(e,t,n){let r=t.attributes,i=[];function a(t,r){return n.getDependency(`accessor`,t).then(function(t){e.setAttribute(r,t)})}for(let t in r){let n=en[t]||t.toLowerCase();n in e.attributes||i.push(a(r[t],n))}if(t.indices!==void 0&&!e.index){let r=n.getDependency(`accessor`,t.indices).then(function(t){e.setIndex(t)});i.push(r)}return L.workingColorSpace!==`srgb-linear`&&`COLOR_0`in r&&console.warn(`THREE.GLTFLoader: Converting vertex colors from "srgb-linear" to "${L.workingColorSpace}" not supported.`),Y(e,t),hn(e,t,n),Promise.all(i).then(function(){return t.targets===void 0?e:sn(e,t.targets,n)})}var _n=new WeakMap,vn=class extends v{constructor(e){super(e),this.decoderPath=``,this.decoderConfig={},this.decoderBinary=null,this.decoderPending=null,this.workerLimit=4,this.workerPool=[],this.workerNextTaskID=1,this.workerSourceURL=``,this.defaultAttributeIDs={position:`POSITION`,normal:`NORMAL`,color:`COLOR`,uv:`TEX_COORD`},this.defaultAttributeTypes={position:`Float32Array`,normal:`Float32Array`,color:`Float32Array`,uv:`Float32Array`}}setDecoderPath(e){return this.decoderPath=e,this}setDecoderConfig(e){return this.decoderConfig=e,this}setWorkerLimit(e){return this.workerLimit=e,this}load(e,t,n,r){let i=new a(this.manager);i.setPath(this.path),i.setResponseType(`arraybuffer`),i.setRequestHeader(this.requestHeader),i.setWithCredentials(this.withCredentials),i.load(e,e=>{this.parse(e,t,r)},n,r)}parse(e,t,n=()=>{}){this.decodeDracoFile(e,t,null,null,o,n).catch(n)}decodeDracoFile(e,t,n,r,i=p,a=()=>{}){let o={attributeIDs:n||this.defaultAttributeIDs,attributeTypes:r||this.defaultAttributeTypes,useUniqueIDs:!!n,vertexColorSpace:i};return this.decodeGeometry(e,o).then(t).catch(a)}decodeGeometry(e,t){let n=JSON.stringify(t);if(_n.has(e)){let t=_n.get(e);if(t.key===n)return t.promise;if(e.byteLength===0)throw Error(`THREE.DRACOLoader: Unable to re-decode a buffer with different settings. Buffer has already been transferred.`)}let r,i=this.workerNextTaskID++,a=e.byteLength,o=this._getWorker(i,a).then(n=>(r=n,new Promise((n,a)=>{r._callbacks[i]={resolve:n,reject:a},r.postMessage({type:`decode`,id:i,taskConfig:t,buffer:e},[e])}))).then(e=>this._createGeometry(e.geometry));return o.catch(()=>!0).then(()=>{r&&i&&this._releaseTask(r,i)}),_n.set(e,{key:n,promise:o}),o}_createGeometry(e){let t=new ue;e.index&&t.setIndex(new Pe(e.index.array,1));for(let n=0;n<e.attributes.length;n++){let{name:r,array:i,itemSize:a,stride:o,vertexColorSpace:s}=e.attributes[n],c;c=a===o?new Pe(i,a):new D(new C(i,o),a,0),r===`color`&&(this._assignVertexColorSpace(c,s),c.normalized=!(i instanceof Float32Array)),t.setAttribute(r,c)}return t}_assignVertexColorSpace(e,t){if(t!==`srgb`)return;let n=new B;for(let t=0,r=e.count;t<r;t++)n.fromBufferAttribute(e,t),L.colorSpaceToWorking(n,o),e.setXYZ(t,n.r,n.g,n.b)}_loadLibrary(e,t){let n=new a(this.manager);return n.setPath(this.decoderPath),n.setResponseType(t),n.setWithCredentials(this.withCredentials),new Promise((t,r)=>{n.load(e,t,void 0,r)})}preload(){return this._initDecoder(),this}_initDecoder(){if(this.decoderPending)return this.decoderPending;let e=typeof WebAssembly!=`object`||this.decoderConfig.type===`js`,t=[];return e?t.push(this._loadLibrary(`draco_decoder.js`,`text`)):(t.push(this._loadLibrary(`draco_wasm_wrapper.js`,`text`)),t.push(this._loadLibrary(`draco_decoder.wasm`,`arraybuffer`))),this.decoderPending=Promise.all(t).then(t=>{let n=t[0];e||(this.decoderConfig.wasmBinary=t[1]);let r=yn.toString(),i=[`/* draco decoder */`,n,``,`/* worker */`,r.substring(r.indexOf(`{`)+1,r.lastIndexOf(`}`))].join(`
`);this.workerSourceURL=URL.createObjectURL(new Blob([i]))}),this.decoderPending}_getWorker(e,t){return this._initDecoder().then(()=>{if(this.workerPool.length<this.workerLimit){let e=new Worker(this.workerSourceURL);e._callbacks={},e._taskCosts={},e._taskLoad=0,e.postMessage({type:`init`,decoderConfig:this.decoderConfig}),e.onmessage=function(t){let n=t.data;switch(n.type){case`decode`:e._callbacks[n.id].resolve(n);break;case`error`:e._callbacks[n.id].reject(n);break;default:console.error(`THREE.DRACOLoader: Unexpected message, "`+n.type+`"`)}},this.workerPool.push(e)}else this.workerPool.sort(function(e,t){return e._taskLoad>t._taskLoad?-1:1});let n=this.workerPool[this.workerPool.length-1];return n._taskCosts[e]=t,n._taskLoad+=t,n})}_releaseTask(e,t){e._taskLoad-=e._taskCosts[t],delete e._callbacks[t],delete e._taskCosts[t]}debug(){console.log(`Task load: `,this.workerPool.map(e=>e._taskLoad))}dispose(){for(let e=0;e<this.workerPool.length;++e)this.workerPool[e].terminate();return this.workerPool.length=0,this.workerSourceURL!==``&&URL.revokeObjectURL(this.workerSourceURL),this}};function yn(){let e,t;onmessage=function(r){let i=r.data;switch(i.type){case`init`:e=i.decoderConfig,t=new Promise(function(t){e.onModuleLoaded=function(e){t({draco:e})},DracoDecoderModule(e)});break;case`decode`:let r=i.buffer,a=i.taskConfig;t.then(e=>{let t=e.draco,o=new t.Decoder;try{let e=n(t,o,new Int8Array(r),a),s=e.attributes.map(e=>e.array.buffer);e.index&&s.push(e.index.array.buffer),self.postMessage({type:`decode`,id:i.id,geometry:e},s)}catch(e){console.error(e),self.postMessage({type:`error`,id:i.id,error:e.message})}finally{t.destroy(o)}});break}};function n(e,t,n,a){let o=a.attributeIDs,s=a.attributeTypes,c,l,u=t.GetEncodedGeometryType(n);if(u===e.TRIANGULAR_MESH)c=new e.Mesh,l=t.DecodeArrayToMesh(n,n.byteLength,c);else if(u===e.POINT_CLOUD)c=new e.PointCloud,l=t.DecodeArrayToPointCloud(n,n.byteLength,c);else throw Error(`THREE.DRACOLoader: Unexpected geometry type.`);if(!l.ok()||c.ptr===0)throw Error(`THREE.DRACOLoader: Decoding failed: `+l.error_msg());let d={index:null,attributes:[]};for(let n in o){let r=self[s[n]],l,u;if(a.useUniqueIDs)u=o[n],l=t.GetAttributeByUniqueId(c,u);else{if(u=t.GetAttributeId(c,e[o[n]]),u===-1)continue;l=t.GetAttribute(c,u)}let f=i(e,t,c,n,r,l);n===`color`&&(f.vertexColorSpace=a.vertexColorSpace),d.attributes.push(f)}return u===e.TRIANGULAR_MESH&&(d.index=r(e,t,c)),e.destroy(c),d}function r(e,t,n){let r=n.num_faces()*3,i=r*4,a=e._malloc(i);t.GetTrianglesUInt32Array(n,i,a);let o=new Uint32Array(e.HEAPF32.buffer,a,r).slice();return e._free(a),{array:o,itemSize:1}}function i(e,t,n,r,i,o){let s=n.num_points(),c=o.num_components(),l=a(e,i),u=c*i.BYTES_PER_ELEMENT,d=Math.ceil(u/4)*4,f=d/i.BYTES_PER_ELEMENT,p=s*u,m=s*d,h=e._malloc(p);t.GetAttributeDataArrayForAllPoints(n,o,l,p,h);let g=new i(e.HEAPF32.buffer,h,p/i.BYTES_PER_ELEMENT),_;if(u===d)_=g.slice();else{_=new i(m/i.BYTES_PER_ELEMENT);let e=0;for(let t=0,n=g.length;t<n;t++){for(let n=0;n<c;n++)_[e+n]=g[t*c+n];e+=f}}return e._free(h),{name:r,count:s,itemSize:c,array:_,stride:f}}function a(e,t){switch(t){case Float32Array:return e.DT_FLOAT32;case Int8Array:return e.DT_INT8;case Int16Array:return e.DT_INT16;case Int32Array:return e.DT_INT32;case Uint8Array:return e.DT_UINT8;case Uint16Array:return e.DT_UINT16;case Uint32Array:return e.DT_UINT32}}}var bn=new vn;bn.setDecoderPath(`https://www.gstatic.com/draco/versioned/decoders/1.5.6/`);var xn=new bt;xn.setDRACOLoader(bn);function Sn(e){xn=new bt(e),xn.setDRACOLoader(bn)}var Cn=new Map;function wn(e,{onProgress:t}={}){return Cn.has(e)?Promise.resolve(Cn.get(e).clone(!0)):new Promise((n,r)=>{xn.load(e,t=>{let r=t.scene;r.traverse(e=>{e.isMesh&&(e.castShadow=!0,e.receiveShadow=!0)});let i=new ce().setFromObject(r),a=new b;i.getCenter(a),console.log(`[loader] ✓ ${e} | bbox center:`,a.toArray().map(e=>e.toFixed(2))),Cn.set(e,r),n(r.clone(!0))},t,t=>{console.error(`[loader] ✗ ${e}`,t),r(t)})})}var Tn=3,En=`#000000`,Dn=.75,On=`power3.inOut`,kn=2.2,An=`power2.inOut`,jn=180,Mn=`
varying vec3 vWorldPos;
void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vWorldPos = wp.xyz;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`,Nn=`
varying vec3 vWorldPos;
uniform float uTime;
uniform float uAlpha;

// Cinematic procedural env — cool sky, warm rim, subtle stars for sparkle catch
vec3 sampleEnv(vec3 dir) {
  float t    = dir.y * 0.5 + 0.5;
  vec3 lowSky  = vec3(0.015, 0.028, 0.06);
  vec3 midSky  = vec3(0.20, 0.32, 0.55);
  vec3 highSky = vec3(0.72, 0.85, 1.05);

  vec3 sky = mix(lowSky, midSky, smoothstep(0.0, 0.55, t));
  sky      = mix(sky,     highSky, smoothstep(0.55, 1.0, t));

  // warm horizon glow — golden fringe near the equator
  float horiz = 1.0 - abs(dir.y);
  float warm  = pow(smoothstep(0.35, 0.95, horiz), 2.2);
  sky += vec3(1.10, 0.50, 0.18) * warm * 0.55;

  // key-light hotspot — moves slowly so facets catch it as the gem turns
  vec3  keyDir  = normalize(vec3(sin(uTime * 0.35) * 0.7, 0.55, cos(uTime * 0.35) * 0.7));
  float keyFall = pow(max(dot(dir, keyDir), 0.0), 24.0);
  sky += vec3(1.4, 1.25, 1.05) * keyFall * 0.9;

  // secondary cool fill from opposite side
  vec3  fillDir  = vec3(-keyDir.x, 0.2, -keyDir.z);
  float fillFall = pow(max(dot(dir, fillDir), 0.0), 8.0);
  sky += vec3(0.35, 0.55, 0.85) * fillFall * 0.35;

  return sky;
}

void main() {
  // Flat-shaded per-facet normal via screen-space derivatives
  vec3 N = normalize(cross(dFdx(vWorldPos), dFdy(vWorldPos)));
  vec3 V = normalize(cameraPosition - vWorldPos);

  float ndotv = max(dot(N, V), 0.0);
  float fres  = pow(1.0 - ndotv, 4.5);

  // Dispersion — three IORs for R/G/B, wider spread than before
  vec3 refrR = refract(-V, N, 1.0 / 1.395);
  vec3 refrG = refract(-V, N, 1.0 / 1.470);
  vec3 refrB = refract(-V, N, 1.0 / 1.560);

  // Fake secondary internal bounce — reflect the refracted ray off the
  // opposite facet and sample the env again. Cheap but gives depth.
  vec3 innerN  = -N;
  vec3 bounceR = reflect(refrR, innerN);
  vec3 bounceG = reflect(refrG, innerN);
  vec3 bounceB = reflect(refrB, innerN);

  float bounceMix = 0.42;
  vec3 refractionColor = vec3(
    mix(sampleEnv(refrR).r, sampleEnv(bounceR).r, bounceMix),
    mix(sampleEnv(refrG).g, sampleEnv(bounceG).g, bounceMix),
    mix(sampleEnv(refrB).b, sampleEnv(bounceB).b, bounceMix)
  );

  vec3 reflColor = sampleEnv(reflect(-V, N));

  vec3 col = mix(refractionColor, reflColor, fres);

  // Bright rim — pushes the edge toward white as facets meet the camera
  col += fres * vec3(0.98, 0.99, 1.05) * 0.85;

  // Body absorption tint — a whisper of blue in the "glass"
  col *= mix(vec3(0.92, 0.96, 1.02), vec3(1.0), fres);

  // Tone curve — subtle contrast boost so the fire pops on dark bg
  col = pow(col, vec3(0.92));

  gl_FragColor = vec4(col, uAlpha);
}
`;function Pn(e=16){let t=[],n=[],r=Math.PI/e,i=[[.55,0,0],[.55,.42,0],[.36,.68,r],[.08,1,0],[-.18,.88,r],[-.68,.42,0],[-.98,0,0]],a=[];for(let[n,r,o]of i)if(a.push(t.length/3),r===0)t.push(0,n,0);else for(let i=0;i<e;i++){let a=i/e*Math.PI*2+o;t.push(Math.cos(a)*r,n,Math.sin(a)*r)}for(let t=0;t<i.length-1;t++){let[,r]=i[t],[,o]=i[t+1],s=a[t],c=a[t+1];if(r===0&&o>0)for(let t=0;t<e;t++){let r=(t+1)%e;n.push(s,c+t,c+r)}else if(r>0&&o===0)for(let t=0;t<e;t++){let r=(t+1)%e;n.push(s+t,s+r,c)}else for(let t=0;t<e;t++){let r=(t+1)%e;n.push(s+t,s+r,c+t),n.push(s+r,c+r,c+t)}}let o=new ue;return o.setAttribute(`position`,new Re(t,3)),o.setIndex(n),o}var Fn=class{constructor({renderer:e,onReveal:t}){this.renderer=e,this._onReveal=t,this.loadingManager=new _,this._realProgress=0,this._displayProgress={value:0},this._loadDone=!1,this._startTime=0,this.scene=new ze,this.camera=new de(38,1,.1,100),this.camera.position.set(0,0,3.9),this.overlay=null,this.frameEl=null,this.counterEl=null,this.diamond=null,this._rafId=null,this._active=!1,this._resize=null}getLoadingManager(){return this.loadingManager}markComplete(){this._realProgress=1,this._loadDone=!0}async run(){this._createDOM(),this._createDiamond(),this._bindLoadingManager(),this._startLoop(),await this._runPhase1(),await this._runPhase2(),await this._runPhase3(),this._destroy()}_runPhase1(){return new Promise(e=>{let t=()=>{let n=(performance.now()-this._startTime)/1e3;this._loadDone&&n>=Tn?H.to(this._displayProgress,{value:1,duration:.45,ease:`power2.out`,onComplete:()=>{this.counterEl&&(this.counterEl.textContent=`100`),H.delayedCall(.25,e)}}):setTimeout(t,60)};t()})}_runPhase2(){return new Promise(e=>{let t=H.timeline({onComplete:e});t.to(this.diamond.scale,{x:.05,y:.05,z:.05,duration:Dn,ease:On},0),t.to(this.diamond.material.uniforms.uAlpha,{value:0,duration:Dn*.85,ease:`power2.in`},Dn*.15),t.to(this.frameEl,{clipPath:`polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%)`,duration:Dn,ease:On},0),t.to(this.counterEl.parentElement,{scale:.6,opacity:0,duration:Dn*.7,ease:`power3.in`},Dn*.15)})}_runPhase3(){return new Promise(e=>{this._active=!1,this._rafId&&cancelAnimationFrame(this._rafId),this._onReveal&&this._onReveal();let t=this.overlay,n=Math.hypot(window.innerWidth,window.innerHeight)*.6,r=e=>{let n=`radial-gradient(circle at 50% 50%, transparent ${Math.max(0,e)}px, black ${e+jn}px)`;t.style.maskImage=n,t.style.webkitMaskImage=n};r(0);let i={r:0},a=H.timeline({onComplete:()=>H.delayedCall(.05,e)});a.to(i,{r:n,duration:kn,ease:An,onUpdate:()=>r(i.r)},0),a.to(t,{opacity:0,duration:.75,ease:`power2.out`},kn-.55)})}_createDOM(){document.body.classList.add(`holm-loading`);let e=document.createElement(`div`);e.className=`holm-loader`,e.style.setProperty(`--holm-loader-bg`,En),e.innerHTML=`
      <div class="holm-loader__frame">
        <div class="holm-loader__counter">
          <span class="holm-loader__num">0</span><span class="holm-loader__pct">%</span>
        </div>
      </div>
    `,document.body.appendChild(e),this.overlay=e,this.frameEl=e.querySelector(`.holm-loader__frame`),this.counterEl=e.querySelector(`.holm-loader__num`)}_createDiamond(){let e=Pn(16);e.scale(.82,.98,.82);let t=new P({vertexShader:Mn,fragmentShader:Nn,uniforms:{uTime:{value:0},uAlpha:{value:1}},transparent:!0});this.diamond=new k(e,t),this.diamond.rotation.x=-.28,this.scene.add(this.diamond),this._resize=()=>{let e=window.innerWidth/window.innerHeight;this.camera.aspect=e,this.camera.position.z=e<.75?5.6:e<1?4.6:3.9,this.camera.updateProjectionMatrix()},window.addEventListener(`resize`,this._resize),this._resize()}_bindLoadingManager(){this.loadingManager.onProgress=(e,t,n)=>{if(this._loadDone)return;let r=n>0?t/n:0;this._realProgress=Math.max(this._realProgress,r)}}_startLoop(){this._active=!0,this._startTime=performance.now();let e=this._startTime,t=n=>{if(!this._active)return;let r=(n-e)/1e3,i=(n-this._startTime)/1e3;e=n,this._displayProgress.value+=(this._realProgress-this._displayProgress.value)*.06;let a=Math.min(i/Tn,1),o=Math.min(this._displayProgress.value,a),s=Math.floor(o*100);this.counterEl&&(this.counterEl.textContent=String(s)),this.diamond.rotation.y+=r*.32,this.diamond.rotation.x=-.28+Math.sin(i*.45)*.08,this.diamond.rotation.z=Math.sin(i*.3)*.05,this.diamond.material.uniforms.uTime.value=i,this.renderer.autoClear=!0,this.renderer.setClearColor(En,1),this.renderer.render(this.scene,this.camera),this._rafId=requestAnimationFrame(t)};this._rafId=requestAnimationFrame(t)}_destroy(){this._active=!1,document.body.classList.remove(`holm-loading`),this._rafId&&cancelAnimationFrame(this._rafId),this._resize&&window.removeEventListener(`resize`,this._resize),this.diamond&&(this.diamond.geometry.dispose(),this.diamond.material.dispose()),this.overlay?.parentNode&&this.overlay.parentNode.removeChild(this.overlay),this.scene=null,this.camera=null,this.diamond=null,this.overlay=null}},X=new w,In=new b,Ln=new g,Rn=new g,zn=new g,Bn=class{constructor(e){this.geometry=e.geometry,this.randomFunction=Math.random,this.indexAttribute=this.geometry.index,this.positionAttribute=this.geometry.getAttribute(`position`),this.normalAttribute=this.geometry.getAttribute(`normal`),this.colorAttribute=this.geometry.getAttribute(`color`),this.uvAttribute=this.geometry.getAttribute(`uv`),this.weightAttribute=null,this.distribution=null}setWeightAttribute(e){return this.weightAttribute=e?this.geometry.getAttribute(e):null,this}build(){let e=this.indexAttribute,t=this.positionAttribute,n=this.weightAttribute,r=e?e.count/3:t.count/3,i=new Float32Array(r);for(let a=0;a<r;a++){let r=1,o=3*a,s=3*a+1,c=3*a+2;e&&(o=e.getX(o),s=e.getX(s),c=e.getX(c)),n&&(r=n.getX(o)+n.getX(s)+n.getX(c)),X.a.fromBufferAttribute(t,o),X.b.fromBufferAttribute(t,s),X.c.fromBufferAttribute(t,c),r*=X.getArea(),i[a]=r}let a=new Float32Array(r),o=0;for(let e=0;e<r;e++)o+=i[e],a[e]=o;return this.distribution=a,this}setRandomGenerator(e){return this.randomFunction=e,this}sample(e,t,n,r){let i=this._sampleFaceIndex();return this._sampleFace(i,e,t,n,r)}_sampleFaceIndex(){let e=this.distribution[this.distribution.length-1];return this._binarySearch(this.randomFunction()*e)}_binarySearch(e){let t=this.distribution,n=0,r=t.length-1,i=-1;for(;n<=r;){let a=Math.ceil((n+r)/2);if(a===0||t[a-1]<=e&&t[a]>e){i=a;break}else e<t[a]?r=a-1:n=a+1}return i}_sampleFace(e,t,n,r,i){let a=this.randomFunction(),o=this.randomFunction();a+o>1&&(a=1-a,o=1-o);let s=this.indexAttribute,c=e*3,l=e*3+1,u=e*3+2;return s&&(c=s.getX(c),l=s.getX(l),u=s.getX(u)),X.a.fromBufferAttribute(this.positionAttribute,c),X.b.fromBufferAttribute(this.positionAttribute,l),X.c.fromBufferAttribute(this.positionAttribute,u),t.set(0,0,0).addScaledVector(X.a,a).addScaledVector(X.b,o).addScaledVector(X.c,1-(a+o)),n!==void 0&&(this.normalAttribute===void 0?X.getNormal(n):(X.a.fromBufferAttribute(this.normalAttribute,c),X.b.fromBufferAttribute(this.normalAttribute,l),X.c.fromBufferAttribute(this.normalAttribute,u),n.set(0,0,0).addScaledVector(X.a,a).addScaledVector(X.b,o).addScaledVector(X.c,1-(a+o)).normalize())),r!==void 0&&this.colorAttribute!==void 0&&(X.a.fromBufferAttribute(this.colorAttribute,c),X.b.fromBufferAttribute(this.colorAttribute,l),X.c.fromBufferAttribute(this.colorAttribute,u),In.set(0,0,0).addScaledVector(X.a,a).addScaledVector(X.b,o).addScaledVector(X.c,1-(a+o)),r.r=In.x,r.g=In.y,r.b=In.z),i!==void 0&&this.uvAttribute!==void 0&&(Ln.fromBufferAttribute(this.uvAttribute,c),Rn.fromBufferAttribute(this.uvAttribute,l),zn.fromBufferAttribute(this.uvAttribute,u),i.set(0,0).addScaledVector(Ln,a).addScaledVector(Rn,o).addScaledVector(zn,1-(a+o))),this}},Vn=.53,Hn=.56,Un=.55,Wn=.57,Gn=.58,Kn=.6,qn=.62,Jn=.65,Yn=3.5,Xn=8,Zn=.04,Qn=32,$n=18,er=10,tr=6,nr=5,rr=new B(2109520),ir=.55;function ar(e){let t=Math.max(0,Math.min(1,e));return t*t*(3-2*t)}function or(t,n,r,i){let a=i?er:Qn,o=i?tr:$n,s=a*o,c=i?nr:Xn,l=t.getSize(new g),u=new Ge(Math.floor(l.x*(i?.5:1)),Math.floor(l.y*(i?.5:1)),{minFilter:m,magFilter:m}),d=1/a,f=1/o,p=new Float32Array(s*4);for(let e=0;e<o;e++)for(let t=0;t<a;t++){let n=e*a+t;p[n*4+0]=t*d,p[n*4+1]=1-(e+1)*f,p[n*4+2]=d,p[n*4+3]=f}let h=new ye(p,4),_=new Se(1,1,Zn);_.setAttribute(`instanceUV`,h);let v={uOpacity:{value:1},uTintColor:{value:rr.clone()},uTintAmount:{value:0}},y=new e({map:u.texture,transparent:!0,depthWrite:!1,side:0});y.onBeforeCompile=e=>{e.uniforms.uOpacity=v.uOpacity,e.uniforms.uTintColor=v.uTintColor,e.uniforms.uTintAmount=v.uTintAmount,e.vertexShader=e.vertexShader.replace(`void main() {`,`attribute vec4 instanceUV;
varying vec2 vTileUv;
void main() {`),e.vertexShader=e.vertexShader.replace(`#include <begin_vertex>`,`#include <begin_vertex>
vTileUv = vec2(instanceUV.x + uv.x * instanceUV.z,
               instanceUV.y + uv.y * instanceUV.w);`),e.fragmentShader=`
uniform sampler2D map;
uniform float uOpacity;
uniform vec3 uTintColor;
uniform float uTintAmount;
varying vec2 vTileUv;
void main() {
  vec4 c = texture2D(map, vTileUv);
  vec3 col = mix(c.rgb, uTintColor, uTintAmount);
  gl_FragColor = vec4(col, c.a * uOpacity);
}
`},y.customProgramCacheKey=()=>`shatter_tile`;let S=new x(_,y,s);S.frustumCulled=!1,S.visible=!1,n.add(S);let C=Array(s),w=Array(s),T=Array(s),E=new Float32Array(s*3),D=1,O=1,k=!1,ee=!0,A=new Ce,j=new b,M=[],N=[];function P(e,t){let n=new Set;e.traverse(e=>{if(!e.isMesh)return;let r=e.material;r&&!n.has(r)&&(n.add(r),t.push(r))})}function F(e,t){for(let n of e)n.opacity=t}function te(){for(let e of N)e.opacity=1;for(let e of M)e.opacity=1}function ne(){r.updateMatrixWorld();let e=r.fov*Math.PI/180,t=Math.tan(e/2)*Yn,n=t*r.aspect;D=n*2/a,O=t*2/o;let i=new b,s=new b,c=new b;r.getWorldDirection(i),s.setFromMatrixColumn(r.matrixWorld,0),c.setFromMatrixColumn(r.matrixWorld,1);let l=r.position.clone().addScaledVector(i,Yn);for(let e=0;e<o;e++)for(let r=0;r<a;r++){let i=e*a+r,u=(r+.5)/a*2-1,d=1-(e+.5)/o*2;C[i]=l.clone().addScaledVector(s,u*n).addScaledVector(c,d*t)}}function re(){let e=new b;for(let t=0;t<s;t++)e.set(Math.random()-.5,Math.random()-.5,Math.random()-.5).normalize().multiplyScalar(c*(.4+Math.random()*.6)),w[t]=C[t].clone().add(e),E[t*3]=(Math.random()-.5)*Math.PI*2,E[t*3+1]=(Math.random()-.5)*Math.PI*2,E[t*3+2]=(Math.random()-.5)*Math.PI*2}function ie(e){e.updateMatrixWorld(!0);let t=[];if(e.traverse(e=>{e.isMesh&&e.geometry&&e.geometry.attributes.position&&t.push(e)}),!t.length){console.warn(`[shatter] setSurface: no sampelable meshes found`);return}P(e,M);for(let e of M)e.transparent=!0,e.opacity=1;let n=new b,r=new b,i=[],a=Math.ceil(s/t.length);for(let e of t){if(i.length>=s)break;let t=new Bn(e).build(),o=Math.min(a,s-i.length);for(let a=0;a<o;a++)t.sample(n,r),i.push(n.clone().applyMatrix4(e.matrixWorld))}for(;i.length<s;)i.push(i[Math.floor(Math.random()*i.length)].clone());for(let e=i.length-1;e>0;e--){let t=Math.floor(Math.random()*(e+1));[i[e],i[t]]=[i[t],i[e]]}for(let e=0;e<s;e++)T[e]=i[e];k=!0,console.log(`[shatter] surface sampled — ${s} pts across ${t.length} mesh(es)`)}function I(e){P(e,N);for(let e of N)e.transparent=!0,e.opacity=1;console.log(`[shatter] hero_canvas primed — ${N.length} material(s)`)}function L(){ne(),re(),t.setRenderTarget(u),t.render(n,r),t.setRenderTarget(null),v.uOpacity.value=1,v.uTintAmount.value=0,j.set(D,O,Zn),A.rotation.set(0,0,0);for(let e=0;e<s;e++)A.position.copy(C[e]),A.scale.copy(j),A.updateMatrix(),S.setMatrixAt(e,A.matrix);S.instanceMatrix.needsUpdate=!0,S.visible=!0}function R(e){let t={bgDark:0,textOpacity:0};if(e<.51||e>.65)return ee||=(S.visible=!1,te(),v.uOpacity.value=1,v.uTintAmount.value=0,!0),t;ee=!1,S.visible||=!0;let n=0,r=0,i=1,a,o,c=0,l=0;if(e<Vn)n=0,r=0,a=C,o=w,c=0,F(N,1),F(M,1),v.uOpacity.value=1,v.uTintAmount.value=0;else if(e<.56){let t=ar((e-Vn)/(Hn-Vn));n=t,r=t,a=C,o=w,c=t,F(N,1-t),F(M,1-t),v.uOpacity.value=1,v.uTintAmount.value=0}else if(e<.6)n=1,r=0,a=C,o=w,c=1,F(N,0),F(M,0),v.uOpacity.value=1,v.uTintAmount.value=0,l=e<.57?ar((e-Un)/(Wn-Un)):e<.58?1:1-ar((e-Gn)/(Kn-Gn));else if(!k||e<.62)if(k){let t=ar((e-Kn)/(qn-Kn));n=t,r=1-t,a=w,o=T,c=1-t,F(N,0),F(M,0),v.uOpacity.value=1,v.uTintAmount.value=t*ir}else{let t=(e-Kn)/(Jn-Kn);n=ar(1-t),r=n,a=C,o=w,c=1-ar(t)}else{let t=ar((e-qn)/(Jn-qn));n=1,r=0,a=T,o=T,i=1-t,c=0,F(N,0),F(M,t),v.uOpacity.value=1-t,v.uTintAmount.value=ir*(1-t)}j.set(D*i,O*i,Zn*i);for(let e=0;e<s;e++)A.position.lerpVectors(a[e],o[e],n),A.rotation.set(E[e*3]*r,E[e*3+1]*r,E[e*3+2]*r),A.scale.copy(j),A.updateMatrix(),S.setMatrixAt(e,A.matrix);return S.instanceMatrix.needsUpdate=!0,{bgDark:c,textOpacity:l}}function z(){n.remove(S),u.dispose(),_.dispose(),y.dispose(),te()}return{capture:L,update:R,setSurface:ie,setHeroCanvas:I,dispose:z,mesh:S}}var Z=window.innerWidth<768||`ontouchstart`in window,sr={"hand.glb":`Every brand begins like this.`,"monument.glb":`Something is always missing at the beginning.`,"hero_canvas.glb":`Between sketch and masterpiece, there's patience.`,"void_figure.glb":`What's left unsaid shapes the rest.`,"arm_crystal.glb":`What was missing is held at the end.`};function cr(e){return sr[e]??``}var Q=[{file:`/models/hand.glb`,z:0,scale:3},{file:`/models/monument.glb`,z:-12,scale:.57},{file:`/models/hero_canvas.glb`,z:-24,scale:3},{file:`/models/void_figure.glb`,z:-36,orbitN:Z?36:32},{file:`/models/arm_crystal.glb`,z:-48}].map(e=>({...e,caption:cr(e.file.split(`/`).pop())})),lr=document.getElementById(`scene-canvas`),ur=document.getElementById(`caption`),dr=document.getElementById(`gathering-text`);document.querySelector(`.wordmark`);var fr=document.getElementById(`scroll-hint`),{scene:pr,renderer:mr,camera:$,spotLight:hr,armSpot:gr,ambient:_r,hemi:vr,wallUniforms:yr,onResize:br}=Ke(lr,Z),xr=75,Sr=55,Cr=900,wr=-48,Tr=30,Er=gt(mr,pr,$,Z),Dr=0,Or=qe(pr),kr=or(mr,pr,$,Z),Ar=!1,jr=1.8,Mr=Z?5:4,Nr=Z?16:32;function Pr(){let e=[],t=jr,n=Mr;e.push(new b(0,t,10)),e.push(new b(0,t,7)),Q.forEach((r,i)=>{let a=r.z,o=r.orbitN??Nr;for(let r=0;r<=o;r++){let i=r/o*Math.PI*2;e.push(new b(Math.sin(i)*n,t,a+Math.cos(i)*n))}if(i<Q.length-1){let r=Q[i+1].z;e.push(new b(n*1.5,t,a)),e.push(new b(n*.8,t,a-n-1)),e.push(new b(0,t,r+n+1))}});let r=Q[Q.length-1].z;return e.push(new b(n*1.2,t,r)),e.push(new b(0,t,r-n-2)),e.push(new b(0,t,r-20)),e.push(new b(0,t,r-28)),new Oe(e,!1,`catmullrom`,.5)}var Fr=Pr(),Ir=0,Lr=0,Rr=new b,zr=new b(0,1.5,0),Br=new b(0,1.5,0),Vr=new b(0,6,0),Hr=new b(0,.5,0),Ur=null;function Wr(e){if(e!==Ur){if(Ur=e,H.killTweensOf(ur),!e){H.to(ur,{opacity:0,duration:.3});return}H.to(ur,{opacity:0,duration:.25,ease:`power2.in`,onComplete(){ur.textContent=e,H.to(ur,{opacity:1,duration:.5,ease:`power2.out`})}})}}function Gr(e){let t=1/0,n=null;for(let r of Q){let i=Math.hypot(e.x,e.z-r.z);i<t&&(t=i,n=r)}return{def:n,dist:t}}var Kr=new se,qr=new g(-9,-9),Jr=new he,Yr=[],Xr=null;lr.addEventListener(`pointermove`,e=>{qr.x=e.clientX/window.innerWidth*2-1,qr.y=-(e.clientY/window.innerHeight)*2+1}),lr.addEventListener(`pointerleave`,()=>qr.set(-9,-9));var Zr=null,Qr=null,$r=null,ei=null,ti=600;function ni(){Zr=new ue,Qr=new Float32Array(ti*3),$r=new Float32Array(ti*3);for(let e=0;e<ti;e++){let t=(Math.random()-.5)*16,n=Math.random()*7,r=5-Math.random()*65;Qr[e*3]=$r[e*3]=t,Qr[e*3+1]=$r[e*3+1]=n,Qr[e*3+2]=$r[e*3+2]=r}Zr.setAttribute(`position`,new Pe(Qr,3));let e=new ge({size:.015,color:8425664,transparent:!0,opacity:.35,depthWrite:!1});ei=new Te(Zr,e),pr.add(ei)}function ri(e){if(!Zr)return;let t=Zr.attributes.position;for(let n=0;n<ti;n++){let r=n*3;t.array[r+1]+=.001,t.array[r+0]=$r[r]+Math.sin(e*.3+n*.17)*.08,t.array[r+2]=$r[r+2]+Math.cos(e*.2+n*.13)*.05,t.array[r+1]>7&&(t.array[r+1]=0,$r[r+1]=0)}t.needsUpdate=!0}var ii=[155,255,390,580,1190],ai=new G({color:855311,roughness:.9,metalness:.1});async function oi(e,t){try{let n=await wn(e.file);e.scale&&n.scale.setScalar(e.scale),n.updateMatrixWorld(!0);let r=new ce().setFromObject(n),i=isFinite(r.min.x)?(r.min.x+r.max.x)/2:0,a=isFinite(r.min.z)?(r.min.z+r.max.z)/2:0,o=isFinite(r.min.y)?-r.min.y+.3:.3;n.position.set(-i,o,e.z-a),n.traverse(t=>{if(t.isMesh&&(t.castShadow=t.receiveShadow=!Z,!Z)){let n=t.material.clone(),r={uTime:{value:0},uIntensity:{value:0}};n.onBeforeCompile=e=>{e.uniforms.uTime=r.uTime,e.uniforms.uIntensity=r.uIntensity,e.vertexShader=`uniform float uTime;
uniform float uIntensity;
`+e.vertexShader.replace(`#include <begin_vertex>`,`#include <begin_vertex>
               float _w = sin(position.x * 4.0 + uTime * 1.3)
                        * sin(position.y * 3.5 + uTime * 0.9)
                        * 0.015 * uIntensity;
               transformed += normal * _w;`)},n.customProgramCacheKey=()=>`holm_distort`,t.material=n,Yr.push({mesh:t,uniforms:r,defZ:e.z})}}),pr.add(n),e.file.includes(`void_figure`)&&kr.setSurface(n),e.file.includes(`hero_canvas`)&&kr.setHeroCanvas(n);let s=new k(new Ie(.4,.5,.3,32),ai);s.position.set(0,.15,e.z),s.castShadow=s.receiveShadow=!0,pr.add(s);let c=Je();c.position.set(0,.02,e.z),pr.add(c);let l=new ke(13691135,ii[t]??500,16,2);l.position.set(0,6.5,e.z),pr.add(l),console.log(`[HOLM] ✓ ${e.file} @ z=${e.z}`)}catch(t){console.error(`[HOLM] ✗ ${e.file}`,t)}}var si=!1,ci=document.getElementById(`projection-overlay`);function li(){Or.visible=!0,ci.classList.add(`active`),H.to(ci,{opacity:1,duration:1.2,ease:`power2.out`});let e=ci.querySelectorAll(`.proj-line`);H.fromTo(e,{opacity:0,y:12},{opacity:1,y:0,duration:1,stagger:.4,delay:.4,ease:`power2.out`}),H.fromTo(ci.querySelector(`.proj-cta`),{opacity:0,y:8},{opacity:1,y:0,duration:1,delay:2.6,ease:`power2.out`})}function ui(){H.to(ci,{opacity:0,duration:.5,onComplete:()=>{ci.classList.remove(`active`),Or.visible=!1,H.set(`.proj-line, .proj-cta`,{opacity:0,y:0})}})}Z&&(fr.textContent=`SWIPE TO EXPLORE`);var di=new i(Z?{smoothTouch:!1,touchMultiplier:.65}:{duration:4,smoothWheel:!0,wheelMultiplier:.28,touchMultiplier:1.2,smoothTouch:!1});H.ticker.lagSmoothing(0),new Me({lenis:di}).mount();var fi=!1;di.on(`scroll`,({scroll:e,limit:t})=>{Ir=t>0?e/t:0,!fi&&e>80&&(fi=!0,H.to(fr,{opacity:0,duration:.8,ease:`power2.out`}))});function pi(e=0){requestAnimationFrame(pi),di.raf(e);let t=Jr.getElapsedTime();if(!Z){Kr.setFromCamera(qr,$);let e=Kr.intersectObjects(Yr.map(e=>e.mesh),!1);Xr=e.length>0?Yr.find(t=>t.mesh===e[0].object)?.defZ??null:null;for(let e of Yr){e.uniforms.uTime.value=t;let n=+(e.defZ===Xr),r=e.uniforms.uIntensity;r.value+=(n-r.value)*.12,r.value<.001&&(r.value=0)}}Z?(Lr+=(Ir-Lr)*.11,Rr.copy(Fr.getPoint(Lr)),$.position.copy(Rr)):(Rr.copy(Fr.getPoint(Ir)),$.position.lerp(Rr,.07));let{def:n,dist:r}=Gr($.position),i=n&&r<Mr+1.5,a=$.position.z<-56,o=$.position.z<-68;if(a)zr.set(0,4,-89.5),Vr.set(0,7,$.position.z),Hr.set(0,3.5,-89.5),Wr(``),Or.material.uniforms.uTime.value=t,o&&!si&&(si=!0,li()),!o&&si&&(si=!1,ui());else if(i)zr.set(0,1.5,n.z),Vr.set(0,6,n.z),Hr.set(0,.5,n.z),Wr(n.caption),si&&(si=!1,ui());else{let e=Q.find(e=>e.z<$.position.z-1);zr.set(0,1.5,e?e.z:$.position.z-10),Vr.set(0,6,$.position.z-3),Hr.set(0,.5,$.position.z-8),r>Mr*3&&Wr(``),si&&(si=!1,ui()),Or.visible=!1}Br.lerp(zr,.07),$.lookAt(Br),hr.position.lerp(Vr,.05),hr.target.position.lerp(Hr,.05),hr.target.updateMatrixWorld();let s=Math.hypot($.position.x,$.position.z-wr);gr.intensity+=((s<Mr+3?Cr:0)-gr.intensity)*.1,Er.bokeh&&(Er.bokeh.uniforms.focus.value=r),Er.grainVignette&&(Er.grainVignette.uniforms.uTime.value=t),yr.uTime.value=t,Z||ri(t);let c=Z?Lr:Ir;c>=.51&&!Ar&&(Ar=!0,kr.capture()),c<.46&&(Ar=!1);let{bgDark:l,textOpacity:u}=kr.update(c),d=(1-l*.92)*Dr;_r.intensity=xr*d,vr.intensity=Sr*d,hr.intensity=Tr*Math.max(d,.12*Dr),dr&&(dr.style.opacity=u),u>.01&&Wr(``),Er.composer.render()}window.addEventListener(`resize`,()=>{br(),Er.setSize(window.innerWidth,window.innerHeight)});async function mi(){let e=Fr.getPoint(0);$.position.copy(e),$.position.z+=3,Br.set(0,1.5,Q[0].z),$.lookAt(Br);let t=!1,n=new Fn({renderer:mr,onReveal:()=>{if(t)return;t=!0,requestAnimationFrame(pi);let n={v:0};H.to(n,{v:1,duration:4.2,ease:`power2.out`,onUpdate:()=>{Dr=n.v}}),H.to($.position,{z:e.z,duration:3.8,ease:`power2.out`}),H.to(ur,{opacity:1,duration:1.4,delay:2.4,ease:`power2.out`})}});Sn(n.getLoadingManager());let r=n.run();for(let e=0;e<Q.length;e++)await oi(Q[e],e);Z||ni(),n.markComplete(),await r;let i=document.querySelector(`.proj-cta`);i&&(i.addEventListener(`mousemove`,e=>{let t=i.getBoundingClientRect(),n=(e.clientX-t.left-t.width*.5)/t.width,r=(e.clientY-t.top-t.height*.5)/t.height;H.to(i,{x:n*14,y:r*9,duration:.35,ease:`power2.out`})}),i.addEventListener(`mouseleave`,()=>H.to(i,{x:0,y:0,duration:.7,ease:`elastic.out(1, 0.45)`})))}mi();