import{A as e,B as t,Ct as n,D as r,Dt as i,E as a,Et as o,Ht as s,Jt as c,L as l,Lt as u,M as d,Nt as f,Ot as p,Pt as m,Qt as h,R as g,Rt as _,St as v,U as y,V as b,Vt as x,W as S,Zt as C,a as w,an as T,b as E,c as D,ct as O,d as k,dt as ee,en as te,et as A,f as j,ft as M,gt as N,h as P,i as F,j as I,k as ne,kt as L,l as R,lt as z,m as B,mt as V,n as re,nn as H,o as ie,on as ae,ot as oe,r as se,s as ce,t as le,tn as U,u as ue,ut as W,v as de,vt as fe,w as pe,wt as me,x as he,y as ge,zt as _e}from"./pageTransition-C1rQ-lDC.js";import{t as ve}from"./UnrealBloomPass-DTcgmD1s.js";import{n as ye,t as be}from"./DRACOLoader-Db2F7FGi.js";function xe(e,t=!1){let n=new B({canvas:e,antialias:!t});n.setPixelRatio(Math.min(window.devicePixelRatio,t?1:2)),n.setSize(window.innerWidth,window.innerHeight),n.toneMapping=4,n.toneMappingExposure=6.5,n.shadowMap.enabled=!t,n.shadowMap.type=2,n.outputColorSpace=_e;let a=new x;a.background=new r(394762),a.fog=new g(394762,.022);let s=new me(60,window.innerWidth/window.innerHeight,.1,100);s.position.set(0,1.8,8),s.lookAt(0,1.5,0);let l={uTime:{value:0}},u=new ee({color:1315864,side:1}),d=new W(new ge(20,8,102),u);d.position.set(0,4,-39),d.receiveShadow=!0,a.add(d);let f=new N({color:2829110,roughness:.85,metalness:.1,emissive:new r(1842214),emissiveIntensity:12.5}),p=new W(new o(20,102),f);p.rotation.x=-Math.PI/2,p.position.set(0,.001,-39),p.receiveShadow=!0,a.add(p);let m=new P(2109520,75);a.add(m);let h=new b(3162208,526352,55);a.add(h);let _=new c(13162751,30,22,.6,.75,2);_.position.set(0,6,0),_.castShadow=!t,_.shadow.mapSize.set(t?512:1024,t?512:1024),_.shadow.bias=-.002,a.add(_),a.add(_.target);let v=new c(13691135,0,18,.5,.85,2);v.position.set(0,7,-48),v.target.position.set(0,0,-48),v.castShadow=!t,v.shadow.mapSize.set(t?512:1024,t?512:1024),v.shadow.bias=-.002,v.target.updateMatrixWorld(),a.add(v),a.add(v.target);let y=new i(5271728,3e3,30,2);y.position.set(0,5,-83),a.add(y);function S(){s.aspect=window.innerWidth/window.innerHeight,s.updateProjectionMatrix(),n.setSize(window.innerWidth,window.innerHeight)}return window.addEventListener(`resize`,S),{scene:a,renderer:n,camera:s,spotLight:_,armSpot:v,ambient:m,hemi:h,wallUniforms:l,onResize:S}}function Se(e,t=!1){let n=new s({uniforms:{uTime:{value:0}},vertexShader:`
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
    `,transparent:!0,blending:2,depthWrite:!1,side:0}),r=new W(t?new o(48,42):new o(32,18),n);return r.position.set(0,t?8:4,-89.5),r.visible=!1,e.add(r),r}function Ce(){let e=new s({uniforms:{uColor:{value:new r(1721548)}},vertexShader:`
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
    `,transparent:!0,blending:2,depthWrite:!1,side:2}),t=new W(new o(2,2),e);return t.rotation.x=-Math.PI/2,t}var we=class{constructor(e=Math){this.grad3=[[1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],[1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],[0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]],this.grad4=[[0,1,1,1],[0,1,1,-1],[0,1,-1,1],[0,1,-1,-1],[0,-1,1,1],[0,-1,1,-1],[0,-1,-1,1],[0,-1,-1,-1],[1,0,1,1],[1,0,1,-1],[1,0,-1,1],[1,0,-1,-1],[-1,0,1,1],[-1,0,1,-1],[-1,0,-1,1],[-1,0,-1,-1],[1,1,0,1],[1,1,0,-1],[1,-1,0,1],[1,-1,0,-1],[-1,1,0,1],[-1,1,0,-1],[-1,-1,0,1],[-1,-1,0,-1],[1,1,1,0],[1,1,-1,0],[1,-1,1,0],[1,-1,-1,0],[-1,1,1,0],[-1,1,-1,0],[-1,-1,1,0],[-1,-1,-1,0]],this.p=[];for(let t=0;t<256;t++)this.p[t]=Math.floor(e.random()*256);this.perm=[];for(let e=0;e<512;e++)this.perm[e]=this.p[e&255];this.simplex=[[0,1,2,3],[0,1,3,2],[0,0,0,0],[0,2,3,1],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,2,3,0],[0,2,1,3],[0,0,0,0],[0,3,1,2],[0,3,2,1],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,3,2,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,2,0,3],[0,0,0,0],[1,3,0,2],[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,3,0,1],[2,3,1,0],[1,0,2,3],[1,0,3,2],[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,0,3,1],[0,0,0,0],[2,1,3,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,0,1,3],[0,0,0,0],[0,0,0,0],[0,0,0,0],[3,0,1,2],[3,0,2,1],[0,0,0,0],[3,1,2,0],[2,1,0,3],[0,0,0,0],[0,0,0,0],[0,0,0,0],[3,1,0,2],[0,0,0,0],[3,2,0,1],[3,2,1,0]]}noise(e,t){let n,r,i,a=.5*(Math.sqrt(3)-1),o=(e+t)*a,s=Math.floor(e+o),c=Math.floor(t+o),l=(3-Math.sqrt(3))/6,u=(s+c)*l,d=s-u,f=c-u,p=e-d,m=t-f,h,g;p>m?(h=1,g=0):(h=0,g=1);let _=p-h+l,v=m-g+l,y=p-1+2*l,b=m-1+2*l,x=s&255,S=c&255,C=this.perm[x+this.perm[S]]%12,w=this.perm[x+h+this.perm[S+g]]%12,T=this.perm[x+1+this.perm[S+1]]%12,E=.5-p*p-m*m;E<0?n=0:(E*=E,n=E*E*this._dot(this.grad3[C],p,m));let D=.5-_*_-v*v;D<0?r=0:(D*=D,r=D*D*this._dot(this.grad3[w],_,v));let O=.5-y*y-b*b;return O<0?i=0:(O*=O,i=O*O*this._dot(this.grad3[T],y,b)),70*(n+r+i)}noise3d(e,t,n){let r,i,a,o,s=(e+t+n)*(1/3),c=Math.floor(e+s),l=Math.floor(t+s),u=Math.floor(n+s),d=1/6,f=(c+l+u)*d,p=c-f,m=l-f,h=u-f,g=e-p,_=t-m,v=n-h,y,b,x,S,C,w;g>=_?_>=v?(y=1,b=0,x=0,S=1,C=1,w=0):g>=v?(y=1,b=0,x=0,S=1,C=0,w=1):(y=0,b=0,x=1,S=1,C=0,w=1):_<v?(y=0,b=0,x=1,S=0,C=1,w=1):g<v?(y=0,b=1,x=0,S=0,C=1,w=1):(y=0,b=1,x=0,S=1,C=1,w=0);let T=g-y+d,E=_-b+d,D=v-x+d,O=g-S+2*d,k=_-C+2*d,ee=v-w+2*d,te=g-1+3*d,A=_-1+3*d,j=v-1+3*d,M=c&255,N=l&255,P=u&255,F=this.perm[M+this.perm[N+this.perm[P]]]%12,I=this.perm[M+y+this.perm[N+b+this.perm[P+x]]]%12,ne=this.perm[M+S+this.perm[N+C+this.perm[P+w]]]%12,L=this.perm[M+1+this.perm[N+1+this.perm[P+1]]]%12,R=.6-g*g-_*_-v*v;R<0?r=0:(R*=R,r=R*R*this._dot3(this.grad3[F],g,_,v));let z=.6-T*T-E*E-D*D;z<0?i=0:(z*=z,i=z*z*this._dot3(this.grad3[I],T,E,D));let B=.6-O*O-k*k-ee*ee;B<0?a=0:(B*=B,a=B*B*this._dot3(this.grad3[ne],O,k,ee));let V=.6-te*te-A*A-j*j;return V<0?o=0:(V*=V,o=V*V*this._dot3(this.grad3[L],te,A,j)),32*(r+i+a+o)}noise4d(e,t,n,r){let i=this.grad4,a=this.simplex,o=this.perm,s=(Math.sqrt(5)-1)/4,c=(5-Math.sqrt(5))/20,l,u,d,f,p,m=(e+t+n+r)*s,h=Math.floor(e+m),g=Math.floor(t+m),_=Math.floor(n+m),v=Math.floor(r+m),y=(h+g+_+v)*c,b=h-y,x=g-y,S=_-y,C=v-y,w=e-b,T=t-x,E=n-S,D=r-C,O=w>T?32:0,k=w>E?16:0,ee=T>E?8:0,te=w>D?4:0,A=T>D?2:0,j=+(E>D),M=O+k+ee+te+A+j,N=+(a[M][0]>=3),P=+(a[M][1]>=3),F=+(a[M][2]>=3),I=+(a[M][3]>=3),ne=+(a[M][0]>=2),L=+(a[M][1]>=2),R=+(a[M][2]>=2),z=+(a[M][3]>=2),B=+(a[M][0]>=1),V=+(a[M][1]>=1),re=+(a[M][2]>=1),H=+(a[M][3]>=1),ie=w-N+c,ae=T-P+c,oe=E-F+c,se=D-I+c,ce=w-ne+2*c,le=T-L+2*c,U=E-R+2*c,ue=D-z+2*c,W=w-B+3*c,de=T-V+3*c,fe=E-re+3*c,pe=D-H+3*c,me=w-1+4*c,he=T-1+4*c,ge=E-1+4*c,_e=D-1+4*c,ve=h&255,ye=g&255,be=_&255,xe=v&255,Se=o[ve+o[ye+o[be+o[xe]]]]%32,Ce=o[ve+N+o[ye+P+o[be+F+o[xe+I]]]]%32,we=o[ve+ne+o[ye+L+o[be+R+o[xe+z]]]]%32,Te=o[ve+B+o[ye+V+o[be+re+o[xe+H]]]]%32,Ee=o[ve+1+o[ye+1+o[be+1+o[xe+1]]]]%32,G=.6-w*w-T*T-E*E-D*D;G<0?l=0:(G*=G,l=G*G*this._dot4(i[Se],w,T,E,D));let De=.6-ie*ie-ae*ae-oe*oe-se*se;De<0?u=0:(De*=De,u=De*De*this._dot4(i[Ce],ie,ae,oe,se));let K=.6-ce*ce-le*le-U*U-ue*ue;K<0?d=0:(K*=K,d=K*K*this._dot4(i[we],ce,le,U,ue));let Oe=.6-W*W-de*de-fe*fe-pe*pe;Oe<0?f=0:(Oe*=Oe,f=Oe*Oe*this._dot4(i[Te],W,de,fe,pe));let ke=.6-me*me-he*he-ge*ge-_e*_e;return ke<0?p=0:(ke*=ke,p=ke*ke*this._dot4(i[Ee],me,he,ge,_e)),27*(l+u+d+f+p)}_dot(e,t,n){return e[0]*t+e[1]*n}_dot3(e,t,n,r){return e[0]*t+e[1]*n+e[2]*r}_dot4(e,t,n,r,i){return e[0]*t+e[1]*n+e[2]*r+e[3]*i}},Te={name:`SSAOShader`,defines:{PERSPECTIVE_CAMERA:1,KERNEL_SIZE:32},uniforms:{tNormal:{value:null},tDepth:{value:null},tNoise:{value:null},kernel:{value:null},cameraNear:{value:null},cameraFar:{value:null},resolution:{value:new U},cameraProjectionMatrix:{value:new z},cameraInverseProjectionMatrix:{value:new z},kernelRadius:{value:8},minDistance:{value:.005},maxDistance:{value:.05}},vertexShader:`

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

		}`},Ee={name:`SSAODepthShader`,defines:{PERSPECTIVE_CAMERA:1},uniforms:{tDepth:{value:null},cameraNear:{value:null},cameraFar:{value:null}},vertexShader:`varying vec2 vUv;

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

		}`},G={name:`SSAOBlurShader`,uniforms:{tDiffuse:{value:null},resolution:{value:new U}},vertexShader:`varying vec2 vUv;

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

		}`},De=class n extends ue{constructor(e,n,i=512,a=512,o=32){super(),this.width=i,this.height=a,this.clear=!0,this.needsSwap=!1,this.camera=n,this.scene=e,this.kernelRadius=8,this.kernel=[],this.noiseTexture=null,this.output=0,this.minDistance=.005,this.maxDistance=.1,this._visibilityCache=[],this._generateSampleKernel(o),this._generateRandomKernelRotations();let c=new d;c.format=I,c.type=te,this.normalRenderTarget=new T(this.width,this.height,{minFilter:fe,magFilter:fe,type:t,depthTexture:c}),this.ssaoRenderTarget=new T(this.width,this.height,{type:t}),this.blurRenderTarget=this.ssaoRenderTarget.clone(),this.ssaoMaterial=new s({defines:Object.assign({},Te.defines),uniforms:h.clone(Te.uniforms),vertexShader:Te.vertexShader,fragmentShader:Te.fragmentShader,blending:0}),this.ssaoMaterial.defines.KERNEL_SIZE=o,this.ssaoMaterial.uniforms.tNormal.value=this.normalRenderTarget.texture,this.ssaoMaterial.uniforms.tDepth.value=this.normalRenderTarget.depthTexture,this.ssaoMaterial.uniforms.tNoise.value=this.noiseTexture,this.ssaoMaterial.uniforms.kernel.value=this.kernel,this.ssaoMaterial.uniforms.cameraNear.value=this.camera.near,this.ssaoMaterial.uniforms.cameraFar.value=this.camera.far,this.ssaoMaterial.uniforms.resolution.value.set(this.width,this.height),this.ssaoMaterial.uniforms.cameraProjectionMatrix.value.copy(this.camera.projectionMatrix),this.ssaoMaterial.uniforms.cameraInverseProjectionMatrix.value.copy(this.camera.projectionMatrixInverse),this.normalMaterial=new V,this.normalMaterial.blending=0,this.blurMaterial=new s({defines:Object.assign({},G.defines),uniforms:h.clone(G.uniforms),vertexShader:G.vertexShader,fragmentShader:G.fragmentShader}),this.blurMaterial.uniforms.tDiffuse.value=this.ssaoRenderTarget.texture,this.blurMaterial.uniforms.resolution.value.set(this.width,this.height),this.depthRenderMaterial=new s({defines:Object.assign({},Ee.defines),uniforms:h.clone(Ee.uniforms),vertexShader:Ee.vertexShader,fragmentShader:Ee.fragmentShader,blending:0}),this.depthRenderMaterial.uniforms.tDepth.value=this.normalRenderTarget.depthTexture,this.depthRenderMaterial.uniforms.cameraNear.value=this.camera.near,this.depthRenderMaterial.uniforms.cameraFar.value=this.camera.far,this.copyMaterial=new s({uniforms:h.clone(k.uniforms),vertexShader:k.vertexShader,fragmentShader:k.fragmentShader,transparent:!0,depthTest:!1,depthWrite:!1,blendSrc:208,blendDst:200,blendEquation:100,blendSrcAlpha:206,blendDstAlpha:200,blendEquationAlpha:100}),this._fsQuad=new R(null),this._originalClearColor=new r}dispose(){this.normalRenderTarget.dispose(),this.ssaoRenderTarget.dispose(),this.blurRenderTarget.dispose(),this.normalMaterial.dispose(),this.blurMaterial.dispose(),this.copyMaterial.dispose(),this.depthRenderMaterial.dispose(),this._fsQuad.dispose()}render(e,t,r){switch(this._overrideVisibility(),this._renderOverride(e,this.normalMaterial,this.normalRenderTarget,7829503,1),this._restoreVisibility(),this.ssaoMaterial.uniforms.kernelRadius.value=this.kernelRadius,this.ssaoMaterial.uniforms.minDistance.value=this.minDistance,this.ssaoMaterial.uniforms.maxDistance.value=this.maxDistance,this._renderPass(e,this.ssaoMaterial,this.ssaoRenderTarget),this._renderPass(e,this.blurMaterial,this.blurRenderTarget),this.output){case n.OUTPUT.SSAO:this.copyMaterial.uniforms.tDiffuse.value=this.ssaoRenderTarget.texture,this.copyMaterial.blending=0,this._renderPass(e,this.copyMaterial,this.renderToScreen?null:r);break;case n.OUTPUT.Blur:this.copyMaterial.uniforms.tDiffuse.value=this.blurRenderTarget.texture,this.copyMaterial.blending=0,this._renderPass(e,this.copyMaterial,this.renderToScreen?null:r);break;case n.OUTPUT.Depth:this._renderPass(e,this.depthRenderMaterial,this.renderToScreen?null:r);break;case n.OUTPUT.Normal:this.copyMaterial.uniforms.tDiffuse.value=this.normalRenderTarget.texture,this.copyMaterial.blending=0,this._renderPass(e,this.copyMaterial,this.renderToScreen?null:r);break;case n.OUTPUT.Default:this.copyMaterial.uniforms.tDiffuse.value=this.blurRenderTarget.texture,this.copyMaterial.blending=5,this._renderPass(e,this.copyMaterial,this.renderToScreen?null:r);break;default:console.warn(`THREE.SSAOPass: Unknown output type.`)}}setSize(e,t){this.width=e,this.height=t,this.ssaoRenderTarget.setSize(e,t),this.normalRenderTarget.setSize(e,t),this.blurRenderTarget.setSize(e,t),this.ssaoMaterial.uniforms.resolution.value.set(e,t),this.ssaoMaterial.uniforms.cameraProjectionMatrix.value.copy(this.camera.projectionMatrix),this.ssaoMaterial.uniforms.cameraInverseProjectionMatrix.value.copy(this.camera.projectionMatrixInverse),this.blurMaterial.uniforms.resolution.value.set(e,t)}_renderPass(e,t,n,r,i){e.getClearColor(this._originalClearColor);let a=e.getClearAlpha(),o=e.autoClear;e.setRenderTarget(n),e.autoClear=!1,r!=null&&(e.setClearColor(r),e.setClearAlpha(i||0),e.clear()),this._fsQuad.material=t,this._fsQuad.render(e),e.autoClear=o,e.setClearColor(this._originalClearColor),e.setClearAlpha(a)}_renderOverride(e,t,n,r,i){e.getClearColor(this._originalClearColor);let a=e.getClearAlpha(),o=e.autoClear;e.setRenderTarget(n),e.autoClear=!1,r=t.clearColor||r,i=t.clearAlpha||i,r!=null&&(e.setClearColor(r),e.setClearAlpha(i||0),e.clear()),this.scene.overrideMaterial=t,e.render(this.scene,this.camera),this.scene.overrideMaterial=null,e.autoClear=o,e.setClearColor(this._originalClearColor),e.setClearAlpha(a)}_generateSampleKernel(e){let t=this.kernel;for(let n=0;n<e;n++){let r=new H;r.x=Math.random()*2-1,r.y=Math.random()*2-1,r.z=Math.random(),r.normalize();let i=n/e;i=O.lerp(.1,1,i*i),r.multiplyScalar(i),t.push(r)}}_generateRandomKernelRotations(){let t=new we,n=new Float32Array(16);for(let e=0;e<16;e++){let r=Math.random()*2-1,i=Math.random()*2-1;n[e]=t.noise3d(r,i,0)}this.noiseTexture=new e(n,4,4,u,l),this.noiseTexture.wrapS=_,this.noiseTexture.wrapT=_,this.noiseTexture.needsUpdate=!0}_overrideVisibility(){let e=this.scene,t=this._visibilityCache;e.traverse(function(e){(e.isPoints||e.isLine||e.isLine2)&&e.visible&&(e.visible=!1,t.push(e))})}_restoreVisibility(){let e=this._visibilityCache;for(let t=0;t<e.length;t++)e[t].visible=!0;e.length=0}};De.OUTPUT={Default:0,SSAO:1,Blur:2,Depth:3,Normal:4};var K={name:`BokehShader`,defines:{DEPTH_PACKING:1,PERSPECTIVE_CAMERA:1},uniforms:{tColor:{value:null},tDepth:{value:null},focus:{value:1},aspect:{value:1},aperture:{value:.025},maxblur:{value:.01},nearClip:{value:1},farClip:{value:1e3}},vertexShader:`

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

		}`},Oe=class extends ue{constructor(e,n,i){super(),this.scene=e,this.camera=n;let a=i.focus===void 0?1:i.focus,o=i.aperture===void 0?.025:i.aperture,c=i.maxblur===void 0?1:i.maxblur;this._renderTargetDepth=new T(1,1,{minFilter:fe,magFilter:fe,type:t}),this._renderTargetDepth.texture.name=`BokehPass.depth`,this._materialDepth=new M,this._materialDepth.depthPacking=f,this._materialDepth.blending=0;let l=h.clone(K.uniforms);l.tDepth.value=this._renderTargetDepth.texture,l.focus.value=a,l.aspect.value=n.aspect,l.aperture.value=o,l.maxblur.value=c,l.nearClip.value=n.near,l.farClip.value=n.far,this.materialBokeh=new s({defines:Object.assign({},K.defines),uniforms:l,vertexShader:K.vertexShader,fragmentShader:K.fragmentShader}),this.uniforms=l,this._fsQuad=new R(this.materialBokeh),this._oldClearColor=new r}render(e,t,n){this.scene.overrideMaterial=this._materialDepth,e.getClearColor(this._oldClearColor);let r=e.getClearAlpha(),i=e.autoClear;e.autoClear=!1,e.setClearColor(16777215),e.setClearAlpha(1),e.setRenderTarget(this._renderTargetDepth),e.clear(),e.render(this.scene,this.camera),this.uniforms.tColor.value=n.texture,this.uniforms.nearClip.value=this.camera.near,this.uniforms.farClip.value=this.camera.far,this.renderToScreen?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(t),e.clear(),this._fsQuad.render(e)),this.scene.overrideMaterial=null,e.setClearColor(this._oldClearColor),e.setClearAlpha(r),e.autoClear=i}setSize(e,t){this.materialBokeh.uniforms.aspect.value=e/t,this._renderTargetDepth.setSize(e,t)}dispose(){this._renderTargetDepth.dispose(),this._materialDepth.dispose(),this.materialBokeh.dispose(),this._fsQuad.dispose()}},ke={uniforms:{tDiffuse:{value:null},amount:{value:.01}},vertexShader:`
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
  `},Ae={uniforms:{tDiffuse:{value:null},uTime:{value:0},uGrainAmp:{value:.04},uVignetteAmp:{value:1}},vertexShader:`
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,fragmentShader:`
    uniform sampler2D tDiffuse;
    uniform float uTime;
    uniform float uGrainAmp;
    uniform float uVignetteAmp;
    varying vec2 vUv;

    float filmGrain(vec2 uv, float t) {
      vec2 seed = uv * vec2(t * 127.1, t * 311.7);
      return fract(sin(dot(seed, vec2(12.9898, 78.233))) * 43758.5453) - 0.5;
    }

    void main() {
      vec4 color = texture2D(tDiffuse, vUv);

      // Film grain — skipped on mobile (uGrainAmp = 0)
      color.rgb += filmGrain(vUv, uTime) * uGrainAmp;

      // Vignette — smooth darkening toward edges; uVignetteAmp = 0 on
      // mobile so the screen edges stay flat + fully lit
      vec2  vig      = (vUv - 0.5) * 2.0;
      float vigDist  = length(vig);
      float vignette = 1.0 - smoothstep(0.3, 1.2, vigDist);
      color.rgb     *= mix(1.0, vignette, uVignetteAmp);

      gl_FragColor = color;
    }
  `};function je(e,t,n,r=!1,i=null){let a=window.innerWidth,o=window.innerHeight,s=new ce(e);s.addPass(new ie(t,n));let c=null,l=null;r||(c=new De(t,n,a,o),c.kernelRadius=8,c.minDistance=.005,c.maxDistance=.1,s.addPass(c));let u=new ve(r?new U(a/2,o/2):new U(a,o),r?.18:.25,r?.35:.4,r?.92:.9);s.addPass(u),r||(l=new Oe(t,n,{focus:4,aperture:1e-4,maxblur:.005}),s.addPass(l)),i&&s.addPass(i);let d=null;r||(d=new D(ke),s.addPass(d));let f=new D(Ae);return r&&(f.uniforms.uGrainAmp.value=0,f.uniforms.uVignetteAmp.value=0),f.renderToScreen=!0,s.addPass(f),{composer:s,bloom:u,chroma:d,ssao:c,bokeh:l,grainVignette:f,setSize(e,t){s.setSize(e,t),u&&u.setSize(e,t),c&&c.setSize(e,t)}}}var Me=new be;Me.setDecoderPath(`https://www.gstatic.com/draco/versioned/decoders/1.5.6/`);var Ne=new ye;Ne.setDRACOLoader(Me);function Pe(e){Ne=new ye(e),Ne.setDRACOLoader(Me)}var Fe=new Map;function Ie(e,{onProgress:t}={}){return Fe.has(e)?Promise.resolve(Fe.get(e).clone(!0)):new Promise((n,r)=>{Ne.load(e,t=>{let r=t.scene;r.traverse(e=>{e.isMesh&&(e.castShadow=!0,e.receiveShadow=!0)});let i=new de().setFromObject(r),a=new H;i.getCenter(a),console.log(`[loader] ✓ ${e} | bbox center:`,a.toArray().map(e=>e.toFixed(2))),Fe.set(e,r),n(r.clone(!0))},t,t=>{console.error(`[loader] ✗ ${e}`,t),r(t)})})}var Le=`
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`,Re=`
uniform sampler2D textureA;
uniform vec2 mouse;
uniform vec2 resolution;
uniform float time;
uniform int frame;
varying vec2 vUv;

const float delta = 1.35;

void main() {
  vec2 uv = vUv;
  if (frame == 0) { gl_FragColor = vec4(0.0); return; }

  vec4 data = texture2D(textureA, uv);
  float pressure = data.x;
  float pVel = data.y;

  vec2 texelSize = 1.0 / resolution;
  float p_right = texture2D(textureA, uv + vec2(texelSize.x, 0.0)).x;
  float p_left  = texture2D(textureA, uv + vec2(-texelSize.x, 0.0)).x;
  float p_up    = texture2D(textureA, uv + vec2(0.0, texelSize.y)).x;
  float p_down  = texture2D(textureA, uv + vec2(0.0, -texelSize.y)).x;

  if (uv.x <= texelSize.x)         p_left  = p_right;
  if (uv.x >= 1.0 - texelSize.x)   p_right = p_left;
  if (uv.y <= texelSize.y)         p_down  = p_up;
  if (uv.y >= 1.0 - texelSize.y)   p_up    = p_down;

  pVel += delta * (-2.0 * pressure + p_right + p_left) / 4.0;
  pVel += delta * (-2.0 * pressure + p_up    + p_down) / 4.0;
  pressure += delta * pVel;
  pVel -= 0.006 * delta * pressure;
  pVel *= 1.0 - 0.003 * delta;
  pressure *= 0.9985;

  // Five slow-wandering sources — the constant rainfall that keeps the
  // pond alive without any input. Wider radius + higher amplitude than
  // before so the resulting waves are strong enough to visibly refract
  // the scene beneath (was 0.10@0.012 which read as nothing).
  for (int i = 0; i < 5; i++) {
    float fi = float(i);
    vec2 src = vec2(
      0.5 + 0.44 * sin(time * 0.13 + fi * 2.093),
      0.5 + 0.42 * cos(time * 0.10 + fi * 1.731)
    );
    float d = distance(uv, src);
    if (d < 0.022) {
      pressure += 0.55 * (1.0 - d / 0.022);
    }
  }

  vec2 mouseUV = mouse / resolution;
  if (mouse.x > 0.0) {
    float dist = distance(uv, mouseUV);
    if (dist <= 0.050) {
      pressure += 1.80 * (1.0 - dist / 0.050);
    }
  }

  gl_FragColor = vec4(
    pressure, pVel,
    (p_right - p_left) / 2.0,
    (p_up    - p_down) / 2.0
  );
}
`,ze={uniforms:{tDiffuse:{value:null},uWaveTex:{value:null},uTime:{value:0},uIntensity:{value:1},uDispAmount:{value:.045},uCausticAmp:{value:.38},uTintAmount:{value:.5},uAspect:{value:1}},vertexShader:`
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,fragmentShader:`
    uniform sampler2D tDiffuse;
    uniform sampler2D uWaveTex;
    uniform float uTime;
    uniform float uIntensity;
    uniform float uDispAmount;
    uniform float uCausticAmp;
    uniform float uTintAmount;
    uniform float uAspect;
    varying vec2 vUv;

    // Layered sinusoidal caustics — cheap, organic, no texture needed.
    // Three bands at coprime-ish frequencies interfere into slow-drifting
    // bright filaments. smoothstep hardens the highs so we get filament
    // lines rather than a soft cloud.
    float caustics(vec2 uv, float t) {
      vec2 p = uv * 5.2;
      float s = 0.0;
      s += sin(p.x * 1.30 + t * 0.42 + p.y * 0.70);
      s += sin(p.x * 0.72 - t * 0.29 + p.y * 1.12);
      s += sin(p.y * 1.05 + t * 0.36 - p.x * 0.88);
      s /= 3.0;
      return smoothstep(0.42, 0.94, s * 0.5 + 0.5);
    }

    void main() {
      vec4 wave = texture2D(uWaveTex, vUv);

      // Refract the scene lookup by the wave-gradient. Aspect-correct so
      // horizontal & vertical warp read equally.
      vec2 disp = wave.zw * uDispAmount * uIntensity;
      disp.x /= uAspect;
      vec4 col = texture2D(tDiffuse, vUv + disp);

      // Drifting caustics, offset slightly by wave-gradient so filaments
      // bend where the surface ripples — exactly what happens underwater.
      vec2 causticUv = vUv + wave.zw * 0.4;
      float c = caustics(causticUv, uTime);

      // Add caustics as additive brightening. A base amount is present
      // everywhere (so even the dark corridor reads as submerged), plus
      // a stronger contribution on already-lit regions where filaments
      // would naturally focus.
      float lightness = dot(col.rgb, vec3(0.299, 0.587, 0.114));
      float causticGate = smoothstep(0.0, 0.45, lightness);
      float causticStrength = mix(0.35, 1.0, causticGate);
      col.rgb += vec3(0.55, 0.85, 1.00) * c * uCausticAmp * causticStrength * uIntensity;

      // Cool aquatic tint — desaturates warms toward teal-blue. Kept
      // subtle so the museum's own palette bleeds through.
      vec3 tinted = col.rgb * vec3(0.78, 0.94, 1.10);
      col.rgb = mix(col.rgb, tinted, uTintAmount * uIntensity);

      // Vertical light attenuation — imperceptibly darker toward the
      // bottom of the frame (further from the surface above).
      float depth = smoothstep(-0.2, 1.15, vUv.y);
      col.rgb *= mix(1.0, mix(0.88, 1.03, depth), uIntensity);

      gl_FragColor = col;
    }
  `};function Be(e,{isMobile:r=!1}={}){let i=Math.min(window.devicePixelRatio,2),a=r?.4:.6,c=()=>Math.max(64,Math.floor(window.innerWidth*i*a)),l=()=>Math.max(64,Math.floor(window.innerHeight*i*a)),u={format:m,type:t,minFilter:A,magFilter:A,stencilBuffer:!1,depthBuffer:!1},d=new T(c(),l(),u),f=new T(c(),l(),u),p=new x,h=new n(-1,1,1,-1,0,1),g=new U,_=0,v=new s({uniforms:{textureA:{value:null},mouse:{value:g},resolution:{value:new U(c(),l())},time:{value:0},frame:{value:0}},vertexShader:Le,fragmentShader:Re}),y=new o(2,2),b=new W(y,v);p.add(b);let S=new D(ze);S.uniforms.uWaveTex.value=d.texture,S.uniforms.uAspect.value=window.innerWidth/window.innerHeight,r&&(S.uniforms.uDispAmount.value=.035,S.uniforms.uCausticAmp.value=.28,S.uniforms.uTintAmount.value=.42);let C=()=>{let t=performance.now()/1e3;v.uniforms.textureA.value=d.texture,v.uniforms.frame.value=_++,v.uniforms.time.value=t;let n=e.getRenderTarget();e.setRenderTarget(f),e.render(p,h),e.setRenderTarget(n);let r=d;d=f,f=r,S.uniforms.uWaveTex.value=d.texture,S.uniforms.uTime.value=t},w=(e,t)=>{if(e<0||t<0){g.set(0,0);return}g.x=e*c(),g.y=t*l()},E=e=>{S.uniforms.uIntensity.value=Math.max(0,Math.min(1,e))},O=()=>{d.setSize(c(),l()),f.setSize(c(),l()),v.uniforms.resolution.value.set(c(),l()),S.uniforms.uAspect.value=window.innerWidth/window.innerHeight};return window.addEventListener(`resize`,O),{pass:S,update:C,setMouseNorm:w,setIntensity:E,dispose:()=>{window.removeEventListener(`resize`,O),y.dispose(),v.dispose(),d.dispose(),f.dispose()}}}var q=new C,Ve=new H,He=new U,Ue=new U,We=new U,Ge=class{constructor(e){this.geometry=e.geometry,this.randomFunction=Math.random,this.indexAttribute=this.geometry.index,this.positionAttribute=this.geometry.getAttribute(`position`),this.normalAttribute=this.geometry.getAttribute(`normal`),this.colorAttribute=this.geometry.getAttribute(`color`),this.uvAttribute=this.geometry.getAttribute(`uv`),this.weightAttribute=null,this.distribution=null}setWeightAttribute(e){return this.weightAttribute=e?this.geometry.getAttribute(e):null,this}build(){let e=this.indexAttribute,t=this.positionAttribute,n=this.weightAttribute,r=e?e.count/3:t.count/3,i=new Float32Array(r);for(let a=0;a<r;a++){let r=1,o=3*a,s=3*a+1,c=3*a+2;e&&(o=e.getX(o),s=e.getX(s),c=e.getX(c)),n&&(r=n.getX(o)+n.getX(s)+n.getX(c)),q.a.fromBufferAttribute(t,o),q.b.fromBufferAttribute(t,s),q.c.fromBufferAttribute(t,c),r*=q.getArea(),i[a]=r}let a=new Float32Array(r),o=0;for(let e=0;e<r;e++)o+=i[e],a[e]=o;return this.distribution=a,this}setRandomGenerator(e){return this.randomFunction=e,this}sample(e,t,n,r){let i=this._sampleFaceIndex();return this._sampleFace(i,e,t,n,r)}_sampleFaceIndex(){let e=this.distribution[this.distribution.length-1];return this._binarySearch(this.randomFunction()*e)}_binarySearch(e){let t=this.distribution,n=0,r=t.length-1,i=-1;for(;n<=r;){let a=Math.ceil((n+r)/2);if(a===0||t[a-1]<=e&&t[a]>e){i=a;break}else e<t[a]?r=a-1:n=a+1}return i}_sampleFace(e,t,n,r,i){let a=this.randomFunction(),o=this.randomFunction();a+o>1&&(a=1-a,o=1-o);let s=this.indexAttribute,c=e*3,l=e*3+1,u=e*3+2;return s&&(c=s.getX(c),l=s.getX(l),u=s.getX(u)),q.a.fromBufferAttribute(this.positionAttribute,c),q.b.fromBufferAttribute(this.positionAttribute,l),q.c.fromBufferAttribute(this.positionAttribute,u),t.set(0,0,0).addScaledVector(q.a,a).addScaledVector(q.b,o).addScaledVector(q.c,1-(a+o)),n!==void 0&&(this.normalAttribute===void 0?q.getNormal(n):(q.a.fromBufferAttribute(this.normalAttribute,c),q.b.fromBufferAttribute(this.normalAttribute,l),q.c.fromBufferAttribute(this.normalAttribute,u),n.set(0,0,0).addScaledVector(q.a,a).addScaledVector(q.b,o).addScaledVector(q.c,1-(a+o)).normalize())),r!==void 0&&this.colorAttribute!==void 0&&(q.a.fromBufferAttribute(this.colorAttribute,c),q.b.fromBufferAttribute(this.colorAttribute,l),q.c.fromBufferAttribute(this.colorAttribute,u),Ve.set(0,0,0).addScaledVector(q.a,a).addScaledVector(q.b,o).addScaledVector(q.c,1-(a+o)),r.r=Ve.x,r.g=Ve.y,r.b=Ve.z),i!==void 0&&this.uvAttribute!==void 0&&(He.fromBufferAttribute(this.uvAttribute,c),Ue.fromBufferAttribute(this.uvAttribute,l),We.fromBufferAttribute(this.uvAttribute,u),i.set(0,0).addScaledVector(He,a).addScaledVector(Ue,o).addScaledVector(We,1-(a+o))),this}},Ke=.51,qe=.53,Je=.56,Ye=.55,Xe=.57,Ze=.58,Qe=.6,$e=.62,et=.65,tt=3.5,nt=8,rt=.04,it=32,at=18,ot=22,st=12,ct=7,lt=new r(2109520),ut=.55;function J(e){let t=Math.max(0,Math.min(1,e));return t*t*(3-2*t)}function dt(e,t,n,r){let i=r?ot:it,a=r?st:at,o=i*a,s=r?ct:nt,c=e.getSize(new U),l=new T(Math.floor(c.x*(r?.7:1)),Math.floor(c.y*(r?.7:1)),{minFilter:A,magFilter:A}),u=1/i,d=1/a,f=new Float32Array(o*4);for(let e=0;e<a;e++)for(let t=0;t<i;t++){let n=e*i+t;f[n*4+0]=t*u,f[n*4+1]=1-(e+1)*d,f[n*4+2]=u,f[n*4+3]=d}let p=new y(f,4),m=new ge(1,1,rt);m.setAttribute(`instanceUV`,p);let h={uOpacity:{value:1},uTintColor:{value:lt.clone()},uTintAmount:{value:0}},g=new ee({map:l.texture,transparent:!0,depthWrite:!1,side:0});g.onBeforeCompile=e=>{e.uniforms.uOpacity=h.uOpacity,e.uniforms.uTintColor=h.uTintColor,e.uniforms.uTintAmount=h.uTintAmount,e.vertexShader=e.vertexShader.replace(`void main() {`,`attribute vec4 instanceUV;
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
`},g.customProgramCacheKey=()=>`shatter_tile`;let _=new S(m,g,o);_.frustumCulled=!1,_.visible=!1,t.add(_);let b=Array(o),x=Array(o),C=Array(o),w=Array(o).fill(null).map(()=>new H),E=new Float32Array(o*3),D=1,O=1,k=!1,te=!0,j=new v,M=new H,N=[],P=[],F=[],I=[];function ne(e,t){let n=new Set;e.traverse(e=>{if(!e.isMesh)return;let r=e.material;r&&!n.has(r)&&(n.add(r),t.push(r))})}function L(e,t){for(let n of e)n.opacity=t}function R(){for(let e of P)e.opacity=1;for(let e of N)e.opacity=1;for(let e of F)e.visible=!0;for(let e of I)e.visible=!0}function z(){for(let e of F)e.visible=!1;for(let e of I)e.visible=!1}function B(){n.updateMatrixWorld();let e=n.fov*Math.PI/180,t=Math.tan(e/2)*tt,r=t*n.aspect;D=r*2/i,O=t*2/a;let o=new H,s=new H,c=new H;n.getWorldDirection(o),s.setFromMatrixColumn(n.matrixWorld,0),c.setFromMatrixColumn(n.matrixWorld,1);let l=n.position.clone().addScaledVector(o,tt);for(let e=0;e<a;e++)for(let n=0;n<i;n++){let o=e*i+n,u=(n+.5)/i*2-1,d=1-(e+.5)/a*2;b[o]=l.clone().addScaledVector(s,u*r).addScaledVector(c,d*t)}}function V(){let e=new H;for(let t=0;t<o;t++)e.set(Math.random()-.5,Math.random()-.5,Math.random()-.5).normalize().multiplyScalar(s*(.4+Math.random()*.6)),w[t].copy(e),E[t*3]=(Math.random()-.5)*Math.PI*2,E[t*3+1]=(Math.random()-.5)*Math.PI*2,E[t*3+2]=(Math.random()-.5)*Math.PI*2}function re(){for(let e=0;e<o;e++)x[e]=b[e].clone().add(w[e])}function ie(e){e.updateMatrixWorld(!0);let t=[];if(e.traverse(e=>{e.isMesh&&e.geometry&&e.geometry.attributes.position&&t.push(e)}),!t.length){console.warn(`[shatter] setSurface: no sampelable meshes found`);return}ne(e,N);for(let e of N)e.transparent=!0,e.opacity=1;let n=new H,r=new H,i=[],a=Math.ceil(o/t.length);for(let e of t){if(i.length>=o)break;let t=new Ge(e).build(),s=Math.min(a,o-i.length);for(let a=0;a<s;a++)t.sample(n,r),i.push(n.clone().applyMatrix4(e.matrixWorld))}for(;i.length<o;)i.push(i[Math.floor(Math.random()*i.length)].clone());for(let e=i.length-1;e>0;e--){let t=Math.floor(Math.random()*(e+1));[i[e],i[t]]=[i[t],i[e]]}for(let e=0;e<o;e++)C[e]=i[e];k=!0,console.log(`[shatter] surface sampled — ${o} pts across ${t.length} mesh(es)`)}function ae(e,t=[]){ne(e,P);for(let e of P)e.transparent=!0,e.opacity=1;for(let e of t)F.push(e);console.log(`[shatter] hero_canvas primed — ${P.length} material(s), ${t.length} extras`)}function oe(e=[]){for(let t of e)I.push(t)}function se(){_.visible=!1,L(P,1),L(N,1);for(let e of F)e.visible=!0;for(let e of I)e.visible=!0;e.setRenderTarget(l),e.render(t,n),e.setRenderTarget(null),_.visible=!0}function ce(){B(),V(),re(),e.setRenderTarget(l),e.render(t,n),e.setRenderTarget(null),h.uOpacity.value=1,h.uTintAmount.value=0,M.set(D,O,rt),j.rotation.set(0,0,0);for(let e=0;e<o;e++)j.position.copy(b[e]),j.scale.copy(M),j.updateMatrix(),_.setMatrixAt(e,j.matrix);_.instanceMatrix.needsUpdate=!0,_.visible=!0}function le(e){let t={bgDark:0,textOpacity:0};if(e<.51||e>.65)return te||=(_.visible=!1,R(),h.uOpacity.value=1,h.uTintAmount.value=0,!0),t;te=!1,_.visible||=!0;let n=0,r=0,i=1,a,s,c=0,l=0;if(e<qe){B(),re(),se(),n=0,r=0,a=b,s=x,c=0;let t=J((e-Ke)/(qe-Ke)),i=1-t;L(P,i),L(N,i);let o=t>.5;for(let e of F)e.visible=!o;for(let e of I)e.visible=!o;h.uOpacity.value=1,h.uTintAmount.value=0}else if(e<.56){let t=J((e-qe)/(Je-qe));n=t,r=t,a=b,s=x,c=t,L(P,0),L(N,0),z(),h.uOpacity.value=1,h.uTintAmount.value=0}else if(e<.6)n=1,r=1,a=b,s=x,c=1,L(P,0),L(N,0),z(),h.uOpacity.value=1,h.uTintAmount.value=0,l=e<.57?J((e-Ye)/(Xe-Ye)):e<.58?1:1-J((e-Ze)/(Qe-Ze));else if(!k||e<.62)if(k){let t=J((e-Qe)/($e-Qe));n=t,r=1-t,a=x,s=C,c=1-t,L(P,0),L(N,0),z(),h.uOpacity.value=1,h.uTintAmount.value=t*ut}else{let t=(e-Qe)/(et-Qe);n=J(1-t),r=n,a=b,s=x,c=1-J(t)}else{let t=J((e-$e)/(et-$e));n=1,r=0,a=C,s=C,i=1-t,c=0,L(P,0),L(N,t);for(let e of I)e.visible=!0;for(let e of F)e.visible=!1;h.uOpacity.value=1-t,h.uTintAmount.value=ut*(1-t)}M.set(D*i,O*i,rt*i);for(let e=0;e<o;e++)j.position.lerpVectors(a[e],s[e],n),j.rotation.set(E[e*3]*r,E[e*3+1]*r,E[e*3+2]*r),j.scale.copy(M),j.updateMatrix(),_.setMatrixAt(e,j.matrix);return _.instanceMatrix.needsUpdate=!0,{bgDark:c,textOpacity:l}}function ue(){t.remove(_),l.dispose(),m.dispose(),g.dispose(),R()}return{capture:ce,update:le,setSurface:ie,setHeroCanvas:ae,setVoidExtras:oe,dispose:ue,mesh:_}}var Y=window.innerWidth<768||`ontouchstart`in window,ft={"hand.glb":`Every brand begins like this.`,"monument.glb":`Something is always missing at the beginning.`,"hero_canvas.glb":`Between sketch and masterpiece, there's patience.`,"void_figure.glb":`Sometimes what we leave out is what speaks.`,"arm_crystal.glb":`That's how the moment forms.`};function pt(e){return ft[e]??``}var X=[{file:`/models/hand.glb`,z:0,scale:3},{file:`/models/monument.glb`,z:-12,scale:.456},{file:`/models/hero_canvas.glb`,z:-24,scale:3},{file:`/models/void_figure.glb`,z:-36,orbitN:Y?36:32},{file:`/models/arm_crystal.glb`,z:-48}].map(e=>({...e,caption:pt(e.file.split(`/`).pop())})),mt=document.getElementById(`scene-canvas`),ht=document.getElementById(`caption`),gt=document.getElementById(`gathering-text`),_t=document.querySelector(`.wordmark`),{scene:Z,renderer:vt,camera:Q,spotLight:yt,armSpot:bt,ambient:xt,hemi:St,wallUniforms:Ct,onResize:wt}=xe(mt,Y),Tt=75,Et=55,Dt=900,Ot=-48,kt=30,At=Be(vt,{isMobile:Y}),jt=je(vt,Z,Q,Y,At.pass),Mt=0,Nt=Se(Z,Y),Pt=Y?null:dt(vt,Z,Q,Y),Ft=!1,It=1.8,Lt=Y?5:4,Rt=Y?16:32;function zt(){let e=[],t=It,n=Lt;e.push(new H(0,t,10)),e.push(new H(0,t,7)),X.forEach((r,i)=>{let a=r.z,o=r.orbitN??Rt;for(let r=0;r<=o;r++){let i=r/o*Math.PI*2;e.push(new H(Math.sin(i)*n,t,a+Math.cos(i)*n))}if(i<X.length-1){let r=X[i+1].z;e.push(new H(n*1.5,t,a)),e.push(new H(n*.8,t,a-n-1)),e.push(new H(0,t,r+n+1))}});let r=X[X.length-1].z;return e.push(new H(n*1.2,t,r)),e.push(new H(0,t,r-n-2)),e.push(new H(0,t,r-20)),e.push(new H(0,t,r-28)),new pe(e,!1,`catmullrom`,.5)}var Bt=zt(),Vt=0,Ht=0,Ut=new H,Wt=new H(0,1.5,0),Gt=new H(0,1.5,0),Kt=new H(0,6,0),qt=new H(0,.5,0),Jt=null;function Yt(e){if(e!==Jt){if(Jt=e,j.killTweensOf(ht),!e){j.to(ht,{opacity:0,duration:.3});return}j.to(ht,{opacity:0,duration:.25,ease:`power2.in`,onComplete(){ht.textContent=e,j.to(ht,{opacity:1,duration:.5,ease:`power2.out`})}})}}function Xt(e){let t=1/0,n=null;for(let r of X){let i=Math.hypot(e.x,e.z-r.z);i<t&&(t=i,n=r)}return{def:n,dist:t}}var Zt=new U(-9,-9),Qt=new a;mt.addEventListener(`pointermove`,e=>{Zt.x=e.clientX/window.innerWidth*2-1,Zt.y=-(e.clientY/window.innerHeight)*2+1}),mt.addEventListener(`pointerleave`,()=>Zt.set(-9,-9));var $t=null,en=null,tn=null,nn=null,rn=600;function an(){$t=new he,en=new Float32Array(rn*3),tn=new Float32Array(rn*3);for(let e=0;e<rn;e++){let t=(Math.random()-.5)*16,n=Math.random()*7,r=5-Math.random()*65;en[e*3]=tn[e*3]=t,en[e*3+1]=tn[e*3+1]=n,en[e*3+2]=tn[e*3+2]=r}$t.setAttribute(`position`,new E(en,3));let e=new L({size:.015,color:8425664,transparent:!0,opacity:.35,depthWrite:!1});nn=new p($t,e),Z.add(nn)}function on(e){if(!$t)return;let t=$t.attributes.position;for(let n=0;n<rn;n++){let r=n*3;t.array[r+1]+=.001,t.array[r+0]=tn[r]+Math.sin(e*.3+n*.17)*.08,t.array[r+2]=tn[r+2]+Math.cos(e*.2+n*.13)*.05,t.array[r+1]>7&&(t.array[r+1]=0,tn[r+1]=0)}t.needsUpdate=!0}var sn=[155,255,390,580,1190],cn=new N({color:855311,roughness:.9,metalness:.1});async function ln(e,t){try{let n=await Ie(e.file);e.scale&&n.scale.setScalar(e.scale),n.updateMatrixWorld(!0);let r=new de().setFromObject(n),a=isFinite(r.min.x)?(r.min.x+r.max.x)/2:0,o=isFinite(r.min.z)?(r.min.z+r.max.z)/2:0,s=isFinite(r.min.y)?-r.min.y+.3:.3;n.position.set(-a,s,e.z-o),n.traverse(e=>{e.isMesh&&(e.castShadow=e.receiveShadow=!Y)}),Z.add(n);let c=new W(new ne(.4,.5,.3,32),cn);c.position.set(0,.15,e.z),c.castShadow=c.receiveShadow=!0,Z.add(c);let l=Ce();l.position.set(0,.02,e.z),Z.add(l),e.file.includes(`void_figure`)&&(Pt?.setSurface(n),Pt?.setVoidExtras([c,l])),e.file.includes(`hero_canvas`)&&Pt?.setHeroCanvas(n,[c,l]);let u=new i(13691135,sn[t]??500,16,2);u.position.set(0,6.5,e.z),Z.add(u),console.log(`[HOLM] ✓ ${e.file} @ z=${e.z}`)}catch(t){console.error(`[HOLM] ✗ ${e.file}`,t)}}var $=!1,un=document.getElementById(`projection-overlay`);function dn(){Nt.visible=!0,un.classList.add(`active`),j.to(un,{opacity:1,duration:1.2,ease:`power2.out`});let e=un.querySelectorAll(`.proj-line`);j.fromTo(e,{opacity:0,y:12},{opacity:1,y:0,duration:1,stagger:.4,delay:.4,ease:`power2.out`}),j.fromTo(un.querySelector(`.proj-cta`),{opacity:0,y:8},{opacity:1,y:0,duration:1,delay:2.6,ease:`power2.out`})}function fn(){j.to(un,{opacity:0,duration:.5,onComplete:()=>{un.classList.remove(`active`),Nt.visible=!1,j.set(`.proj-line, .proj-cta`,{opacity:0,y:0})}})}var pn=new ae(Y?{smoothTouch:!1,touchMultiplier:.65}:{duration:4,smoothWheel:!0,wheelMultiplier:.28,touchMultiplier:1.2,smoothTouch:!1});j.ticker.lagSmoothing(0),se(document);var mn=(()=>{try{return sessionStorage.getItem(`holm:transition`)===`1`}catch{return!1}})();le(),new F({lenis:pn}).mount(),se(document);var hn=document.getElementById(`book-call`);hn&&(hn.style.display=`none`),pn.on(`scroll`,({scroll:e,limit:t})=>{Vt=t>0?e/t:0});function gn(e=0){requestAnimationFrame(gn),pn.raf(e);let t=Qt.getElapsedTime();Y?(Ht+=(Vt-Ht)*.18,Ut.copy(Bt.getPoint(Ht)),Q.position.copy(Ut)):(Ut.copy(Bt.getPoint(Vt)),Q.position.lerp(Ut,.07));let{def:n,dist:r}=Xt(Q.position),i=n&&r<Lt+1.5,a=Q.position.z<-56,o=Q.position.z<-68;if(a)Wt.set(0,4,-89.5),Kt.set(0,7,Q.position.z),qt.set(0,3.5,-89.5),Yt(``),Nt.material.uniforms.uTime.value=t,o&&!$&&($=!0,dn()),!o&&$&&($=!1,fn());else if(i)Wt.set(0,1.5,n.z),Kt.set(0,6,n.z),qt.set(0,.5,n.z),Yt(n.caption),$&&($=!1,fn());else{let e=X.find(e=>e.z<Q.position.z-1);Wt.set(0,1.5,e?e.z:Q.position.z-10),Kt.set(0,6,Q.position.z-3),qt.set(0,.5,Q.position.z-8),r>Lt*3&&Yt(``),$&&($=!1,fn()),Nt.visible=!1}Gt.lerp(Wt,.07),Q.lookAt(Gt),yt.position.lerp(Kt,.05),yt.target.position.lerp(qt,.05),yt.target.updateMatrixWorld();let s=Math.hypot(Q.position.x,Q.position.z-Ot);bt.intensity+=((s<Lt+3?Dt:0)-bt.intensity)*.1,jt.bokeh&&(jt.bokeh.uniforms.focus.value=r),jt.grainVignette&&(jt.grainVignette.uniforms.uTime.value=t),Ct.uTime.value=t,At.setMouseNorm((Zt.x+1)*.5,(Zt.y+1)*.5),At.update(),Y||on(t);let c=0,l=0;if(Pt){let e=Vt;e>=.51&&e<=.65&&!Ft&&(Ft=!0,Pt.capture()),e<.46&&(Ft=!1);let t=Pt.update(e);c=t.bgDark,l=t.textOpacity}let u=(1-c*.92)*Mt;xt.intensity=Tt*u,St.intensity=Et*u,yt.intensity=kt*Math.max(u,.12*Mt),gt&&(gt.style.opacity=l),l>.01&&Yt(``),jt.composer.render()}window.addEventListener(`resize`,()=>{wt(),jt.setSize(window.innerWidth,window.innerHeight)});async function _n(){let e=Bt.getPoint(0);Q.position.copy(e),Q.position.z+=3,Gt.set(0,1.5,X[0].z),Q.lookAt(Gt);let t=!1,n=()=>{if(t)return;t=!0,requestAnimationFrame(gn);let n={v:0};j.to(n,{v:1,duration:4.2,ease:`power2.out`,onUpdate:()=>{Mt=n.v}}),j.to(Q.position,{z:e.z,duration:3.8,ease:`power2.out`}),j.to(ht,{opacity:1,duration:1.4,delay:2.4,ease:`power2.out`}),_t&&j.to(_t,{opacity:.85,duration:1.2,delay:1.6,ease:`power2.out`});let r=document.getElementById(`holm-teaser`);if(r){r.setAttribute(`aria-hidden`,`false`),j.fromTo(r,{opacity:0,y:12},{opacity:1,y:0,duration:1.2,delay:1.6,ease:`power2.out`});let e=!1,t=()=>{e||(e=!0,j.to(r,{opacity:0,duration:.8,ease:`power2.out`,onComplete:()=>r.setAttribute(`aria-hidden`,`true`)}),pn.off(`scroll`,n),window.removeEventListener(`wheel`,i),window.removeEventListener(`touchmove`,i),window.removeEventListener(`keydown`,a),clearTimeout(o))},n=({scroll:e})=>{e>4&&t()},i=()=>t(),a=e=>{[`ArrowDown`,`ArrowUp`,`PageDown`,`PageUp`,`End`,`Home`,` `].includes(e.key)&&t()},o=setTimeout(t,7e3);pn.on(`scroll`,n),window.addEventListener(`wheel`,i,{passive:!0}),window.addEventListener(`touchmove`,i,{passive:!0}),window.addEventListener(`keydown`,a)}};if(mn){Pe(new oe);for(let e=0;e<X.length;e++)await ln(X[e],e);Y||an(),n(),re()}else{let e=new w({renderer:vt,onReveal:n});Pe(e.getLoadingManager());let t=e.run();for(let e=0;e<X.length;e++)await ln(X[e],e);Y||an(),e.markComplete(),await t}let r=document.querySelector(`.proj-cta`);r&&(r.addEventListener(`mousemove`,e=>{let t=r.getBoundingClientRect(),n=(e.clientX-t.left-t.width*.5)/t.width,i=(e.clientY-t.top-t.height*.5)/t.height;j.to(r,{x:n*14,y:i*9,duration:.35,ease:`power2.out`})}),r.addEventListener(`mouseleave`,()=>j.to(r,{x:0,y:0,duration:.7,ease:`elastic.out(1, 0.45)`})))}_n();