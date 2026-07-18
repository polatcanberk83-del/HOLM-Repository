import{A as e,B as t,Ct as n,D as r,Dt as i,E as a,Et as o,Ht as s,Jt as c,L as l,Lt as u,M as d,Nt as f,Ot as p,Pt as m,Qt as h,R as g,Rt as _,St as v,U as y,V as b,Vt as x,W as S,Xt as C,Zt as w,a as T,an as E,b as D,c as O,ct as k,d as A,dt as ee,en as j,et as M,f as N,ft as P,gt as F,h as I,i as L,j as te,k as R,kt as z,l as B,lt as V,m as H,mt as ne,n as re,nn as U,o as ie,on as ae,ot as oe,r as se,s as ce,t as le,tn as W,u as ue,ut as G,v as de,vt as fe,w as pe,wt as me,x as he,y as ge,zt as _e}from"./pageTransition-C1rQ-lDC.js";import{t as ve}from"./UnrealBloomPass-DTcgmD1s.js";import{n as ye,t as be}from"./DRACOLoader-Db2F7FGi.js";var xe=`/assets/marble-wall-exp-1-CyJUA1jL.webp`;function Se(e,t=!1){let n=new H({canvas:e,antialias:!t});n.setPixelRatio(Math.min(window.devicePixelRatio,t?1:2)),n.setSize(window.innerWidth,window.innerHeight),n.toneMapping=4,n.toneMappingExposure=6.5,n.shadowMap.enabled=!t,n.shadowMap.type=2,n.outputColorSpace=_e;let a=new x;a.background=new r(394762),a.fog=new g(394762,.022);let s=new me(60,window.innerWidth/window.innerHeight,.1,100);s.position.set(0,1.8,8),s.lookAt(0,1.5,0);let l={uTime:{value:0}},u=new ee({color:1315864,side:1}),d=new G(new ge(20,8,102),u);d.position.set(0,4,-39),d.receiveShadow=!0,a.add(d);let f=new F({color:925272,roughness:.72,metalness:.04}),p=new G(new o(20,102),f);p.rotation.x=-Math.PI/2,p.position.set(0,.001,-39),p.receiveShadow=!0,a.add(p);let m=new ee({color:925272}),h=new G(new o(20,102),m);h.rotation.x=Math.PI/2,h.position.set(0,7.99,-39),a.add(h);let v=new C().load(xe);v.colorSpace=_e,v.wrapS=_,v.wrapT=_,v.repeat.set(12,1),v.anisotropy=8;let y=new F({map:v,color:6645104,roughness:.78,metalness:0}),S=new G(new o(102,8),y);S.rotation.y=Math.PI/2,S.position.set(-9.99,4,-39),S.receiveShadow=!0,a.add(S);let w=new G(new o(102,8),y);w.rotation.y=-Math.PI/2,w.position.set(9.99,4,-39),w.receiveShadow=!0,a.add(w);let T=new I(2109520,75);a.add(T);let E=new b(3162208,526352,55);a.add(E);let D=new c(13162751,30,22,.6,.75,2);D.position.set(0,6,0),D.castShadow=!t,D.shadow.mapSize.set(t?512:1024,t?512:1024),D.shadow.bias=-.002,a.add(D),a.add(D.target);let O=new c(13691135,0,18,.5,.85,2);O.position.set(0,7,-48),O.target.position.set(0,0,-48),O.castShadow=!t,O.shadow.mapSize.set(t?512:1024,t?512:1024),O.shadow.bias=-.002,O.target.updateMatrixWorld(),a.add(O),a.add(O.target);let k=new i(5271728,3e3,30,2);k.position.set(0,5,-83),a.add(k);function A(){s.aspect=window.innerWidth/window.innerHeight,s.updateProjectionMatrix(),n.setSize(window.innerWidth,window.innerHeight)}return window.addEventListener(`resize`,A),{scene:a,renderer:n,camera:s,spotLight:D,armSpot:O,ambient:T,hemi:E,wallUniforms:l,onResize:A}}function Ce(e,t=!1){let n=new s({uniforms:{uTime:{value:0}},vertexShader:`
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
    `,transparent:!0,blending:2,depthWrite:!1,side:0}),r=new G(t?new o(48,42):new o(32,18),n);return r.position.set(0,t?8:4,-89.5),r.visible=!1,e.add(r),r}function we(){let e=new s({uniforms:{uColor:{value:new r(1721548)}},vertexShader:`
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
    `,transparent:!0,blending:2,depthWrite:!1,side:2}),t=new G(new o(2,2),e);return t.rotation.x=-Math.PI/2,t}var Te=class{constructor(e=Math){this.grad3=[[1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],[1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],[0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]],this.grad4=[[0,1,1,1],[0,1,1,-1],[0,1,-1,1],[0,1,-1,-1],[0,-1,1,1],[0,-1,1,-1],[0,-1,-1,1],[0,-1,-1,-1],[1,0,1,1],[1,0,1,-1],[1,0,-1,1],[1,0,-1,-1],[-1,0,1,1],[-1,0,1,-1],[-1,0,-1,1],[-1,0,-1,-1],[1,1,0,1],[1,1,0,-1],[1,-1,0,1],[1,-1,0,-1],[-1,1,0,1],[-1,1,0,-1],[-1,-1,0,1],[-1,-1,0,-1],[1,1,1,0],[1,1,-1,0],[1,-1,1,0],[1,-1,-1,0],[-1,1,1,0],[-1,1,-1,0],[-1,-1,1,0],[-1,-1,-1,0]],this.p=[];for(let t=0;t<256;t++)this.p[t]=Math.floor(e.random()*256);this.perm=[];for(let e=0;e<512;e++)this.perm[e]=this.p[e&255];this.simplex=[[0,1,2,3],[0,1,3,2],[0,0,0,0],[0,2,3,1],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,2,3,0],[0,2,1,3],[0,0,0,0],[0,3,1,2],[0,3,2,1],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,3,2,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,2,0,3],[0,0,0,0],[1,3,0,2],[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,3,0,1],[2,3,1,0],[1,0,2,3],[1,0,3,2],[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,0,3,1],[0,0,0,0],[2,1,3,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,0,1,3],[0,0,0,0],[0,0,0,0],[0,0,0,0],[3,0,1,2],[3,0,2,1],[0,0,0,0],[3,1,2,0],[2,1,0,3],[0,0,0,0],[0,0,0,0],[0,0,0,0],[3,1,0,2],[0,0,0,0],[3,2,0,1],[3,2,1,0]]}noise(e,t){let n,r,i,a=.5*(Math.sqrt(3)-1),o=(e+t)*a,s=Math.floor(e+o),c=Math.floor(t+o),l=(3-Math.sqrt(3))/6,u=(s+c)*l,d=s-u,f=c-u,p=e-d,m=t-f,h,g;p>m?(h=1,g=0):(h=0,g=1);let _=p-h+l,v=m-g+l,y=p-1+2*l,b=m-1+2*l,x=s&255,S=c&255,C=this.perm[x+this.perm[S]]%12,w=this.perm[x+h+this.perm[S+g]]%12,T=this.perm[x+1+this.perm[S+1]]%12,E=.5-p*p-m*m;E<0?n=0:(E*=E,n=E*E*this._dot(this.grad3[C],p,m));let D=.5-_*_-v*v;D<0?r=0:(D*=D,r=D*D*this._dot(this.grad3[w],_,v));let O=.5-y*y-b*b;return O<0?i=0:(O*=O,i=O*O*this._dot(this.grad3[T],y,b)),70*(n+r+i)}noise3d(e,t,n){let r,i,a,o,s=(e+t+n)*(1/3),c=Math.floor(e+s),l=Math.floor(t+s),u=Math.floor(n+s),d=1/6,f=(c+l+u)*d,p=c-f,m=l-f,h=u-f,g=e-p,_=t-m,v=n-h,y,b,x,S,C,w;g>=_?_>=v?(y=1,b=0,x=0,S=1,C=1,w=0):g>=v?(y=1,b=0,x=0,S=1,C=0,w=1):(y=0,b=0,x=1,S=1,C=0,w=1):_<v?(y=0,b=0,x=1,S=0,C=1,w=1):g<v?(y=0,b=1,x=0,S=0,C=1,w=1):(y=0,b=1,x=0,S=1,C=1,w=0);let T=g-y+d,E=_-b+d,D=v-x+d,O=g-S+2*d,k=_-C+2*d,A=v-w+2*d,ee=g-1+3*d,j=_-1+3*d,M=v-1+3*d,N=c&255,P=l&255,F=u&255,I=this.perm[N+this.perm[P+this.perm[F]]]%12,L=this.perm[N+y+this.perm[P+b+this.perm[F+x]]]%12,te=this.perm[N+S+this.perm[P+C+this.perm[F+w]]]%12,R=this.perm[N+1+this.perm[P+1+this.perm[F+1]]]%12,z=.6-g*g-_*_-v*v;z<0?r=0:(z*=z,r=z*z*this._dot3(this.grad3[I],g,_,v));let B=.6-T*T-E*E-D*D;B<0?i=0:(B*=B,i=B*B*this._dot3(this.grad3[L],T,E,D));let V=.6-O*O-k*k-A*A;V<0?a=0:(V*=V,a=V*V*this._dot3(this.grad3[te],O,k,A));let H=.6-ee*ee-j*j-M*M;return H<0?o=0:(H*=H,o=H*H*this._dot3(this.grad3[R],ee,j,M)),32*(r+i+a+o)}noise4d(e,t,n,r){let i=this.grad4,a=this.simplex,o=this.perm,s=(Math.sqrt(5)-1)/4,c=(5-Math.sqrt(5))/20,l,u,d,f,p,m=(e+t+n+r)*s,h=Math.floor(e+m),g=Math.floor(t+m),_=Math.floor(n+m),v=Math.floor(r+m),y=(h+g+_+v)*c,b=h-y,x=g-y,S=_-y,C=v-y,w=e-b,T=t-x,E=n-S,D=r-C,O=w>T?32:0,k=w>E?16:0,A=T>E?8:0,ee=w>D?4:0,j=T>D?2:0,M=+(E>D),N=O+k+A+ee+j+M,P=+(a[N][0]>=3),F=+(a[N][1]>=3),I=+(a[N][2]>=3),L=+(a[N][3]>=3),te=+(a[N][0]>=2),R=+(a[N][1]>=2),z=+(a[N][2]>=2),B=+(a[N][3]>=2),V=+(a[N][0]>=1),H=+(a[N][1]>=1),ne=+(a[N][2]>=1),re=+(a[N][3]>=1),U=w-P+c,ie=T-F+c,ae=E-I+c,oe=D-L+c,se=w-te+2*c,ce=T-R+2*c,le=E-z+2*c,W=D-B+2*c,ue=w-V+3*c,G=T-H+3*c,de=E-ne+3*c,fe=D-re+3*c,pe=w-1+4*c,me=T-1+4*c,he=E-1+4*c,ge=D-1+4*c,_e=h&255,ve=g&255,ye=_&255,be=v&255,xe=o[_e+o[ve+o[ye+o[be]]]]%32,Se=o[_e+P+o[ve+F+o[ye+I+o[be+L]]]]%32,Ce=o[_e+te+o[ve+R+o[ye+z+o[be+B]]]]%32,we=o[_e+V+o[ve+H+o[ye+ne+o[be+re]]]]%32,Te=o[_e+1+o[ve+1+o[ye+1+o[be+1]]]]%32,K=.6-w*w-T*T-E*E-D*D;K<0?l=0:(K*=K,l=K*K*this._dot4(i[xe],w,T,E,D));let q=.6-U*U-ie*ie-ae*ae-oe*oe;q<0?u=0:(q*=q,u=q*q*this._dot4(i[Se],U,ie,ae,oe));let J=.6-se*se-ce*ce-le*le-W*W;J<0?d=0:(J*=J,d=J*J*this._dot4(i[Ce],se,ce,le,W));let Ee=.6-ue*ue-G*G-de*de-fe*fe;Ee<0?f=0:(Ee*=Ee,f=Ee*Ee*this._dot4(i[we],ue,G,de,fe));let Y=.6-pe*pe-me*me-he*he-ge*ge;return Y<0?p=0:(Y*=Y,p=Y*Y*this._dot4(i[Te],pe,me,he,ge)),27*(l+u+d+f+p)}_dot(e,t,n){return e[0]*t+e[1]*n}_dot3(e,t,n,r){return e[0]*t+e[1]*n+e[2]*r}_dot4(e,t,n,r,i){return e[0]*t+e[1]*n+e[2]*r+e[3]*i}},K={name:`SSAOShader`,defines:{PERSPECTIVE_CAMERA:1,KERNEL_SIZE:32},uniforms:{tNormal:{value:null},tDepth:{value:null},tNoise:{value:null},kernel:{value:null},cameraNear:{value:null},cameraFar:{value:null},resolution:{value:new W},cameraProjectionMatrix:{value:new V},cameraInverseProjectionMatrix:{value:new V},kernelRadius:{value:8},minDistance:{value:.005},maxDistance:{value:.05}},vertexShader:`

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

		}`},q={name:`SSAODepthShader`,defines:{PERSPECTIVE_CAMERA:1},uniforms:{tDepth:{value:null},cameraNear:{value:null},cameraFar:{value:null}},vertexShader:`varying vec2 vUv;

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

		}`},J={name:`SSAOBlurShader`,uniforms:{tDiffuse:{value:null},resolution:{value:new W}},vertexShader:`varying vec2 vUv;

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

		}`},Ee=class n extends ue{constructor(e,n,i=512,a=512,o=32){super(),this.width=i,this.height=a,this.clear=!0,this.needsSwap=!1,this.camera=n,this.scene=e,this.kernelRadius=8,this.kernel=[],this.noiseTexture=null,this.output=0,this.minDistance=.005,this.maxDistance=.1,this._visibilityCache=[],this._generateSampleKernel(o),this._generateRandomKernelRotations();let c=new d;c.format=te,c.type=j,this.normalRenderTarget=new E(this.width,this.height,{minFilter:fe,magFilter:fe,type:t,depthTexture:c}),this.ssaoRenderTarget=new E(this.width,this.height,{type:t}),this.blurRenderTarget=this.ssaoRenderTarget.clone(),this.ssaoMaterial=new s({defines:Object.assign({},K.defines),uniforms:h.clone(K.uniforms),vertexShader:K.vertexShader,fragmentShader:K.fragmentShader,blending:0}),this.ssaoMaterial.defines.KERNEL_SIZE=o,this.ssaoMaterial.uniforms.tNormal.value=this.normalRenderTarget.texture,this.ssaoMaterial.uniforms.tDepth.value=this.normalRenderTarget.depthTexture,this.ssaoMaterial.uniforms.tNoise.value=this.noiseTexture,this.ssaoMaterial.uniforms.kernel.value=this.kernel,this.ssaoMaterial.uniforms.cameraNear.value=this.camera.near,this.ssaoMaterial.uniforms.cameraFar.value=this.camera.far,this.ssaoMaterial.uniforms.resolution.value.set(this.width,this.height),this.ssaoMaterial.uniforms.cameraProjectionMatrix.value.copy(this.camera.projectionMatrix),this.ssaoMaterial.uniforms.cameraInverseProjectionMatrix.value.copy(this.camera.projectionMatrixInverse),this.normalMaterial=new ne,this.normalMaterial.blending=0,this.blurMaterial=new s({defines:Object.assign({},J.defines),uniforms:h.clone(J.uniforms),vertexShader:J.vertexShader,fragmentShader:J.fragmentShader}),this.blurMaterial.uniforms.tDiffuse.value=this.ssaoRenderTarget.texture,this.blurMaterial.uniforms.resolution.value.set(this.width,this.height),this.depthRenderMaterial=new s({defines:Object.assign({},q.defines),uniforms:h.clone(q.uniforms),vertexShader:q.vertexShader,fragmentShader:q.fragmentShader,blending:0}),this.depthRenderMaterial.uniforms.tDepth.value=this.normalRenderTarget.depthTexture,this.depthRenderMaterial.uniforms.cameraNear.value=this.camera.near,this.depthRenderMaterial.uniforms.cameraFar.value=this.camera.far,this.copyMaterial=new s({uniforms:h.clone(A.uniforms),vertexShader:A.vertexShader,fragmentShader:A.fragmentShader,transparent:!0,depthTest:!1,depthWrite:!1,blendSrc:208,blendDst:200,blendEquation:100,blendSrcAlpha:206,blendDstAlpha:200,blendEquationAlpha:100}),this._fsQuad=new B(null),this._originalClearColor=new r}dispose(){this.normalRenderTarget.dispose(),this.ssaoRenderTarget.dispose(),this.blurRenderTarget.dispose(),this.normalMaterial.dispose(),this.blurMaterial.dispose(),this.copyMaterial.dispose(),this.depthRenderMaterial.dispose(),this._fsQuad.dispose()}render(e,t,r){switch(this._overrideVisibility(),this._renderOverride(e,this.normalMaterial,this.normalRenderTarget,7829503,1),this._restoreVisibility(),this.ssaoMaterial.uniforms.kernelRadius.value=this.kernelRadius,this.ssaoMaterial.uniforms.minDistance.value=this.minDistance,this.ssaoMaterial.uniforms.maxDistance.value=this.maxDistance,this._renderPass(e,this.ssaoMaterial,this.ssaoRenderTarget),this._renderPass(e,this.blurMaterial,this.blurRenderTarget),this.output){case n.OUTPUT.SSAO:this.copyMaterial.uniforms.tDiffuse.value=this.ssaoRenderTarget.texture,this.copyMaterial.blending=0,this._renderPass(e,this.copyMaterial,this.renderToScreen?null:r);break;case n.OUTPUT.Blur:this.copyMaterial.uniforms.tDiffuse.value=this.blurRenderTarget.texture,this.copyMaterial.blending=0,this._renderPass(e,this.copyMaterial,this.renderToScreen?null:r);break;case n.OUTPUT.Depth:this._renderPass(e,this.depthRenderMaterial,this.renderToScreen?null:r);break;case n.OUTPUT.Normal:this.copyMaterial.uniforms.tDiffuse.value=this.normalRenderTarget.texture,this.copyMaterial.blending=0,this._renderPass(e,this.copyMaterial,this.renderToScreen?null:r);break;case n.OUTPUT.Default:this.copyMaterial.uniforms.tDiffuse.value=this.blurRenderTarget.texture,this.copyMaterial.blending=5,this._renderPass(e,this.copyMaterial,this.renderToScreen?null:r);break;default:console.warn(`THREE.SSAOPass: Unknown output type.`)}}setSize(e,t){this.width=e,this.height=t,this.ssaoRenderTarget.setSize(e,t),this.normalRenderTarget.setSize(e,t),this.blurRenderTarget.setSize(e,t),this.ssaoMaterial.uniforms.resolution.value.set(e,t),this.ssaoMaterial.uniforms.cameraProjectionMatrix.value.copy(this.camera.projectionMatrix),this.ssaoMaterial.uniforms.cameraInverseProjectionMatrix.value.copy(this.camera.projectionMatrixInverse),this.blurMaterial.uniforms.resolution.value.set(e,t)}_renderPass(e,t,n,r,i){e.getClearColor(this._originalClearColor);let a=e.getClearAlpha(),o=e.autoClear;e.setRenderTarget(n),e.autoClear=!1,r!=null&&(e.setClearColor(r),e.setClearAlpha(i||0),e.clear()),this._fsQuad.material=t,this._fsQuad.render(e),e.autoClear=o,e.setClearColor(this._originalClearColor),e.setClearAlpha(a)}_renderOverride(e,t,n,r,i){e.getClearColor(this._originalClearColor);let a=e.getClearAlpha(),o=e.autoClear;e.setRenderTarget(n),e.autoClear=!1,r=t.clearColor||r,i=t.clearAlpha||i,r!=null&&(e.setClearColor(r),e.setClearAlpha(i||0),e.clear()),this.scene.overrideMaterial=t,e.render(this.scene,this.camera),this.scene.overrideMaterial=null,e.autoClear=o,e.setClearColor(this._originalClearColor),e.setClearAlpha(a)}_generateSampleKernel(e){let t=this.kernel;for(let n=0;n<e;n++){let r=new U;r.x=Math.random()*2-1,r.y=Math.random()*2-1,r.z=Math.random(),r.normalize();let i=n/e;i=k.lerp(.1,1,i*i),r.multiplyScalar(i),t.push(r)}}_generateRandomKernelRotations(){let t=new Te,n=new Float32Array(16);for(let e=0;e<16;e++){let r=Math.random()*2-1,i=Math.random()*2-1;n[e]=t.noise3d(r,i,0)}this.noiseTexture=new e(n,4,4,u,l),this.noiseTexture.wrapS=_,this.noiseTexture.wrapT=_,this.noiseTexture.needsUpdate=!0}_overrideVisibility(){let e=this.scene,t=this._visibilityCache;e.traverse(function(e){(e.isPoints||e.isLine||e.isLine2)&&e.visible&&(e.visible=!1,t.push(e))})}_restoreVisibility(){let e=this._visibilityCache;for(let t=0;t<e.length;t++)e[t].visible=!0;e.length=0}};Ee.OUTPUT={Default:0,SSAO:1,Blur:2,Depth:3,Normal:4};var Y={name:`BokehShader`,defines:{DEPTH_PACKING:1,PERSPECTIVE_CAMERA:1},uniforms:{tColor:{value:null},tDepth:{value:null},focus:{value:1},aspect:{value:1},aperture:{value:.025},maxblur:{value:.01},nearClip:{value:1},farClip:{value:1e3}},vertexShader:`

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

		}`},De=class extends ue{constructor(e,n,i){super(),this.scene=e,this.camera=n;let a=i.focus===void 0?1:i.focus,o=i.aperture===void 0?.025:i.aperture,c=i.maxblur===void 0?1:i.maxblur;this._renderTargetDepth=new E(1,1,{minFilter:fe,magFilter:fe,type:t}),this._renderTargetDepth.texture.name=`BokehPass.depth`,this._materialDepth=new P,this._materialDepth.depthPacking=f,this._materialDepth.blending=0;let l=h.clone(Y.uniforms);l.tDepth.value=this._renderTargetDepth.texture,l.focus.value=a,l.aspect.value=n.aspect,l.aperture.value=o,l.maxblur.value=c,l.nearClip.value=n.near,l.farClip.value=n.far,this.materialBokeh=new s({defines:Object.assign({},Y.defines),uniforms:l,vertexShader:Y.vertexShader,fragmentShader:Y.fragmentShader}),this.uniforms=l,this._fsQuad=new B(this.materialBokeh),this._oldClearColor=new r}render(e,t,n){this.scene.overrideMaterial=this._materialDepth,e.getClearColor(this._oldClearColor);let r=e.getClearAlpha(),i=e.autoClear;e.autoClear=!1,e.setClearColor(16777215),e.setClearAlpha(1),e.setRenderTarget(this._renderTargetDepth),e.clear(),e.render(this.scene,this.camera),this.uniforms.tColor.value=n.texture,this.uniforms.nearClip.value=this.camera.near,this.uniforms.farClip.value=this.camera.far,this.renderToScreen?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(t),e.clear(),this._fsQuad.render(e)),this.scene.overrideMaterial=null,e.setClearColor(this._oldClearColor),e.setClearAlpha(r),e.autoClear=i}setSize(e,t){this.materialBokeh.uniforms.aspect.value=e/t,this._renderTargetDepth.setSize(e,t)}dispose(){this._renderTargetDepth.dispose(),this._materialDepth.dispose(),this.materialBokeh.dispose(),this._fsQuad.dispose()}},Oe={uniforms:{tDiffuse:{value:null},amount:{value:.01}},vertexShader:`
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
  `},ke={uniforms:{tDiffuse:{value:null},uTime:{value:0},uGrainAmp:{value:.04},uVignetteAmp:{value:1}},vertexShader:`
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

      // Vignette — soft darkening toward edges. Range widened
      // (0.6 → 1.6) so the drop-off starts halfway to the edge and
      // corners land at ~30% brightness instead of pure black. Prevents
      // the "radial black frame" that jumps out on bright surfaces.
      vec2  vig      = (vUv - 0.5) * 2.0;
      float vigDist  = length(vig);
      float vignette = 1.0 - smoothstep(0.6, 1.6, vigDist) * 0.55;
      color.rgb     *= mix(1.0, vignette, uVignetteAmp);

      gl_FragColor = color;
    }
  `};function Ae(e,t,n,r=!1,i=null){let a=window.innerWidth,o=window.innerHeight,s=new ce(e);s.addPass(new ie(t,n));let c=null,l=null;r||(c=new Ee(t,n,a,o),c.kernelRadius=8,c.minDistance=.005,c.maxDistance=.1,s.addPass(c));let u=new ve(r?new W(a/2,o/2):new W(a,o),r?.18:.25,r?.35:.4,r?.92:.9);s.addPass(u),r||(l=new De(t,n,{focus:4,aperture:1e-4,maxblur:.005}),s.addPass(l)),i&&s.addPass(i);let d=null;r||(d=new O(Oe),s.addPass(d));let f=new O(ke);return r&&(f.uniforms.uGrainAmp.value=0,f.uniforms.uVignetteAmp.value=0),f.renderToScreen=!0,s.addPass(f),{composer:s,bloom:u,chroma:d,ssao:c,bokeh:l,grainVignette:f,setSize(e,t){s.setSize(e,t),u&&u.setSize(e,t),c&&c.setSize(e,t)}}}var je=new be;je.setDecoderPath(`https://www.gstatic.com/draco/versioned/decoders/1.5.6/`);var Me=new ye;Me.setDRACOLoader(je);function Ne(e){Me=new ye(e),Me.setDRACOLoader(je)}var Pe=new Map;function Fe(e,{onProgress:t}={}){return Pe.has(e)?Promise.resolve(Pe.get(e).clone(!0)):new Promise((n,r)=>{Me.load(e,t=>{let r=t.scene;r.traverse(e=>{e.isMesh&&(e.castShadow=!0,e.receiveShadow=!0)});let i=new de().setFromObject(r),a=new U;i.getCenter(a),console.log(`[loader] ✓ ${e} | bbox center:`,a.toArray().map(e=>e.toFixed(2))),Pe.set(e,r),n(r.clone(!0))},t,t=>{console.error(`[loader] ✗ ${e}`,t),r(t)})})}var Ie=`
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`,Le=`
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
`,Re={uniforms:{tDiffuse:{value:null},uWaveTex:{value:null},uTime:{value:0},uIntensity:{value:1},uDispAmount:{value:.045},uCausticAmp:{value:.38},uTintAmount:{value:.5},uAspect:{value:1}},vertexShader:`
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
  `};function ze(e,{isMobile:r=!1}={}){let i=Math.min(window.devicePixelRatio,2),a=r?.4:.6,c=()=>Math.max(64,Math.floor(window.innerWidth*i*a)),l=()=>Math.max(64,Math.floor(window.innerHeight*i*a)),u={format:m,type:t,minFilter:M,magFilter:M,stencilBuffer:!1,depthBuffer:!1},d=new E(c(),l(),u),f=new E(c(),l(),u),p=new x,h=new n(-1,1,1,-1,0,1),g=new W,_=0,v=new s({uniforms:{textureA:{value:null},mouse:{value:g},resolution:{value:new W(c(),l())},time:{value:0},frame:{value:0}},vertexShader:Ie,fragmentShader:Le}),y=new o(2,2),b=new G(y,v);p.add(b);let S=new O(Re);S.uniforms.uWaveTex.value=d.texture,S.uniforms.uAspect.value=window.innerWidth/window.innerHeight,r&&(S.uniforms.uDispAmount.value=.035,S.uniforms.uCausticAmp.value=.28,S.uniforms.uTintAmount.value=.42);let C=()=>{let t=performance.now()/1e3;v.uniforms.textureA.value=d.texture,v.uniforms.frame.value=_++,v.uniforms.time.value=t;let n=e.getRenderTarget();e.setRenderTarget(f),e.render(p,h),e.setRenderTarget(n);let r=d;d=f,f=r,S.uniforms.uWaveTex.value=d.texture,S.uniforms.uTime.value=t},w=(e,t)=>{if(e<0||t<0){g.set(0,0);return}g.x=e*c(),g.y=t*l()},T=e=>{S.uniforms.uIntensity.value=Math.max(0,Math.min(1,e))},D=()=>{d.setSize(c(),l()),f.setSize(c(),l()),v.uniforms.resolution.value.set(c(),l()),S.uniforms.uAspect.value=window.innerWidth/window.innerHeight};return window.addEventListener(`resize`,D),{pass:S,update:C,setMouseNorm:w,setIntensity:T,dispose:()=>{window.removeEventListener(`resize`,D),y.dispose(),v.dispose(),d.dispose(),f.dispose()}}}var X=new w,Be=new U,Ve=new W,He=new W,Ue=new W,We=class{constructor(e){this.geometry=e.geometry,this.randomFunction=Math.random,this.indexAttribute=this.geometry.index,this.positionAttribute=this.geometry.getAttribute(`position`),this.normalAttribute=this.geometry.getAttribute(`normal`),this.colorAttribute=this.geometry.getAttribute(`color`),this.uvAttribute=this.geometry.getAttribute(`uv`),this.weightAttribute=null,this.distribution=null}setWeightAttribute(e){return this.weightAttribute=e?this.geometry.getAttribute(e):null,this}build(){let e=this.indexAttribute,t=this.positionAttribute,n=this.weightAttribute,r=e?e.count/3:t.count/3,i=new Float32Array(r);for(let a=0;a<r;a++){let r=1,o=3*a,s=3*a+1,c=3*a+2;e&&(o=e.getX(o),s=e.getX(s),c=e.getX(c)),n&&(r=n.getX(o)+n.getX(s)+n.getX(c)),X.a.fromBufferAttribute(t,o),X.b.fromBufferAttribute(t,s),X.c.fromBufferAttribute(t,c),r*=X.getArea(),i[a]=r}let a=new Float32Array(r),o=0;for(let e=0;e<r;e++)o+=i[e],a[e]=o;return this.distribution=a,this}setRandomGenerator(e){return this.randomFunction=e,this}sample(e,t,n,r){let i=this._sampleFaceIndex();return this._sampleFace(i,e,t,n,r)}_sampleFaceIndex(){let e=this.distribution[this.distribution.length-1];return this._binarySearch(this.randomFunction()*e)}_binarySearch(e){let t=this.distribution,n=0,r=t.length-1,i=-1;for(;n<=r;){let a=Math.ceil((n+r)/2);if(a===0||t[a-1]<=e&&t[a]>e){i=a;break}else e<t[a]?r=a-1:n=a+1}return i}_sampleFace(e,t,n,r,i){let a=this.randomFunction(),o=this.randomFunction();a+o>1&&(a=1-a,o=1-o);let s=this.indexAttribute,c=e*3,l=e*3+1,u=e*3+2;return s&&(c=s.getX(c),l=s.getX(l),u=s.getX(u)),X.a.fromBufferAttribute(this.positionAttribute,c),X.b.fromBufferAttribute(this.positionAttribute,l),X.c.fromBufferAttribute(this.positionAttribute,u),t.set(0,0,0).addScaledVector(X.a,a).addScaledVector(X.b,o).addScaledVector(X.c,1-(a+o)),n!==void 0&&(this.normalAttribute===void 0?X.getNormal(n):(X.a.fromBufferAttribute(this.normalAttribute,c),X.b.fromBufferAttribute(this.normalAttribute,l),X.c.fromBufferAttribute(this.normalAttribute,u),n.set(0,0,0).addScaledVector(X.a,a).addScaledVector(X.b,o).addScaledVector(X.c,1-(a+o)).normalize())),r!==void 0&&this.colorAttribute!==void 0&&(X.a.fromBufferAttribute(this.colorAttribute,c),X.b.fromBufferAttribute(this.colorAttribute,l),X.c.fromBufferAttribute(this.colorAttribute,u),Be.set(0,0,0).addScaledVector(X.a,a).addScaledVector(X.b,o).addScaledVector(X.c,1-(a+o)),r.r=Be.x,r.g=Be.y,r.b=Be.z),i!==void 0&&this.uvAttribute!==void 0&&(Ve.fromBufferAttribute(this.uvAttribute,c),He.fromBufferAttribute(this.uvAttribute,l),Ue.fromBufferAttribute(this.uvAttribute,u),i.set(0,0).addScaledVector(Ve,a).addScaledVector(He,o).addScaledVector(Ue,1-(a+o))),this}},Ge=.51,Ke=.53,qe=.56,Je=.55,Ye=.57,Xe=.58,Ze=.6,Qe=.62,$e=.65,et=3.5,tt=8,nt=.04,rt=32,it=18,at=22,ot=12,st=7,ct=new r(2109520),lt=.55;function ut(e){let t=Math.max(0,Math.min(1,e));return t*t*(3-2*t)}function dt(e,t,n,r){let i=r?at:rt,a=r?ot:it,o=i*a,s=r?st:tt,c=e.getSize(new W),l=new E(Math.floor(c.x*(r?.7:1)),Math.floor(c.y*(r?.7:1)),{minFilter:M,magFilter:M}),u=1/i,d=1/a,f=new Float32Array(o*4);for(let e=0;e<a;e++)for(let t=0;t<i;t++){let n=e*i+t;f[n*4+0]=t*u,f[n*4+1]=1-(e+1)*d,f[n*4+2]=u,f[n*4+3]=d}let p=new y(f,4),m=new ge(1,1,nt);m.setAttribute(`instanceUV`,p);let h={uOpacity:{value:1},uTintColor:{value:ct.clone()},uTintAmount:{value:0}},g=new ee({map:l.texture,transparent:!0,depthWrite:!1,side:0});g.onBeforeCompile=e=>{e.uniforms.uOpacity=h.uOpacity,e.uniforms.uTintColor=h.uTintColor,e.uniforms.uTintAmount=h.uTintAmount,e.vertexShader=e.vertexShader.replace(`void main() {`,`attribute vec4 instanceUV;
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
`},g.customProgramCacheKey=()=>`shatter_tile`;let _=new S(m,g,o);_.frustumCulled=!1,_.visible=!1,t.add(_);let b=Array(o),x=Array(o),C=Array(o),w=Array(o).fill(null).map(()=>new U),T=new Float32Array(o*3),D=1,O=1,k=!1,A=!0,j=new v,N=new U,P=[],F=[],I=[],L=[];function te(e,t){let n=new Set;e.traverse(e=>{if(!e.isMesh)return;let r=e.material;r&&!n.has(r)&&(n.add(r),t.push(r))})}function R(e,t){for(let n of e)n.opacity=t}function z(){for(let e of F)e.opacity=1;for(let e of P)e.opacity=1;for(let e of I)e.visible=!0;for(let e of L)e.visible=!0}function B(){for(let e of I)e.visible=!1;for(let e of L)e.visible=!1}function V(){n.updateMatrixWorld();let e=n.fov*Math.PI/180,t=Math.tan(e/2)*et,r=t*n.aspect;D=r*2/i,O=t*2/a;let o=new U,s=new U,c=new U;n.getWorldDirection(o),s.setFromMatrixColumn(n.matrixWorld,0),c.setFromMatrixColumn(n.matrixWorld,1);let l=n.position.clone().addScaledVector(o,et);for(let e=0;e<a;e++)for(let n=0;n<i;n++){let o=e*i+n,u=(n+.5)/i*2-1,d=1-(e+.5)/a*2;b[o]=l.clone().addScaledVector(s,u*r).addScaledVector(c,d*t)}}function H(){let e=new U;for(let t=0;t<o;t++)e.set(Math.random()-.5,Math.random()-.5,Math.random()-.5).normalize().multiplyScalar(s*(.4+Math.random()*.6)),w[t].copy(e),T[t*3]=(Math.random()-.5)*Math.PI*2,T[t*3+1]=(Math.random()-.5)*Math.PI*2,T[t*3+2]=(Math.random()-.5)*Math.PI*2}function ne(){for(let e=0;e<o;e++)x[e]=b[e].clone().add(w[e])}function re(e){e.updateMatrixWorld(!0);let t=[];if(e.traverse(e=>{e.isMesh&&e.geometry&&e.geometry.attributes.position&&t.push(e)}),!t.length){console.warn(`[shatter] setSurface: no sampelable meshes found`);return}te(e,P);for(let e of P)e.transparent=!0,e.opacity=1;let n=new U,r=new U,i=[],a=Math.ceil(o/t.length);for(let e of t){if(i.length>=o)break;let t=new We(e).build(),s=Math.min(a,o-i.length);for(let a=0;a<s;a++)t.sample(n,r),i.push(n.clone().applyMatrix4(e.matrixWorld))}for(;i.length<o;)i.push(i[Math.floor(Math.random()*i.length)].clone());for(let e=i.length-1;e>0;e--){let t=Math.floor(Math.random()*(e+1));[i[e],i[t]]=[i[t],i[e]]}for(let e=0;e<o;e++)C[e]=i[e];k=!0,console.log(`[shatter] surface sampled — ${o} pts across ${t.length} mesh(es)`)}function ie(e,t=[]){te(e,F);for(let e of F)e.transparent=!0,e.opacity=1;for(let e of t)I.push(e);console.log(`[shatter] hero_canvas primed — ${F.length} material(s), ${t.length} extras`)}function ae(e=[]){for(let t of e)L.push(t)}function oe(){_.visible=!1,R(F,1),R(P,1);for(let e of I)e.visible=!0;for(let e of L)e.visible=!0;e.setRenderTarget(l),e.render(t,n),e.setRenderTarget(null),_.visible=!0}function se(){V(),H(),ne(),e.setRenderTarget(l),e.render(t,n),e.setRenderTarget(null),h.uOpacity.value=1,h.uTintAmount.value=0,N.set(D,O,nt),j.rotation.set(0,0,0);for(let e=0;e<o;e++)j.position.copy(b[e]),j.scale.copy(N),j.updateMatrix(),_.setMatrixAt(e,j.matrix);_.instanceMatrix.needsUpdate=!0,_.visible=!0}function ce(e){let t={bgDark:0,textOpacity:0};if(e<.51||e>.65)return A||=(_.visible=!1,z(),h.uOpacity.value=1,h.uTintAmount.value=0,!0),t;A=!1,_.visible||=!0;let n=0,r=0,i=1,a,s,c=0,l=0;if(e<Ke){V(),ne(),oe(),n=0,r=0,a=b,s=x,c=0;let t=ut((e-Ge)/(Ke-Ge)),i=1-t;R(F,i),R(P,i);let o=t>.5;for(let e of I)e.visible=!o;for(let e of L)e.visible=!o;h.uOpacity.value=1,h.uTintAmount.value=0}else if(e<.56){let t=ut((e-Ke)/(qe-Ke));n=t,r=t,a=b,s=x,c=t,R(F,0),R(P,0),B(),h.uOpacity.value=1,h.uTintAmount.value=0}else if(e<.6)n=1,r=1,a=b,s=x,c=1,R(F,0),R(P,0),B(),h.uOpacity.value=1,h.uTintAmount.value=0,l=e<.57?ut((e-Je)/(Ye-Je)):e<.58?1:1-ut((e-Xe)/(Ze-Xe));else if(!k||e<.62)if(k){let t=ut((e-Ze)/(Qe-Ze));n=t,r=1-t,a=x,s=C,c=1-t,R(F,0),R(P,0),B(),h.uOpacity.value=1,h.uTintAmount.value=t*lt}else{let t=(e-Ze)/($e-Ze);n=ut(1-t),r=n,a=b,s=x,c=1-ut(t)}else{let t=ut((e-Qe)/($e-Qe));n=1,r=0,a=C,s=C,i=1-t,c=0,R(F,0),R(P,t);for(let e of L)e.visible=!0;for(let e of I)e.visible=!1;h.uOpacity.value=1-t,h.uTintAmount.value=lt*(1-t)}N.set(D*i,O*i,nt*i);for(let e=0;e<o;e++)j.position.lerpVectors(a[e],s[e],n),j.rotation.set(T[e*3]*r,T[e*3+1]*r,T[e*3+2]*r),j.scale.copy(N),j.updateMatrix(),_.setMatrixAt(e,j.matrix);return _.instanceMatrix.needsUpdate=!0,{bgDark:c,textOpacity:l}}function le(){t.remove(_),l.dispose(),m.dispose(),g.dispose(),z()}return{capture:se,update:ce,setSurface:re,setHeroCanvas:ie,setVoidExtras:ae,dispose:le,mesh:_}}var Z=window.innerWidth<768||`ontouchstart`in window,ft={"hand.glb":`Every brand begins like this.`,"monument.glb":`Something is always missing at the beginning.`,"hero_canvas.glb":`Between sketch and masterpiece, there's patience.`,"void_figure.glb":`Sometimes what we leave out is what speaks.`,"arm_crystal.glb":`That's how the moment forms.`};function pt(e){return ft[e]??``}var Q=[{file:`/models/hand.glb`,z:0,scale:3},{file:`/models/monument.glb`,z:-12,scale:.456},{file:`/models/hero_canvas.glb`,z:-24,scale:3},{file:`/models/void_figure.glb`,z:-36,orbitN:Z?36:32},{file:`/models/arm_crystal.glb`,z:-48}].map(e=>({...e,caption:pt(e.file.split(`/`).pop())})),mt=document.getElementById(`scene-canvas`),ht=document.getElementById(`caption`),gt=document.getElementById(`gathering-text`),_t=document.querySelector(`.wordmark`),{scene:vt,renderer:yt,camera:$,spotLight:bt,armSpot:xt,ambient:St,hemi:Ct,wallUniforms:wt,onResize:Tt}=Se(mt,Z),Et=75,Dt=55,Ot=900,kt=-48,At=30,jt=ze(yt,{isMobile:Z}),Mt=Ae(yt,vt,$,Z,jt.pass),Nt=0,Pt=Ce(vt,Z),Ft=Z?null:dt(yt,vt,$,Z),It=!1,Lt=1.8,Rt=Z?5:4,zt=Z?16:32;function Bt(){let e=[],t=Lt,n=Rt;e.push(new U(0,t,10)),e.push(new U(0,t,7)),Q.forEach((r,i)=>{let a=r.z,o=r.orbitN??zt;for(let r=0;r<=o;r++){let i=r/o*Math.PI*2;e.push(new U(Math.sin(i)*n,t,a+Math.cos(i)*n))}if(i<Q.length-1){let r=Q[i+1].z;e.push(new U(n*1.5,t,a)),e.push(new U(n*.8,t,a-n-1)),e.push(new U(0,t,r+n+1))}});let r=Q[Q.length-1].z;return e.push(new U(n*1.2,t,r)),e.push(new U(0,t,r-n-2)),e.push(new U(0,t,r-20)),e.push(new U(0,t,r-28)),new pe(e,!1,`catmullrom`,.5)}var Vt=Bt(),Ht=0,Ut=0,Wt=new U,Gt=new U(0,1.5,0),Kt=new U(0,1.5,0),qt=new U(0,6,0),Jt=new U(0,.5,0),Yt=null;function Xt(e){if(e!==Yt){if(Yt=e,N.killTweensOf(ht),!e){N.to(ht,{opacity:0,duration:.3});return}N.to(ht,{opacity:0,duration:.25,ease:`power2.in`,onComplete(){ht.textContent=e,N.to(ht,{opacity:1,duration:.5,ease:`power2.out`})}})}}function Zt(e){let t=1/0,n=null;for(let r of Q){let i=Math.hypot(e.x,e.z-r.z);i<t&&(t=i,n=r)}return{def:n,dist:t}}var Qt=new W(-9,-9),$t=new a;mt.addEventListener(`pointermove`,e=>{Qt.x=e.clientX/window.innerWidth*2-1,Qt.y=-(e.clientY/window.innerHeight)*2+1}),mt.addEventListener(`pointerleave`,()=>Qt.set(-9,-9));var en=null,tn=null,nn=null,rn=null,an=600;function on(){en=new he,tn=new Float32Array(an*3),nn=new Float32Array(an*3);for(let e=0;e<an;e++){let t=(Math.random()-.5)*16,n=Math.random()*7,r=5-Math.random()*65;tn[e*3]=nn[e*3]=t,tn[e*3+1]=nn[e*3+1]=n,tn[e*3+2]=nn[e*3+2]=r}en.setAttribute(`position`,new D(tn,3));let e=new z({size:.015,color:8425664,transparent:!0,opacity:.35,depthWrite:!1});rn=new p(en,e),vt.add(rn)}function sn(e){if(!en)return;let t=en.attributes.position;for(let n=0;n<an;n++){let r=n*3;t.array[r+1]+=.001,t.array[r+0]=nn[r]+Math.sin(e*.3+n*.17)*.08,t.array[r+2]=nn[r+2]+Math.cos(e*.2+n*.13)*.05,t.array[r+1]>7&&(t.array[r+1]=0,nn[r+1]=0)}t.needsUpdate=!0}var cn=[155,255,390,580,1190],ln=new F({color:855311,roughness:.9,metalness:.1});async function un(e,t){try{let n=await Fe(e.file);e.scale&&n.scale.setScalar(e.scale),n.updateMatrixWorld(!0);let r=new de().setFromObject(n),a=isFinite(r.min.x)?(r.min.x+r.max.x)/2:0,o=isFinite(r.min.z)?(r.min.z+r.max.z)/2:0,s=isFinite(r.min.y)?-r.min.y+.3:.3;n.position.set(-a,s,e.z-o),n.traverse(e=>{e.isMesh&&(e.castShadow=e.receiveShadow=!Z)}),vt.add(n);let c=new G(new R(.4,.5,.3,32),ln);c.position.set(0,.15,e.z),c.castShadow=c.receiveShadow=!0,vt.add(c);let l=we();l.position.set(0,.02,e.z),vt.add(l),e.file.includes(`void_figure`)&&(Ft?.setSurface(n),Ft?.setVoidExtras([c,l])),e.file.includes(`hero_canvas`)&&Ft?.setHeroCanvas(n,[c,l]);let u=new i(13691135,cn[t]??500,16,2);u.position.set(0,6.5,e.z),vt.add(u),console.log(`[HOLM] ✓ ${e.file} @ z=${e.z}`)}catch(t){console.error(`[HOLM] ✗ ${e.file}`,t)}}var dn=!1,fn=document.getElementById(`projection-overlay`);function pn(){Pt.visible=!0,fn.classList.add(`active`),N.to(fn,{opacity:1,duration:1.2,ease:`power2.out`});let e=fn.querySelectorAll(`.proj-line`);N.fromTo(e,{opacity:0,y:12},{opacity:1,y:0,duration:1,stagger:.4,delay:.4,ease:`power2.out`}),N.fromTo(fn.querySelector(`.proj-cta`),{opacity:0,y:8},{opacity:1,y:0,duration:1,delay:2.6,ease:`power2.out`})}function mn(){N.to(fn,{opacity:0,duration:.5,onComplete:()=>{fn.classList.remove(`active`),Pt.visible=!1,N.set(`.proj-line, .proj-cta`,{opacity:0,y:0})}})}var hn=new ae(Z?{smoothTouch:!1,touchMultiplier:.65}:{duration:4,smoothWheel:!0,wheelMultiplier:.28,touchMultiplier:1.2,smoothTouch:!1});N.ticker.lagSmoothing(0),se(document);var gn=(()=>{try{return sessionStorage.getItem(`holm:transition`)===`1`}catch{return!1}})();le(),new L({lenis:hn}).mount(),se(document);var _n=document.getElementById(`book-call`);_n&&(_n.style.display=`none`),hn.on(`scroll`,({scroll:e,limit:t})=>{Ht=t>0?e/t:0});function vn(e=0){requestAnimationFrame(vn),hn.raf(e);let t=$t.getElapsedTime();Z?(Ut+=(Ht-Ut)*.18,Wt.copy(Vt.getPoint(Ut)),$.position.copy(Wt)):(Wt.copy(Vt.getPoint(Ht)),$.position.lerp(Wt,.07));let{def:n,dist:r}=Zt($.position),i=n&&r<Rt+1.5,a=$.position.z<-56,o=$.position.z<-68;if(a)Gt.set(0,4,-89.5),qt.set(0,7,$.position.z),Jt.set(0,3.5,-89.5),Xt(``),Pt.material.uniforms.uTime.value=t,o&&!dn&&(dn=!0,pn()),!o&&dn&&(dn=!1,mn());else if(i)Gt.set(0,1.5,n.z),qt.set(0,6,n.z),Jt.set(0,.5,n.z),Xt(n.caption),dn&&(dn=!1,mn());else{let e=Q.find(e=>e.z<$.position.z-1);Gt.set(0,1.5,e?e.z:$.position.z-10),qt.set(0,6,$.position.z-3),Jt.set(0,.5,$.position.z-8),r>Rt*3&&Xt(``),dn&&(dn=!1,mn()),Pt.visible=!1}Kt.lerp(Gt,.07),$.lookAt(Kt),bt.position.lerp(qt,.05),bt.target.position.lerp(Jt,.05),bt.target.updateMatrixWorld();let s=Math.hypot($.position.x,$.position.z-kt);xt.intensity+=((s<Rt+3?Ot:0)-xt.intensity)*.1,Mt.bokeh&&(Mt.bokeh.uniforms.focus.value=r),Mt.grainVignette&&(Mt.grainVignette.uniforms.uTime.value=t),wt.uTime.value=t,jt.setMouseNorm((Qt.x+1)*.5,(Qt.y+1)*.5),jt.update(),Z||sn(t);let c=0,l=0;if(Ft){let e=Ht;e>=.51&&e<=.65&&!It&&(It=!0,Ft.capture()),e<.46&&(It=!1);let t=Ft.update(e);c=t.bgDark,l=t.textOpacity}let u=(1-c*.92)*Nt;St.intensity=Et*u,Ct.intensity=Dt*u,bt.intensity=At*Math.max(u,.12*Nt),gt&&(gt.style.opacity=l),l>.01&&Xt(``),Mt.composer.render()}window.addEventListener(`resize`,()=>{Tt(),Mt.setSize(window.innerWidth,window.innerHeight)});async function yn(){let e=Vt.getPoint(0);$.position.copy(e),$.position.z+=3,Kt.set(0,1.5,Q[0].z),$.lookAt(Kt);let t=!1,n=()=>{if(t)return;t=!0,requestAnimationFrame(vn);let n={v:0};N.to(n,{v:1,duration:4.2,ease:`power2.out`,onUpdate:()=>{Nt=n.v}}),N.to($.position,{z:e.z,duration:3.8,ease:`power2.out`}),N.to(ht,{opacity:1,duration:1.4,delay:2.4,ease:`power2.out`}),_t&&N.to(_t,{opacity:.85,duration:1.2,delay:1.6,ease:`power2.out`});let r=document.getElementById(`holm-teaser`);if(r){r.setAttribute(`aria-hidden`,`false`),N.fromTo(r,{opacity:0,y:12},{opacity:1,y:0,duration:1.2,delay:1.6,ease:`power2.out`});let e=!1,t=()=>{e||(e=!0,N.to(r,{opacity:0,duration:.8,ease:`power2.out`,onComplete:()=>r.setAttribute(`aria-hidden`,`true`)}),hn.off(`scroll`,n),window.removeEventListener(`wheel`,i),window.removeEventListener(`touchmove`,i),window.removeEventListener(`keydown`,a),clearTimeout(o))},n=({scroll:e})=>{e>4&&t()},i=()=>t(),a=e=>{[`ArrowDown`,`ArrowUp`,`PageDown`,`PageUp`,`End`,`Home`,` `].includes(e.key)&&t()},o=setTimeout(t,7e3);hn.on(`scroll`,n),window.addEventListener(`wheel`,i,{passive:!0}),window.addEventListener(`touchmove`,i,{passive:!0}),window.addEventListener(`keydown`,a)}};if(gn){Ne(new oe);for(let e=0;e<Q.length;e++)await un(Q[e],e);Z||on(),n(),re()}else{let e=new T({renderer:yt,onReveal:n});Ne(e.getLoadingManager());let t=e.run();for(let e=0;e<Q.length;e++)await un(Q[e],e);Z||on(),e.markComplete(),await t}let r=document.querySelector(`.proj-cta`);r&&(r.addEventListener(`mousemove`,e=>{let t=r.getBoundingClientRect(),n=(e.clientX-t.left-t.width*.5)/t.width,i=(e.clientY-t.top-t.height*.5)/t.height;N.to(r,{x:n*14,y:i*9,duration:.35,ease:`power2.out`})}),r.addEventListener(`mouseleave`,()=>N.to(r,{x:0,y:0,duration:.7,ease:`elastic.out(1, 0.45)`})))}yn();