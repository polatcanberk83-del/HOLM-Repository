import{$ as e,A as t,B as n,C as r,Dt as i,E as a,Et as o,Ht as s,I as c,It as l,Jt as u,L as d,Lt as f,N as p,Nt as m,O as h,Ot as g,Qt as _,R as v,Rt as y,St as b,T as x,U as S,V as C,Vt as w,W as T,Z as E,Zt as D,_ as O,a as ee,an as k,b as A,c as j,ct as M,d as N,dt as P,en as F,et as te,ft as I,gt as ne,i as L,j as R,k as z,kt as B,l as V,lt as re,m as ie,mt as ae,n as oe,nn as H,o as se,on as ce,ot as le,p as ue,r as de,s as fe,t as pe,tn as U,u as me,ut as W,v as he,vt as ge,wt as _e,y as ve,zt as ye}from"./pageTransition-D7Nke-46.js";import{t as be}from"./UnrealBloomPass-Biq20zSw.js";import{n as xe,t as Se}from"./DRACOLoader-0j4VYCaQ.js";function Ce(e,t=!1){let n=new ue({canvas:e,antialias:!t});n.setPixelRatio(Math.min(window.devicePixelRatio,t?1:2)),n.setSize(window.innerWidth,window.innerHeight),n.toneMapping=4,n.toneMappingExposure=6.5,n.shadowMap.enabled=!t,n.shadowMap.type=2,n.outputColorSpace=ye;let r=new w;r.background=new a(394762),r.fog=new v(394762,.022);let s=new _e(60,window.innerWidth/window.innerHeight,.1,100);s.position.set(0,1.8,8),s.lookAt(0,1.5,0);let c={uTime:{value:0}},l=new P({color:1315864,side:1}),d=new W(new he(20,8,102),l);d.position.set(0,4,-39),d.receiveShadow=!0,r.add(d);let f=new ne({color:2829110,roughness:.85,metalness:.1,emissive:new a(1842214),emissiveIntensity:12.5}),p=new W(new o(20,102),f);p.rotation.x=-Math.PI/2,p.position.set(0,.001,-39),p.receiveShadow=!0,r.add(p);let m=new ie(2109520,75);r.add(m);let h=new C(3162208,526352,55);r.add(h);let g=new u(13162751,30,22,.6,.75,2);g.position.set(0,6,0),g.castShadow=!t,g.shadow.mapSize.set(t?512:1024,t?512:1024),g.shadow.bias=-.002,r.add(g),r.add(g.target);let _=new u(13691135,0,18,.5,.85,2);_.position.set(0,7,-48),_.target.position.set(0,0,-48),_.castShadow=!t,_.shadow.mapSize.set(t?512:1024,t?512:1024),_.shadow.bias=-.002,_.target.updateMatrixWorld(),r.add(_),r.add(_.target);let y=new i(5271728,3e3,30,2);y.position.set(0,5,-83),r.add(y);function b(){s.aspect=window.innerWidth/window.innerHeight,s.updateProjectionMatrix(),n.setSize(window.innerWidth,window.innerHeight)}return window.addEventListener(`resize`,b),{scene:r,renderer:n,camera:s,spotLight:g,armSpot:_,ambient:m,hemi:h,wallUniforms:c,onResize:b}}function we(e,t=!1){let n=new s({uniforms:{uTime:{value:0}},vertexShader:`
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
    `,transparent:!0,blending:2,depthWrite:!1,side:0}),r=new W(t?new o(48,42):new o(32,18),n);return r.position.set(0,t?8:4,-89.5),r.visible=!1,e.add(r),r}function Te(){let e=new s({uniforms:{uColor:{value:new a(1721548)}},vertexShader:`
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
    `,transparent:!0,blending:2,depthWrite:!1,side:2}),t=new W(new o(2,2),e);return t.rotation.x=-Math.PI/2,t}var Ee=class{constructor(e=Math){this.grad3=[[1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],[1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],[0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]],this.grad4=[[0,1,1,1],[0,1,1,-1],[0,1,-1,1],[0,1,-1,-1],[0,-1,1,1],[0,-1,1,-1],[0,-1,-1,1],[0,-1,-1,-1],[1,0,1,1],[1,0,1,-1],[1,0,-1,1],[1,0,-1,-1],[-1,0,1,1],[-1,0,1,-1],[-1,0,-1,1],[-1,0,-1,-1],[1,1,0,1],[1,1,0,-1],[1,-1,0,1],[1,-1,0,-1],[-1,1,0,1],[-1,1,0,-1],[-1,-1,0,1],[-1,-1,0,-1],[1,1,1,0],[1,1,-1,0],[1,-1,1,0],[1,-1,-1,0],[-1,1,1,0],[-1,1,-1,0],[-1,-1,1,0],[-1,-1,-1,0]],this.p=[];for(let t=0;t<256;t++)this.p[t]=Math.floor(e.random()*256);this.perm=[];for(let e=0;e<512;e++)this.perm[e]=this.p[e&255];this.simplex=[[0,1,2,3],[0,1,3,2],[0,0,0,0],[0,2,3,1],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,2,3,0],[0,2,1,3],[0,0,0,0],[0,3,1,2],[0,3,2,1],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,3,2,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,2,0,3],[0,0,0,0],[1,3,0,2],[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,3,0,1],[2,3,1,0],[1,0,2,3],[1,0,3,2],[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,0,3,1],[0,0,0,0],[2,1,3,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,0,1,3],[0,0,0,0],[0,0,0,0],[0,0,0,0],[3,0,1,2],[3,0,2,1],[0,0,0,0],[3,1,2,0],[2,1,0,3],[0,0,0,0],[0,0,0,0],[0,0,0,0],[3,1,0,2],[0,0,0,0],[3,2,0,1],[3,2,1,0]]}noise(e,t){let n,r,i,a=.5*(Math.sqrt(3)-1),o=(e+t)*a,s=Math.floor(e+o),c=Math.floor(t+o),l=(3-Math.sqrt(3))/6,u=(s+c)*l,d=s-u,f=c-u,p=e-d,m=t-f,h,g;p>m?(h=1,g=0):(h=0,g=1);let _=p-h+l,v=m-g+l,y=p-1+2*l,b=m-1+2*l,x=s&255,S=c&255,C=this.perm[x+this.perm[S]]%12,w=this.perm[x+h+this.perm[S+g]]%12,T=this.perm[x+1+this.perm[S+1]]%12,E=.5-p*p-m*m;E<0?n=0:(E*=E,n=E*E*this._dot(this.grad3[C],p,m));let D=.5-_*_-v*v;D<0?r=0:(D*=D,r=D*D*this._dot(this.grad3[w],_,v));let O=.5-y*y-b*b;return O<0?i=0:(O*=O,i=O*O*this._dot(this.grad3[T],y,b)),70*(n+r+i)}noise3d(e,t,n){let r,i,a,o,s=(e+t+n)*(1/3),c=Math.floor(e+s),l=Math.floor(t+s),u=Math.floor(n+s),d=1/6,f=(c+l+u)*d,p=c-f,m=l-f,h=u-f,g=e-p,_=t-m,v=n-h,y,b,x,S,C,w;g>=_?_>=v?(y=1,b=0,x=0,S=1,C=1,w=0):g>=v?(y=1,b=0,x=0,S=1,C=0,w=1):(y=0,b=0,x=1,S=1,C=0,w=1):_<v?(y=0,b=0,x=1,S=0,C=1,w=1):g<v?(y=0,b=1,x=0,S=0,C=1,w=1):(y=0,b=1,x=0,S=1,C=1,w=0);let T=g-y+d,E=_-b+d,D=v-x+d,O=g-S+2*d,ee=_-C+2*d,k=v-w+2*d,A=g-1+3*d,j=_-1+3*d,M=v-1+3*d,N=c&255,P=l&255,F=u&255,te=this.perm[N+this.perm[P+this.perm[F]]]%12,I=this.perm[N+y+this.perm[P+b+this.perm[F+x]]]%12,ne=this.perm[N+S+this.perm[P+C+this.perm[F+w]]]%12,L=this.perm[N+1+this.perm[P+1+this.perm[F+1]]]%12,R=.6-g*g-_*_-v*v;R<0?r=0:(R*=R,r=R*R*this._dot3(this.grad3[te],g,_,v));let z=.6-T*T-E*E-D*D;z<0?i=0:(z*=z,i=z*z*this._dot3(this.grad3[I],T,E,D));let B=.6-O*O-ee*ee-k*k;B<0?a=0:(B*=B,a=B*B*this._dot3(this.grad3[ne],O,ee,k));let V=.6-A*A-j*j-M*M;return V<0?o=0:(V*=V,o=V*V*this._dot3(this.grad3[L],A,j,M)),32*(r+i+a+o)}noise4d(e,t,n,r){let i=this.grad4,a=this.simplex,o=this.perm,s=(Math.sqrt(5)-1)/4,c=(5-Math.sqrt(5))/20,l,u,d,f,p,m=(e+t+n+r)*s,h=Math.floor(e+m),g=Math.floor(t+m),_=Math.floor(n+m),v=Math.floor(r+m),y=(h+g+_+v)*c,b=h-y,x=g-y,S=_-y,C=v-y,w=e-b,T=t-x,E=n-S,D=r-C,O=w>T?32:0,ee=w>E?16:0,k=T>E?8:0,A=w>D?4:0,j=T>D?2:0,M=+(E>D),N=O+ee+k+A+j+M,P=+(a[N][0]>=3),F=+(a[N][1]>=3),te=+(a[N][2]>=3),I=+(a[N][3]>=3),ne=+(a[N][0]>=2),L=+(a[N][1]>=2),R=+(a[N][2]>=2),z=+(a[N][3]>=2),B=+(a[N][0]>=1),V=+(a[N][1]>=1),re=+(a[N][2]>=1),ie=+(a[N][3]>=1),ae=w-P+c,oe=T-F+c,H=E-te+c,se=D-I+c,ce=w-ne+2*c,le=T-L+2*c,ue=E-R+2*c,de=D-z+2*c,fe=w-B+3*c,pe=T-V+3*c,U=E-re+3*c,me=D-ie+3*c,W=w-1+4*c,he=T-1+4*c,ge=E-1+4*c,_e=D-1+4*c,ve=h&255,ye=g&255,be=_&255,xe=v&255,Se=o[ve+o[ye+o[be+o[xe]]]]%32,Ce=o[ve+P+o[ye+F+o[be+te+o[xe+I]]]]%32,we=o[ve+ne+o[ye+L+o[be+R+o[xe+z]]]]%32,Te=o[ve+B+o[ye+V+o[be+re+o[xe+ie]]]]%32,Ee=o[ve+1+o[ye+1+o[be+1+o[xe+1]]]]%32,G=.6-w*w-T*T-E*E-D*D;G<0?l=0:(G*=G,l=G*G*this._dot4(i[Se],w,T,E,D));let K=.6-ae*ae-oe*oe-H*H-se*se;K<0?u=0:(K*=K,u=K*K*this._dot4(i[Ce],ae,oe,H,se));let q=.6-ce*ce-le*le-ue*ue-de*de;q<0?d=0:(q*=q,d=q*q*this._dot4(i[we],ce,le,ue,de));let De=.6-fe*fe-pe*pe-U*U-me*me;De<0?f=0:(De*=De,f=De*De*this._dot4(i[Te],fe,pe,U,me));let J=.6-W*W-he*he-ge*ge-_e*_e;return J<0?p=0:(J*=J,p=J*J*this._dot4(i[Ee],W,he,ge,_e)),27*(l+u+d+f+p)}_dot(e,t,n){return e[0]*t+e[1]*n}_dot3(e,t,n,r){return e[0]*t+e[1]*n+e[2]*r}_dot4(e,t,n,r,i){return e[0]*t+e[1]*n+e[2]*r+e[3]*i}},G={name:`SSAOShader`,defines:{PERSPECTIVE_CAMERA:1,KERNEL_SIZE:32},uniforms:{tNormal:{value:null},tDepth:{value:null},tNoise:{value:null},kernel:{value:null},cameraNear:{value:null},cameraFar:{value:null},resolution:{value:new U},cameraProjectionMatrix:{value:new re},cameraInverseProjectionMatrix:{value:new re},kernelRadius:{value:8},minDistance:{value:.005},maxDistance:{value:.05}},vertexShader:`

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

		}`},K={name:`SSAODepthShader`,defines:{PERSPECTIVE_CAMERA:1},uniforms:{tDepth:{value:null},cameraNear:{value:null},cameraFar:{value:null}},vertexShader:`varying vec2 vUv;

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

		}`},q={name:`SSAOBlurShader`,uniforms:{tDiffuse:{value:null},resolution:{value:new U}},vertexShader:`varying vec2 vUv;

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

		}`},De=class e extends V{constructor(e,r,i=512,o=512,c=32){super(),this.width=i,this.height=o,this.clear=!0,this.needsSwap=!1,this.camera=r,this.scene=e,this.kernelRadius=8,this.kernel=[],this.noiseTexture=null,this.output=0,this.minDistance=.005,this.maxDistance=.1,this._visibilityCache=[],this._generateSampleKernel(c),this._generateRandomKernelRotations();let l=new R;l.format=t,l.type=F,this.normalRenderTarget=new k(this.width,this.height,{minFilter:ge,magFilter:ge,type:n,depthTexture:l}),this.ssaoRenderTarget=new k(this.width,this.height,{type:n}),this.blurRenderTarget=this.ssaoRenderTarget.clone(),this.ssaoMaterial=new s({defines:Object.assign({},G.defines),uniforms:_.clone(G.uniforms),vertexShader:G.vertexShader,fragmentShader:G.fragmentShader,blending:0}),this.ssaoMaterial.defines.KERNEL_SIZE=c,this.ssaoMaterial.uniforms.tNormal.value=this.normalRenderTarget.texture,this.ssaoMaterial.uniforms.tDepth.value=this.normalRenderTarget.depthTexture,this.ssaoMaterial.uniforms.tNoise.value=this.noiseTexture,this.ssaoMaterial.uniforms.kernel.value=this.kernel,this.ssaoMaterial.uniforms.cameraNear.value=this.camera.near,this.ssaoMaterial.uniforms.cameraFar.value=this.camera.far,this.ssaoMaterial.uniforms.resolution.value.set(this.width,this.height),this.ssaoMaterial.uniforms.cameraProjectionMatrix.value.copy(this.camera.projectionMatrix),this.ssaoMaterial.uniforms.cameraInverseProjectionMatrix.value.copy(this.camera.projectionMatrixInverse),this.normalMaterial=new ae,this.normalMaterial.blending=0,this.blurMaterial=new s({defines:Object.assign({},q.defines),uniforms:_.clone(q.uniforms),vertexShader:q.vertexShader,fragmentShader:q.fragmentShader}),this.blurMaterial.uniforms.tDiffuse.value=this.ssaoRenderTarget.texture,this.blurMaterial.uniforms.resolution.value.set(this.width,this.height),this.depthRenderMaterial=new s({defines:Object.assign({},K.defines),uniforms:_.clone(K.uniforms),vertexShader:K.vertexShader,fragmentShader:K.fragmentShader,blending:0}),this.depthRenderMaterial.uniforms.tDepth.value=this.normalRenderTarget.depthTexture,this.depthRenderMaterial.uniforms.cameraNear.value=this.camera.near,this.depthRenderMaterial.uniforms.cameraFar.value=this.camera.far,this.copyMaterial=new s({uniforms:_.clone(me.uniforms),vertexShader:me.vertexShader,fragmentShader:me.fragmentShader,transparent:!0,depthTest:!1,depthWrite:!1,blendSrc:208,blendDst:200,blendEquation:100,blendSrcAlpha:206,blendDstAlpha:200,blendEquationAlpha:100}),this._fsQuad=new j(null),this._originalClearColor=new a}dispose(){this.normalRenderTarget.dispose(),this.ssaoRenderTarget.dispose(),this.blurRenderTarget.dispose(),this.normalMaterial.dispose(),this.blurMaterial.dispose(),this.copyMaterial.dispose(),this.depthRenderMaterial.dispose(),this._fsQuad.dispose()}render(t,n,r){switch(this._overrideVisibility(),this._renderOverride(t,this.normalMaterial,this.normalRenderTarget,7829503,1),this._restoreVisibility(),this.ssaoMaterial.uniforms.kernelRadius.value=this.kernelRadius,this.ssaoMaterial.uniforms.minDistance.value=this.minDistance,this.ssaoMaterial.uniforms.maxDistance.value=this.maxDistance,this._renderPass(t,this.ssaoMaterial,this.ssaoRenderTarget),this._renderPass(t,this.blurMaterial,this.blurRenderTarget),this.output){case e.OUTPUT.SSAO:this.copyMaterial.uniforms.tDiffuse.value=this.ssaoRenderTarget.texture,this.copyMaterial.blending=0,this._renderPass(t,this.copyMaterial,this.renderToScreen?null:r);break;case e.OUTPUT.Blur:this.copyMaterial.uniforms.tDiffuse.value=this.blurRenderTarget.texture,this.copyMaterial.blending=0,this._renderPass(t,this.copyMaterial,this.renderToScreen?null:r);break;case e.OUTPUT.Depth:this._renderPass(t,this.depthRenderMaterial,this.renderToScreen?null:r);break;case e.OUTPUT.Normal:this.copyMaterial.uniforms.tDiffuse.value=this.normalRenderTarget.texture,this.copyMaterial.blending=0,this._renderPass(t,this.copyMaterial,this.renderToScreen?null:r);break;case e.OUTPUT.Default:this.copyMaterial.uniforms.tDiffuse.value=this.blurRenderTarget.texture,this.copyMaterial.blending=5,this._renderPass(t,this.copyMaterial,this.renderToScreen?null:r);break;default:console.warn(`THREE.SSAOPass: Unknown output type.`)}}setSize(e,t){this.width=e,this.height=t,this.ssaoRenderTarget.setSize(e,t),this.normalRenderTarget.setSize(e,t),this.blurRenderTarget.setSize(e,t),this.ssaoMaterial.uniforms.resolution.value.set(e,t),this.ssaoMaterial.uniforms.cameraProjectionMatrix.value.copy(this.camera.projectionMatrix),this.ssaoMaterial.uniforms.cameraInverseProjectionMatrix.value.copy(this.camera.projectionMatrixInverse),this.blurMaterial.uniforms.resolution.value.set(e,t)}_renderPass(e,t,n,r,i){e.getClearColor(this._originalClearColor);let a=e.getClearAlpha(),o=e.autoClear;e.setRenderTarget(n),e.autoClear=!1,r!=null&&(e.setClearColor(r),e.setClearAlpha(i||0),e.clear()),this._fsQuad.material=t,this._fsQuad.render(e),e.autoClear=o,e.setClearColor(this._originalClearColor),e.setClearAlpha(a)}_renderOverride(e,t,n,r,i){e.getClearColor(this._originalClearColor);let a=e.getClearAlpha(),o=e.autoClear;e.setRenderTarget(n),e.autoClear=!1,r=t.clearColor||r,i=t.clearAlpha||i,r!=null&&(e.setClearColor(r),e.setClearAlpha(i||0),e.clear()),this.scene.overrideMaterial=t,e.render(this.scene,this.camera),this.scene.overrideMaterial=null,e.autoClear=o,e.setClearColor(this._originalClearColor),e.setClearAlpha(a)}_generateSampleKernel(e){let t=this.kernel;for(let n=0;n<e;n++){let r=new H;r.x=Math.random()*2-1,r.y=Math.random()*2-1,r.z=Math.random(),r.normalize();let i=n/e;i=M.lerp(.1,1,i*i),r.multiplyScalar(i),t.push(r)}}_generateRandomKernelRotations(){let e=new Ee,t=new Float32Array(16);for(let n=0;n<16;n++){let r=Math.random()*2-1,i=Math.random()*2-1;t[n]=e.noise3d(r,i,0)}this.noiseTexture=new z(t,4,4,f,d),this.noiseTexture.wrapS=y,this.noiseTexture.wrapT=y,this.noiseTexture.needsUpdate=!0}_overrideVisibility(){let e=this.scene,t=this._visibilityCache;e.traverse(function(e){(e.isPoints||e.isLine||e.isLine2)&&e.visible&&(e.visible=!1,t.push(e))})}_restoreVisibility(){let e=this._visibilityCache;for(let t=0;t<e.length;t++)e[t].visible=!0;e.length=0}};De.OUTPUT={Default:0,SSAO:1,Blur:2,Depth:3,Normal:4};var J={name:`BokehShader`,defines:{DEPTH_PACKING:1,PERSPECTIVE_CAMERA:1},uniforms:{tColor:{value:null},tDepth:{value:null},focus:{value:1},aspect:{value:1},aperture:{value:.025},maxblur:{value:.01},nearClip:{value:1},farClip:{value:1e3}},vertexShader:`

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

		}`},Oe=class extends V{constructor(e,t,r){super(),this.scene=e,this.camera=t;let i=r.focus===void 0?1:r.focus,o=r.aperture===void 0?.025:r.aperture,c=r.maxblur===void 0?1:r.maxblur;this._renderTargetDepth=new k(1,1,{minFilter:ge,magFilter:ge,type:n}),this._renderTargetDepth.texture.name=`BokehPass.depth`,this._materialDepth=new I,this._materialDepth.depthPacking=m,this._materialDepth.blending=0;let l=_.clone(J.uniforms);l.tDepth.value=this._renderTargetDepth.texture,l.focus.value=i,l.aspect.value=t.aspect,l.aperture.value=o,l.maxblur.value=c,l.nearClip.value=t.near,l.farClip.value=t.far,this.materialBokeh=new s({defines:Object.assign({},J.defines),uniforms:l,vertexShader:J.vertexShader,fragmentShader:J.fragmentShader}),this.uniforms=l,this._fsQuad=new j(this.materialBokeh),this._oldClearColor=new a}render(e,t,n){this.scene.overrideMaterial=this._materialDepth,e.getClearColor(this._oldClearColor);let r=e.getClearAlpha(),i=e.autoClear;e.autoClear=!1,e.setClearColor(16777215),e.setClearAlpha(1),e.setRenderTarget(this._renderTargetDepth),e.clear(),e.render(this.scene,this.camera),this.uniforms.tColor.value=n.texture,this.uniforms.nearClip.value=this.camera.near,this.uniforms.farClip.value=this.camera.far,this.renderToScreen?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(t),e.clear(),this._fsQuad.render(e)),this.scene.overrideMaterial=null,e.setClearColor(this._oldClearColor),e.setClearAlpha(r),e.autoClear=i}setSize(e,t){this.materialBokeh.uniforms.aspect.value=e/t,this._renderTargetDepth.setSize(e,t)}dispose(){this._renderTargetDepth.dispose(),this._materialDepth.dispose(),this.materialBokeh.dispose(),this._fsQuad.dispose()}},ke={uniforms:{tDiffuse:{value:null},amount:{value:.01}},vertexShader:`
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
  `};function je(e,t,n,r=!1){let i=window.innerWidth,a=window.innerHeight,o=new se(e);o.addPass(new ee(t,n));let s=null,c=null;r||(s=new De(t,n,i,a),s.kernelRadius=8,s.minDistance=.005,s.maxDistance=.1,o.addPass(s));let l=new be(r?new U(i/2,a/2):new U(i,a),r?.18:.25,r?.35:.4,r?.92:.9);o.addPass(l),r||(c=new Oe(t,n,{focus:4,aperture:1e-4,maxblur:.005}),o.addPass(c));let u=null;r||(u=new fe(ke),o.addPass(u));let d=new fe(Ae);return r&&(d.uniforms.uGrainAmp.value=0,d.uniforms.uVignetteAmp.value=0),d.renderToScreen=!0,o.addPass(d),{composer:o,bloom:l,chroma:u,ssao:s,bokeh:c,grainVignette:d,setSize(e,t){o.setSize(e,t),l&&l.setSize(e,t),s&&s.setSize(e,t)}}}var Me=new Se;Me.setDecoderPath(`https://www.gstatic.com/draco/versioned/decoders/1.5.6/`);var Ne=new xe;Ne.setDRACOLoader(Me);function Pe(e){Ne=new xe(e),Ne.setDRACOLoader(Me)}var Fe=new Map;function Ie(e,{onProgress:t}={}){return Fe.has(e)?Promise.resolve(Fe.get(e).clone(!0)):new Promise((n,r)=>{Ne.load(e,t=>{let r=t.scene;r.traverse(e=>{e.isMesh&&(e.castShadow=!0,e.receiveShadow=!0)});let i=new O().setFromObject(r),a=new H;i.getCenter(a),console.log(`[loader] ✓ ${e} | bbox center:`,a.toArray().map(e=>e.toFixed(2))),Fe.set(e,r),n(r.clone(!0))},t,t=>{console.error(`[loader] ✗ ${e}`,t),r(t)})})}var Le=3,Re=`#000000`,ze=2,Be=.75,Ve=`power3.inOut`,He=2.2,Ue=`power2.inOut`,We=180;function Ge(e=16){let t=[],n=[],r=Math.PI/e,i=[[.55,0,0],[.55,.42,0],[.36,.68,r],[.08,1,0],[-.18,.88,r],[-.68,.42,0],[-.98,0,0]],a=[];for(let[n,r,o]of i)if(a.push(t.length/3),r===0)t.push(0,n,0);else for(let i=0;i<e;i++){let a=i/e*Math.PI*2+o;t.push(Math.cos(a)*r,n,Math.sin(a)*r)}for(let t=0;t<i.length-1;t++){let[,r]=i[t],[,o]=i[t+1],s=a[t],c=a[t+1];if(r===0&&o>0)for(let t=0;t<e;t++){let r=(t+1)%e;n.push(s,c+t,c+r)}else if(r>0&&o===0)for(let t=0;t<e;t++){let r=(t+1)%e;n.push(s+t,s+r,c)}else for(let t=0;t<e;t++){let r=(t+1)%e;n.push(s+t,s+r,c+t),n.push(s+r,c+r,c+t)}}let o=new A;return o.setAttribute(`position`,new c(t,3)),o.setIndex(n),o}var Ke=class{constructor({renderer:e,onReveal:t}){this.renderer=e,this._onReveal=t,this.loadingManager=new le,this._realProgress=0,this._displayProgress={value:0},this._loadDone=!1,this._startTime=0,this.scene=new w,this.camera=new _e(38,1,.1,100),this.camera.position.set(0,0,3.9),this.overlay=null,this.frameEl=null,this.counterEl=null,this.diamond=null,this._rafId=null,this._active=!1,this._resize=null}getLoadingManager(){return this.loadingManager}markComplete(){this._realProgress=1,this._loadDone=!0}async run(){this._prevPixelRatio=this.renderer.getPixelRatio();let e=Math.min(window.devicePixelRatio,window.innerWidth<768||`ontouchstart`in window?ze:2);e>this._prevPixelRatio&&(this.renderer.setPixelRatio(e),this.renderer.setSize(window.innerWidth,window.innerHeight,!1)),this._createDOM(),this._createDiamond(),this._bindLoadingManager(),this._startLoop(),await this._runPhase1(),await this._runPhase2(),await this._runPhase3(),this._destroy()}_runPhase1(){return new Promise(e=>{let t=()=>{let n=(performance.now()-this._startTime)/1e3;this._loadDone&&n>=Le?N.to(this._displayProgress,{value:1,duration:.45,ease:`power2.out`,onComplete:()=>{this.counterEl&&(this.counterEl.textContent=`100`),N.delayedCall(.25,e)}}):setTimeout(t,60)};t()})}_runPhase2(){return new Promise(e=>{let t=N.timeline({onComplete:e});t.to(this.diamond.scale,{x:.05,y:.05,z:.05,duration:Be,ease:Ve},0),t.to(this.diamond.material,{opacity:0,duration:Be*.85,ease:`power2.in`},Be*.15),t.to(this.frameEl,{clipPath:`polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%)`,duration:Be,ease:Ve},0),t.to(this.counterEl.parentElement,{scale:.6,opacity:0,duration:Be*.7,ease:`power3.in`},Be*.15)})}_runPhase3(){return new Promise(e=>{this._active=!1,this._rafId&&cancelAnimationFrame(this._rafId),this._prevPixelRatio!=null&&this.renderer.getPixelRatio()!==this._prevPixelRatio&&(this.renderer.setPixelRatio(this._prevPixelRatio),this.renderer.setSize(window.innerWidth,window.innerHeight,!1)),this._onReveal&&this._onReveal();let t=this.overlay,n=Math.hypot(window.innerWidth,window.innerHeight)*.6,r=e=>{let n=`radial-gradient(circle at 50% 50%, transparent ${Math.max(0,e)}px, black ${e+We}px)`;t.style.maskImage=n,t.style.webkitMaskImage=n};r(0);let i={r:0},a=N.timeline({onComplete:()=>N.delayedCall(.05,e)});a.to(i,{r:n,duration:He,ease:Ue,onUpdate:()=>r(i.r)},0),a.to(t,{opacity:0,duration:.75,ease:`power2.out`},He-.55)})}_createDOM(){document.body.classList.add(`holm-loading`);let e=document.createElement(`div`);e.className=`holm-loader`,e.style.setProperty(`--holm-loader-bg`,Re),e.innerHTML=`
      <div class="holm-loader__frame">
        <div class="holm-loader__counter">
          <span class="holm-loader__num">0</span><span class="holm-loader__pct">%</span>
        </div>
      </div>
    `,document.body.appendChild(e),this.overlay=e,this.frameEl=e.querySelector(`.holm-loader__frame`),this.counterEl=e.querySelector(`.holm-loader__num`)}_createDiamond(){let t=Ge(16);t.scale(.85,.98,.85);let n=new p(t,1),r=new E({color:16777215,transparent:!0,opacity:.94});this.diamond=new e(n,r),this.diamond.rotation.x=-.28,this.diamond.scale.setScalar(1/3),this.scene.add(this.diamond),t.dispose(),this._resize=()=>{let e=window.innerWidth/window.innerHeight;this.camera.aspect=e,this.camera.position.z=e<.75?7.4:e<1?5.8:6.2,this.camera.updateProjectionMatrix()},window.addEventListener(`resize`,this._resize),this._resize()}_bindLoadingManager(){this.loadingManager.onProgress=(e,t,n)=>{if(this._loadDone)return;let r=n>0?t/n:0;this._realProgress=Math.max(this._realProgress,r)}}_startLoop(){this._active=!0,this._startTime=performance.now();let e=this._startTime,t=n=>{if(!this._active)return;let r=(n-e)/1e3,i=(n-this._startTime)/1e3;e=n,this._displayProgress.value+=(this._realProgress-this._displayProgress.value)*.06;let a=Math.min(i/Le,1),o=Math.min(this._displayProgress.value,a),s=Math.floor(o*100);this.counterEl&&(this.counterEl.textContent=String(s)),this.diamond.rotation.y+=r*.52,this.diamond.rotation.x=-.28+Math.sin(i*.35)*.05,this.renderer.autoClear=!0,this.renderer.setClearColor(Re,1),this.renderer.render(this.scene,this.camera),this._rafId=requestAnimationFrame(t)};this._rafId=requestAnimationFrame(t)}_destroy(){this._active=!1,document.body.classList.remove(`holm-loading`),this._rafId&&cancelAnimationFrame(this._rafId),this._resize&&window.removeEventListener(`resize`,this._resize),this.diamond&&(this.diamond.geometry.dispose(),this.diamond.material.dispose()),this.overlay?.parentNode&&this.overlay.parentNode.removeChild(this.overlay),this.scene=null,this.camera=null,this.diamond=null,this.overlay=null}},Y=new D,qe=new H,Je=new U,Ye=new U,Xe=new U,Ze=class{constructor(e){this.geometry=e.geometry,this.randomFunction=Math.random,this.indexAttribute=this.geometry.index,this.positionAttribute=this.geometry.getAttribute(`position`),this.normalAttribute=this.geometry.getAttribute(`normal`),this.colorAttribute=this.geometry.getAttribute(`color`),this.uvAttribute=this.geometry.getAttribute(`uv`),this.weightAttribute=null,this.distribution=null}setWeightAttribute(e){return this.weightAttribute=e?this.geometry.getAttribute(e):null,this}build(){let e=this.indexAttribute,t=this.positionAttribute,n=this.weightAttribute,r=e?e.count/3:t.count/3,i=new Float32Array(r);for(let a=0;a<r;a++){let r=1,o=3*a,s=3*a+1,c=3*a+2;e&&(o=e.getX(o),s=e.getX(s),c=e.getX(c)),n&&(r=n.getX(o)+n.getX(s)+n.getX(c)),Y.a.fromBufferAttribute(t,o),Y.b.fromBufferAttribute(t,s),Y.c.fromBufferAttribute(t,c),r*=Y.getArea(),i[a]=r}let a=new Float32Array(r),o=0;for(let e=0;e<r;e++)o+=i[e],a[e]=o;return this.distribution=a,this}setRandomGenerator(e){return this.randomFunction=e,this}sample(e,t,n,r){let i=this._sampleFaceIndex();return this._sampleFace(i,e,t,n,r)}_sampleFaceIndex(){let e=this.distribution[this.distribution.length-1];return this._binarySearch(this.randomFunction()*e)}_binarySearch(e){let t=this.distribution,n=0,r=t.length-1,i=-1;for(;n<=r;){let a=Math.ceil((n+r)/2);if(a===0||t[a-1]<=e&&t[a]>e){i=a;break}else e<t[a]?r=a-1:n=a+1}return i}_sampleFace(e,t,n,r,i){let a=this.randomFunction(),o=this.randomFunction();a+o>1&&(a=1-a,o=1-o);let s=this.indexAttribute,c=e*3,l=e*3+1,u=e*3+2;return s&&(c=s.getX(c),l=s.getX(l),u=s.getX(u)),Y.a.fromBufferAttribute(this.positionAttribute,c),Y.b.fromBufferAttribute(this.positionAttribute,l),Y.c.fromBufferAttribute(this.positionAttribute,u),t.set(0,0,0).addScaledVector(Y.a,a).addScaledVector(Y.b,o).addScaledVector(Y.c,1-(a+o)),n!==void 0&&(this.normalAttribute===void 0?Y.getNormal(n):(Y.a.fromBufferAttribute(this.normalAttribute,c),Y.b.fromBufferAttribute(this.normalAttribute,l),Y.c.fromBufferAttribute(this.normalAttribute,u),n.set(0,0,0).addScaledVector(Y.a,a).addScaledVector(Y.b,o).addScaledVector(Y.c,1-(a+o)).normalize())),r!==void 0&&this.colorAttribute!==void 0&&(Y.a.fromBufferAttribute(this.colorAttribute,c),Y.b.fromBufferAttribute(this.colorAttribute,l),Y.c.fromBufferAttribute(this.colorAttribute,u),qe.set(0,0,0).addScaledVector(Y.a,a).addScaledVector(Y.b,o).addScaledVector(Y.c,1-(a+o)),r.r=qe.x,r.g=qe.y,r.b=qe.z),i!==void 0&&this.uvAttribute!==void 0&&(Je.fromBufferAttribute(this.uvAttribute,c),Ye.fromBufferAttribute(this.uvAttribute,l),Xe.fromBufferAttribute(this.uvAttribute,u),i.set(0,0).addScaledVector(Je,a).addScaledVector(Ye,o).addScaledVector(Xe,1-(a+o))),this}},Qe=.51,$e=.53,et=.56,tt=.55,nt=.57,rt=.58,it=.6,at=.62,ot=.65,st=3.5,ct=8,lt=.04,ut=32,dt=18,ft=22,pt=12,mt=7,ht=new a(2109520),gt=.55;function X(e){let t=Math.max(0,Math.min(1,e));return t*t*(3-2*t)}function _t(e,t,n,r){let i=r?ft:ut,a=r?pt:dt,o=i*a,s=r?mt:ct,c=e.getSize(new U),l=new k(Math.floor(c.x*(r?.7:1)),Math.floor(c.y*(r?.7:1)),{minFilter:te,magFilter:te}),u=1/i,d=1/a,f=new Float32Array(o*4);for(let e=0;e<a;e++)for(let t=0;t<i;t++){let n=e*i+t;f[n*4+0]=t*u,f[n*4+1]=1-(e+1)*d,f[n*4+2]=u,f[n*4+3]=d}let p=new S(f,4),m=new he(1,1,lt);m.setAttribute(`instanceUV`,p);let h={uOpacity:{value:1},uTintColor:{value:ht.clone()},uTintAmount:{value:0}},g=new P({map:l.texture,transparent:!0,depthWrite:!1,side:0});g.onBeforeCompile=e=>{e.uniforms.uOpacity=h.uOpacity,e.uniforms.uTintColor=h.uTintColor,e.uniforms.uTintAmount=h.uTintAmount,e.vertexShader=e.vertexShader.replace(`void main() {`,`attribute vec4 instanceUV;
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
`},g.customProgramCacheKey=()=>`shatter_tile`;let _=new T(m,g,o);_.frustumCulled=!1,_.visible=!1,t.add(_);let v=Array(o),y=Array(o),x=Array(o),C=Array(o).fill(null).map(()=>new H),w=new Float32Array(o*3),E=1,D=1,O=!1,ee=!0,A=new b,j=new H,M=[],N=[],F=[],I=[];function ne(e,t){let n=new Set;e.traverse(e=>{if(!e.isMesh)return;let r=e.material;r&&!n.has(r)&&(n.add(r),t.push(r))})}function L(e,t){for(let n of e)n.opacity=t}function R(){for(let e of N)e.opacity=1;for(let e of M)e.opacity=1;for(let e of F)e.visible=!0;for(let e of I)e.visible=!0}function z(){for(let e of F)e.visible=!1;for(let e of I)e.visible=!1}function B(){n.updateMatrixWorld();let e=n.fov*Math.PI/180,t=Math.tan(e/2)*st,r=t*n.aspect;E=r*2/i,D=t*2/a;let o=new H,s=new H,c=new H;n.getWorldDirection(o),s.setFromMatrixColumn(n.matrixWorld,0),c.setFromMatrixColumn(n.matrixWorld,1);let l=n.position.clone().addScaledVector(o,st);for(let e=0;e<a;e++)for(let n=0;n<i;n++){let o=e*i+n,u=(n+.5)/i*2-1,d=1-(e+.5)/a*2;v[o]=l.clone().addScaledVector(s,u*r).addScaledVector(c,d*t)}}function V(){let e=new H;for(let t=0;t<o;t++)e.set(Math.random()-.5,Math.random()-.5,Math.random()-.5).normalize().multiplyScalar(s*(.4+Math.random()*.6)),C[t].copy(e),w[t*3]=(Math.random()-.5)*Math.PI*2,w[t*3+1]=(Math.random()-.5)*Math.PI*2,w[t*3+2]=(Math.random()-.5)*Math.PI*2}function re(){for(let e=0;e<o;e++)y[e]=v[e].clone().add(C[e])}function ie(e){e.updateMatrixWorld(!0);let t=[];if(e.traverse(e=>{e.isMesh&&e.geometry&&e.geometry.attributes.position&&t.push(e)}),!t.length){console.warn(`[shatter] setSurface: no sampelable meshes found`);return}ne(e,M);for(let e of M)e.transparent=!0,e.opacity=1;let n=new H,r=new H,i=[],a=Math.ceil(o/t.length);for(let e of t){if(i.length>=o)break;let t=new Ze(e).build(),s=Math.min(a,o-i.length);for(let a=0;a<s;a++)t.sample(n,r),i.push(n.clone().applyMatrix4(e.matrixWorld))}for(;i.length<o;)i.push(i[Math.floor(Math.random()*i.length)].clone());for(let e=i.length-1;e>0;e--){let t=Math.floor(Math.random()*(e+1));[i[e],i[t]]=[i[t],i[e]]}for(let e=0;e<o;e++)x[e]=i[e];O=!0,console.log(`[shatter] surface sampled — ${o} pts across ${t.length} mesh(es)`)}function ae(e,t=[]){ne(e,N);for(let e of N)e.transparent=!0,e.opacity=1;for(let e of t)F.push(e);console.log(`[shatter] hero_canvas primed — ${N.length} material(s), ${t.length} extras`)}function oe(e=[]){for(let t of e)I.push(t)}function se(){_.visible=!1,L(N,1),L(M,1);for(let e of F)e.visible=!0;for(let e of I)e.visible=!0;e.setRenderTarget(l),e.render(t,n),e.setRenderTarget(null),_.visible=!0}function ce(){B(),V(),re(),e.setRenderTarget(l),e.render(t,n),e.setRenderTarget(null),h.uOpacity.value=1,h.uTintAmount.value=0,j.set(E,D,lt),A.rotation.set(0,0,0);for(let e=0;e<o;e++)A.position.copy(v[e]),A.scale.copy(j),A.updateMatrix(),_.setMatrixAt(e,A.matrix);_.instanceMatrix.needsUpdate=!0,_.visible=!0}function le(e){let t={bgDark:0,textOpacity:0};if(e<.51||e>.65)return ee||=(_.visible=!1,R(),h.uOpacity.value=1,h.uTintAmount.value=0,!0),t;ee=!1,_.visible||=!0;let n=0,r=0,i=1,a,s,c=0,l=0;if(e<$e){B(),re(),se(),n=0,r=0,a=v,s=y,c=0;let t=X((e-Qe)/($e-Qe)),i=1-t;L(N,i),L(M,i);let o=t>.5;for(let e of F)e.visible=!o;for(let e of I)e.visible=!o;h.uOpacity.value=1,h.uTintAmount.value=0}else if(e<.56){let t=X((e-$e)/(et-$e));n=t,r=t,a=v,s=y,c=t,L(N,0),L(M,0),z(),h.uOpacity.value=1,h.uTintAmount.value=0}else if(e<.6)n=1,r=1,a=v,s=y,c=1,L(N,0),L(M,0),z(),h.uOpacity.value=1,h.uTintAmount.value=0,l=e<.57?X((e-tt)/(nt-tt)):e<.58?1:1-X((e-rt)/(it-rt));else if(!O||e<.62)if(O){let t=X((e-it)/(at-it));n=t,r=1-t,a=y,s=x,c=1-t,L(N,0),L(M,0),z(),h.uOpacity.value=1,h.uTintAmount.value=t*gt}else{let t=(e-it)/(ot-it);n=X(1-t),r=n,a=v,s=y,c=1-X(t)}else{let t=X((e-at)/(ot-at));n=1,r=0,a=x,s=x,i=1-t,c=0,L(N,0),L(M,t);for(let e of I)e.visible=!0;for(let e of F)e.visible=!1;h.uOpacity.value=1-t,h.uTintAmount.value=gt*(1-t)}j.set(E*i,D*i,lt*i);for(let e=0;e<o;e++)A.position.lerpVectors(a[e],s[e],n),A.rotation.set(w[e*3]*r,w[e*3+1]*r,w[e*3+2]*r),A.scale.copy(j),A.updateMatrix(),_.setMatrixAt(e,A.matrix);return _.instanceMatrix.needsUpdate=!0,{bgDark:c,textOpacity:l}}function ue(){t.remove(_),l.dispose(),m.dispose(),g.dispose(),R()}return{capture:ce,update:le,setSurface:ie,setHeroCanvas:ae,setVoidExtras:oe,dispose:ue,mesh:_}}var Z=window.innerWidth<768||`ontouchstart`in window,vt={"hand.glb":`Every brand begins like this.`,"monument.glb":`Something is always missing at the beginning.`,"hero_canvas.glb":`Between sketch and masterpiece, there's patience.`,"void_figure.glb":`What's left unsaid shapes the rest.`,"arm_crystal.glb":`What was missing is held at the end.`};function yt(e){return vt[e]??``}var Q=[{file:`/models/hand.glb`,z:0,scale:3},{file:`/models/monument.glb`,z:-12,scale:.456},{file:`/models/hero_canvas.glb`,z:-24,scale:3},{file:`/models/void_figure.glb`,z:-36,orbitN:Z?36:32},{file:`/models/arm_crystal.glb`,z:-48}].map(e=>({...e,caption:yt(e.file.split(`/`).pop())})),bt=document.getElementById(`scene-canvas`),xt=document.getElementById(`caption`),St=document.getElementById(`gathering-text`);document.querySelector(`.wordmark`);var{scene:Ct,renderer:wt,camera:$,spotLight:Tt,armSpot:Et,ambient:Dt,hemi:Ot,wallUniforms:kt,onResize:At}=Ce(bt,Z),jt=75,Mt=55,Nt=900,Pt=-48,Ft=30,It=je(wt,Ct,$,Z),Lt=0,Rt=we(Ct,Z),zt=Z?null:_t(wt,Ct,$,Z),Bt=!1,Vt=1.8,Ht=Z?5:4,Ut=Z?16:32;function Wt(){let e=[],t=Vt,n=Ht;e.push(new H(0,t,10)),e.push(new H(0,t,7)),Q.forEach((r,i)=>{let a=r.z,o=r.orbitN??Ut;for(let r=0;r<=o;r++){let i=r/o*Math.PI*2;e.push(new H(Math.sin(i)*n,t,a+Math.cos(i)*n))}if(i<Q.length-1){let r=Q[i+1].z;e.push(new H(n*1.5,t,a)),e.push(new H(n*.8,t,a-n-1)),e.push(new H(0,t,r+n+1))}});let i=Q[Q.length-1].z;return e.push(new H(n*1.2,t,i)),e.push(new H(0,t,i-n-2)),e.push(new H(0,t,i-20)),e.push(new H(0,t,i-28)),new r(e,!1,`catmullrom`,.5)}var Gt=Wt(),Kt=0,qt=0,Jt=new H,Yt=new H(0,1.5,0),Xt=new H(0,1.5,0),Zt=new H(0,6,0),Qt=new H(0,.5,0),$t=null;function en(e){if(e!==$t){if($t=e,N.killTweensOf(xt),!e){N.to(xt,{opacity:0,duration:.3});return}N.to(xt,{opacity:0,duration:.25,ease:`power2.in`,onComplete(){xt.textContent=e,N.to(xt,{opacity:1,duration:.5,ease:`power2.out`})}})}}function tn(e){let t=1/0,n=null;for(let r of Q){let i=Math.hypot(e.x,e.z-r.z);i<t&&(t=i,n=r)}return{def:n,dist:t}}var nn=new l,rn=new U(-9,-9),an=new x,on=[],sn=null;bt.addEventListener(`pointermove`,e=>{rn.x=e.clientX/window.innerWidth*2-1,rn.y=-(e.clientY/window.innerHeight)*2+1}),bt.addEventListener(`pointerleave`,()=>rn.set(-9,-9));var cn=null,ln=null,un=null,dn=null,fn=600;function pn(){cn=new A,ln=new Float32Array(fn*3),un=new Float32Array(fn*3);for(let e=0;e<fn;e++){let t=(Math.random()-.5)*16,n=Math.random()*7,r=5-Math.random()*65;ln[e*3]=un[e*3]=t,ln[e*3+1]=un[e*3+1]=n,ln[e*3+2]=un[e*3+2]=r}cn.setAttribute(`position`,new ve(ln,3));let e=new B({size:.015,color:8425664,transparent:!0,opacity:.35,depthWrite:!1});dn=new g(cn,e),Ct.add(dn)}function mn(e){if(!cn)return;let t=cn.attributes.position;for(let n=0;n<fn;n++){let r=n*3;t.array[r+1]+=.001,t.array[r+0]=un[r]+Math.sin(e*.3+n*.17)*.08,t.array[r+2]=un[r+2]+Math.cos(e*.2+n*.13)*.05,t.array[r+1]>7&&(t.array[r+1]=0,un[r+1]=0)}t.needsUpdate=!0}var hn=[155,255,390,580,1190],gn=new ne({color:855311,roughness:.9,metalness:.1});async function _n(e,t){try{let n=await Ie(e.file);e.scale&&n.scale.setScalar(e.scale),n.updateMatrixWorld(!0);let r=new O().setFromObject(n),a=isFinite(r.min.x)?(r.min.x+r.max.x)/2:0,o=isFinite(r.min.z)?(r.min.z+r.max.z)/2:0,s=isFinite(r.min.y)?-r.min.y+.3:.3;n.position.set(-a,s,e.z-o),n.traverse(t=>{if(t.isMesh&&(t.castShadow=t.receiveShadow=!Z,!Z)){let n=t.material.clone(),r={uTime:{value:0},uIntensity:{value:0}};n.onBeforeCompile=e=>{e.uniforms.uTime=r.uTime,e.uniforms.uIntensity=r.uIntensity,e.vertexShader=`uniform float uTime;
uniform float uIntensity;
`+e.vertexShader.replace(`#include <begin_vertex>`,`#include <begin_vertex>
               float _w = sin(position.x * 4.0 + uTime * 1.3)
                        * sin(position.y * 3.5 + uTime * 0.9)
                        * 0.015 * uIntensity;
               transformed += normal * _w;`)},n.customProgramCacheKey=()=>`holm_distort`,t.material=n,on.push({mesh:t,uniforms:r,defZ:e.z})}}),Ct.add(n);let c=new W(new h(.4,.5,.3,32),gn);c.position.set(0,.15,e.z),c.castShadow=c.receiveShadow=!0,Ct.add(c);let l=Te();l.position.set(0,.02,e.z),Ct.add(l),e.file.includes(`void_figure`)&&(zt?.setSurface(n),zt?.setVoidExtras([c,l])),e.file.includes(`hero_canvas`)&&zt?.setHeroCanvas(n,[c,l]);let u=new i(13691135,hn[t]??500,16,2);u.position.set(0,6.5,e.z),Ct.add(u),console.log(`[HOLM] ✓ ${e.file} @ z=${e.z}`)}catch(t){console.error(`[HOLM] ✗ ${e.file}`,t)}}var vn=!1,yn=document.getElementById(`projection-overlay`);function bn(){Rt.visible=!0,yn.classList.add(`active`),N.to(yn,{opacity:1,duration:1.2,ease:`power2.out`});let e=yn.querySelectorAll(`.proj-line`);N.fromTo(e,{opacity:0,y:12},{opacity:1,y:0,duration:1,stagger:.4,delay:.4,ease:`power2.out`}),N.fromTo(yn.querySelector(`.proj-cta`),{opacity:0,y:8},{opacity:1,y:0,duration:1,delay:2.6,ease:`power2.out`})}function xn(){N.to(yn,{opacity:0,duration:.5,onComplete:()=>{yn.classList.remove(`active`),Rt.visible=!1,N.set(`.proj-line, .proj-cta`,{opacity:0,y:0})}})}var Sn=new ce(Z?{smoothTouch:!1,touchMultiplier:.65}:{duration:4,smoothWheel:!0,wheelMultiplier:.28,touchMultiplier:1.2,smoothTouch:!1});N.ticker.lagSmoothing(0),de(document);var Cn=(()=>{try{return sessionStorage.getItem(`holm:transition`)===`1`}catch{return!1}})();pe(),new L({lenis:Sn}).mount(),de(document);var wn=document.getElementById(`book-call`);wn&&(wn.style.display=`none`),Sn.on(`scroll`,({scroll:e,limit:t})=>{Kt=t>0?e/t:0});function Tn(e=0){requestAnimationFrame(Tn),Sn.raf(e);let t=an.getElapsedTime();if(!Z){nn.setFromCamera(rn,$);let e=nn.intersectObjects(on.map(e=>e.mesh),!1);sn=e.length>0?on.find(t=>t.mesh===e[0].object)?.defZ??null:null;for(let e of on){e.uniforms.uTime.value=t;let n=+(e.defZ===sn),r=e.uniforms.uIntensity;r.value+=(n-r.value)*.12,r.value<.001&&(r.value=0)}}Z?(qt+=(Kt-qt)*.18,Jt.copy(Gt.getPoint(qt)),$.position.copy(Jt)):(Jt.copy(Gt.getPoint(Kt)),$.position.lerp(Jt,.07));let{def:n,dist:r}=tn($.position),i=n&&r<Ht+1.5,a=$.position.z<-56,o=$.position.z<-68;if(a)Yt.set(0,4,-89.5),Zt.set(0,7,$.position.z),Qt.set(0,3.5,-89.5),en(``),Rt.material.uniforms.uTime.value=t,o&&!vn&&(vn=!0,bn()),!o&&vn&&(vn=!1,xn());else if(i)Yt.set(0,1.5,n.z),Zt.set(0,6,n.z),Qt.set(0,.5,n.z),en(n.caption),vn&&(vn=!1,xn());else{let e=Q.find(e=>e.z<$.position.z-1);Yt.set(0,1.5,e?e.z:$.position.z-10),Zt.set(0,6,$.position.z-3),Qt.set(0,.5,$.position.z-8),r>Ht*3&&en(``),vn&&(vn=!1,xn()),Rt.visible=!1}Xt.lerp(Yt,.07),$.lookAt(Xt),Tt.position.lerp(Zt,.05),Tt.target.position.lerp(Qt,.05),Tt.target.updateMatrixWorld();let s=Math.hypot($.position.x,$.position.z-Pt);Et.intensity+=((s<Ht+3?Nt:0)-Et.intensity)*.1,It.bokeh&&(It.bokeh.uniforms.focus.value=r),It.grainVignette&&(It.grainVignette.uniforms.uTime.value=t),kt.uTime.value=t,Z||mn(t);let c=0,l=0;if(zt){let e=Kt;e>=.51&&e<=.65&&!Bt&&(Bt=!0,zt.capture()),e<.46&&(Bt=!1);let t=zt.update(e);c=t.bgDark,l=t.textOpacity}let u=(1-c*.92)*Lt;Dt.intensity=jt*u,Ot.intensity=Mt*u,Tt.intensity=Ft*Math.max(u,.12*Lt),St&&(St.style.opacity=l),l>.01&&en(``),It.composer.render()}window.addEventListener(`resize`,()=>{At(),It.setSize(window.innerWidth,window.innerHeight)});async function En(){let e=Gt.getPoint(0);$.position.copy(e),$.position.z+=3,Xt.set(0,1.5,Q[0].z),$.lookAt(Xt);let t=!1,n=()=>{if(t)return;t=!0,requestAnimationFrame(Tn);let n={v:0};N.to(n,{v:1,duration:4.2,ease:`power2.out`,onUpdate:()=>{Lt=n.v}}),N.to($.position,{z:e.z,duration:3.8,ease:`power2.out`}),N.to(xt,{opacity:1,duration:1.4,delay:2.4,ease:`power2.out`});let r=document.getElementById(`holm-teaser`);if(r){r.setAttribute(`aria-hidden`,`false`),N.fromTo(r,{opacity:0,y:12},{opacity:1,y:0,duration:1.2,delay:1.6,ease:`power2.out`});let e=()=>{N.to(r,{opacity:0,duration:.8,ease:`power2.out`,onComplete:()=>r.setAttribute(`aria-hidden`,`true`)}),window.removeEventListener(`wheel`,t,{passive:!0}),window.removeEventListener(`touchmove`,t,{passive:!0}),clearTimeout(n)},t=()=>{window.scrollY>20&&e()},n=setTimeout(e,7e3);window.addEventListener(`wheel`,t,{passive:!0}),window.addEventListener(`touchmove`,t,{passive:!0})}};if(Cn){Pe(new le);for(let e=0;e<Q.length;e++)await _n(Q[e],e);Z||pn(),n(),oe()}else{let e=new Ke({renderer:wt,onReveal:n});Pe(e.getLoadingManager());let t=e.run();for(let e=0;e<Q.length;e++)await _n(Q[e],e);Z||pn(),e.markComplete(),await t}let r=document.querySelector(`.proj-cta`);r&&(r.addEventListener(`mousemove`,e=>{let t=r.getBoundingClientRect(),n=(e.clientX-t.left-t.width*.5)/t.width,i=(e.clientY-t.top-t.height*.5)/t.height;N.to(r,{x:n*14,y:i*9,duration:.35,ease:`power2.out`})}),r.addEventListener(`mouseleave`,()=>N.to(r,{x:0,y:0,duration:.7,ease:`elastic.out(1, 0.45)`})))}En();