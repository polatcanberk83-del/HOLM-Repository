import{$ as e,A as t,B as n,C as r,Ct as i,Dt as a,E as o,Et as s,Ht as c,I as l,Jt as u,L as d,Lt as f,N as p,Nt as m,O as h,Ot as g,Pt as _,Qt as v,R as y,Rt as b,St as x,T as S,U as C,V as w,Vt as T,W as E,Z as D,Zt as O,_ as k,a as A,an as j,b as M,c as N,ct as P,d as F,dt as ee,en as I,et as te,ft as ne,gt as L,i as R,j as z,k as B,kt as V,l as re,lt as ie,m as ae,mt as oe,n as se,nn as H,o as ce,on as le,ot as ue,p as de,r as fe,s as pe,t as me,tn as U,u as he,ut as W,v as ge,vt as _e,wt as ve,y as ye,zt as be}from"./pageTransition-D7Nke-46.js";import{t as xe}from"./UnrealBloomPass-Biq20zSw.js";import{n as Se,t as Ce}from"./DRACOLoader-0j4VYCaQ.js";function we(e,t=!1){let n=new de({canvas:e,antialias:!t});n.setPixelRatio(Math.min(window.devicePixelRatio,t?1:2)),n.setSize(window.innerWidth,window.innerHeight),n.toneMapping=4,n.toneMappingExposure=6.5,n.shadowMap.enabled=!t,n.shadowMap.type=2,n.outputColorSpace=be;let r=new T;r.background=new o(394762),r.fog=new y(394762,.022);let i=new ve(60,window.innerWidth/window.innerHeight,.1,100);i.position.set(0,1.8,8),i.lookAt(0,1.5,0);let c={uTime:{value:0}},l=new ee({color:1315864,side:1}),d=new W(new ge(20,8,102),l);d.position.set(0,4,-39),d.receiveShadow=!0,r.add(d);let f=new L({color:2829110,roughness:.85,metalness:.1,emissive:new o(1842214),emissiveIntensity:12.5}),p=new W(new s(20,102),f);p.rotation.x=-Math.PI/2,p.position.set(0,.001,-39),p.receiveShadow=!0,r.add(p);let m=new ae(2109520,75);r.add(m);let h=new w(3162208,526352,55);r.add(h);let g=new u(13162751,30,22,.6,.75,2);g.position.set(0,6,0),g.castShadow=!t,g.shadow.mapSize.set(t?512:1024,t?512:1024),g.shadow.bias=-.002,r.add(g),r.add(g.target);let _=new u(13691135,0,18,.5,.85,2);_.position.set(0,7,-48),_.target.position.set(0,0,-48),_.castShadow=!t,_.shadow.mapSize.set(t?512:1024,t?512:1024),_.shadow.bias=-.002,_.target.updateMatrixWorld(),r.add(_),r.add(_.target);let v=new a(5271728,3e3,30,2);v.position.set(0,5,-83),r.add(v);function b(){i.aspect=window.innerWidth/window.innerHeight,i.updateProjectionMatrix(),n.setSize(window.innerWidth,window.innerHeight)}return window.addEventListener(`resize`,b),{scene:r,renderer:n,camera:i,spotLight:g,armSpot:_,ambient:m,hemi:h,wallUniforms:c,onResize:b}}function Te(e,t=!1){let n=new c({uniforms:{uTime:{value:0}},vertexShader:`
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
    `,transparent:!0,blending:2,depthWrite:!1,side:0}),r=new W(t?new s(48,42):new s(32,18),n);return r.position.set(0,t?8:4,-89.5),r.visible=!1,e.add(r),r}function Ee(){let e=new c({uniforms:{uColor:{value:new o(1721548)}},vertexShader:`
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
    `,transparent:!0,blending:2,depthWrite:!1,side:2}),t=new W(new s(2,2),e);return t.rotation.x=-Math.PI/2,t}var De=class{constructor(e=Math){this.grad3=[[1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],[1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],[0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]],this.grad4=[[0,1,1,1],[0,1,1,-1],[0,1,-1,1],[0,1,-1,-1],[0,-1,1,1],[0,-1,1,-1],[0,-1,-1,1],[0,-1,-1,-1],[1,0,1,1],[1,0,1,-1],[1,0,-1,1],[1,0,-1,-1],[-1,0,1,1],[-1,0,1,-1],[-1,0,-1,1],[-1,0,-1,-1],[1,1,0,1],[1,1,0,-1],[1,-1,0,1],[1,-1,0,-1],[-1,1,0,1],[-1,1,0,-1],[-1,-1,0,1],[-1,-1,0,-1],[1,1,1,0],[1,1,-1,0],[1,-1,1,0],[1,-1,-1,0],[-1,1,1,0],[-1,1,-1,0],[-1,-1,1,0],[-1,-1,-1,0]],this.p=[];for(let t=0;t<256;t++)this.p[t]=Math.floor(e.random()*256);this.perm=[];for(let e=0;e<512;e++)this.perm[e]=this.p[e&255];this.simplex=[[0,1,2,3],[0,1,3,2],[0,0,0,0],[0,2,3,1],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,2,3,0],[0,2,1,3],[0,0,0,0],[0,3,1,2],[0,3,2,1],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,3,2,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,2,0,3],[0,0,0,0],[1,3,0,2],[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,3,0,1],[2,3,1,0],[1,0,2,3],[1,0,3,2],[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,0,3,1],[0,0,0,0],[2,1,3,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,0,1,3],[0,0,0,0],[0,0,0,0],[0,0,0,0],[3,0,1,2],[3,0,2,1],[0,0,0,0],[3,1,2,0],[2,1,0,3],[0,0,0,0],[0,0,0,0],[0,0,0,0],[3,1,0,2],[0,0,0,0],[3,2,0,1],[3,2,1,0]]}noise(e,t){let n,r,i,a=.5*(Math.sqrt(3)-1),o=(e+t)*a,s=Math.floor(e+o),c=Math.floor(t+o),l=(3-Math.sqrt(3))/6,u=(s+c)*l,d=s-u,f=c-u,p=e-d,m=t-f,h,g;p>m?(h=1,g=0):(h=0,g=1);let _=p-h+l,v=m-g+l,y=p-1+2*l,b=m-1+2*l,x=s&255,S=c&255,C=this.perm[x+this.perm[S]]%12,w=this.perm[x+h+this.perm[S+g]]%12,T=this.perm[x+1+this.perm[S+1]]%12,E=.5-p*p-m*m;E<0?n=0:(E*=E,n=E*E*this._dot(this.grad3[C],p,m));let D=.5-_*_-v*v;D<0?r=0:(D*=D,r=D*D*this._dot(this.grad3[w],_,v));let O=.5-y*y-b*b;return O<0?i=0:(O*=O,i=O*O*this._dot(this.grad3[T],y,b)),70*(n+r+i)}noise3d(e,t,n){let r,i,a,o,s=(e+t+n)*(1/3),c=Math.floor(e+s),l=Math.floor(t+s),u=Math.floor(n+s),d=1/6,f=(c+l+u)*d,p=c-f,m=l-f,h=u-f,g=e-p,_=t-m,v=n-h,y,b,x,S,C,w;g>=_?_>=v?(y=1,b=0,x=0,S=1,C=1,w=0):g>=v?(y=1,b=0,x=0,S=1,C=0,w=1):(y=0,b=0,x=1,S=1,C=0,w=1):_<v?(y=0,b=0,x=1,S=0,C=1,w=1):g<v?(y=0,b=1,x=0,S=0,C=1,w=1):(y=0,b=1,x=0,S=1,C=1,w=0);let T=g-y+d,E=_-b+d,D=v-x+d,O=g-S+2*d,k=_-C+2*d,A=v-w+2*d,j=g-1+3*d,M=_-1+3*d,N=v-1+3*d,P=c&255,F=l&255,ee=u&255,I=this.perm[P+this.perm[F+this.perm[ee]]]%12,te=this.perm[P+y+this.perm[F+b+this.perm[ee+x]]]%12,ne=this.perm[P+S+this.perm[F+C+this.perm[ee+w]]]%12,L=this.perm[P+1+this.perm[F+1+this.perm[ee+1]]]%12,R=.6-g*g-_*_-v*v;R<0?r=0:(R*=R,r=R*R*this._dot3(this.grad3[I],g,_,v));let z=.6-T*T-E*E-D*D;z<0?i=0:(z*=z,i=z*z*this._dot3(this.grad3[te],T,E,D));let B=.6-O*O-k*k-A*A;B<0?a=0:(B*=B,a=B*B*this._dot3(this.grad3[ne],O,k,A));let V=.6-j*j-M*M-N*N;return V<0?o=0:(V*=V,o=V*V*this._dot3(this.grad3[L],j,M,N)),32*(r+i+a+o)}noise4d(e,t,n,r){let i=this.grad4,a=this.simplex,o=this.perm,s=(Math.sqrt(5)-1)/4,c=(5-Math.sqrt(5))/20,l,u,d,f,p,m=(e+t+n+r)*s,h=Math.floor(e+m),g=Math.floor(t+m),_=Math.floor(n+m),v=Math.floor(r+m),y=(h+g+_+v)*c,b=h-y,x=g-y,S=_-y,C=v-y,w=e-b,T=t-x,E=n-S,D=r-C,O=w>T?32:0,k=w>E?16:0,A=T>E?8:0,j=w>D?4:0,M=T>D?2:0,N=+(E>D),P=O+k+A+j+M+N,F=+(a[P][0]>=3),ee=+(a[P][1]>=3),I=+(a[P][2]>=3),te=+(a[P][3]>=3),ne=+(a[P][0]>=2),L=+(a[P][1]>=2),R=+(a[P][2]>=2),z=+(a[P][3]>=2),B=+(a[P][0]>=1),V=+(a[P][1]>=1),re=+(a[P][2]>=1),ie=+(a[P][3]>=1),ae=w-F+c,oe=T-ee+c,se=E-I+c,H=D-te+c,ce=w-ne+2*c,le=T-L+2*c,ue=E-R+2*c,de=D-z+2*c,fe=w-B+3*c,pe=T-V+3*c,me=E-re+3*c,U=D-ie+3*c,he=w-1+4*c,W=T-1+4*c,ge=E-1+4*c,_e=D-1+4*c,ve=h&255,ye=g&255,be=_&255,xe=v&255,Se=o[ve+o[ye+o[be+o[xe]]]]%32,Ce=o[ve+F+o[ye+ee+o[be+I+o[xe+te]]]]%32,we=o[ve+ne+o[ye+L+o[be+R+o[xe+z]]]]%32,Te=o[ve+B+o[ye+V+o[be+re+o[xe+ie]]]]%32,Ee=o[ve+1+o[ye+1+o[be+1+o[xe+1]]]]%32,De=.6-w*w-T*T-E*E-D*D;De<0?l=0:(De*=De,l=De*De*this._dot4(i[Se],w,T,E,D));let G=.6-ae*ae-oe*oe-se*se-H*H;G<0?u=0:(G*=G,u=G*G*this._dot4(i[Ce],ae,oe,se,H));let K=.6-ce*ce-le*le-ue*ue-de*de;K<0?d=0:(K*=K,d=K*K*this._dot4(i[we],ce,le,ue,de));let q=.6-fe*fe-pe*pe-me*me-U*U;q<0?f=0:(q*=q,f=q*q*this._dot4(i[Te],fe,pe,me,U));let Oe=.6-he*he-W*W-ge*ge-_e*_e;return Oe<0?p=0:(Oe*=Oe,p=Oe*Oe*this._dot4(i[Ee],he,W,ge,_e)),27*(l+u+d+f+p)}_dot(e,t,n){return e[0]*t+e[1]*n}_dot3(e,t,n,r){return e[0]*t+e[1]*n+e[2]*r}_dot4(e,t,n,r,i){return e[0]*t+e[1]*n+e[2]*r+e[3]*i}},G={name:`SSAOShader`,defines:{PERSPECTIVE_CAMERA:1,KERNEL_SIZE:32},uniforms:{tNormal:{value:null},tDepth:{value:null},tNoise:{value:null},kernel:{value:null},cameraNear:{value:null},cameraFar:{value:null},resolution:{value:new U},cameraProjectionMatrix:{value:new ie},cameraInverseProjectionMatrix:{value:new ie},kernelRadius:{value:8},minDistance:{value:.005},maxDistance:{value:.05}},vertexShader:`

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

		}`},Oe=class e extends re{constructor(e,r,i=512,a=512,s=32){super(),this.width=i,this.height=a,this.clear=!0,this.needsSwap=!1,this.camera=r,this.scene=e,this.kernelRadius=8,this.kernel=[],this.noiseTexture=null,this.output=0,this.minDistance=.005,this.maxDistance=.1,this._visibilityCache=[],this._generateSampleKernel(s),this._generateRandomKernelRotations();let l=new z;l.format=t,l.type=I,this.normalRenderTarget=new j(this.width,this.height,{minFilter:_e,magFilter:_e,type:n,depthTexture:l}),this.ssaoRenderTarget=new j(this.width,this.height,{type:n}),this.blurRenderTarget=this.ssaoRenderTarget.clone(),this.ssaoMaterial=new c({defines:Object.assign({},G.defines),uniforms:v.clone(G.uniforms),vertexShader:G.vertexShader,fragmentShader:G.fragmentShader,blending:0}),this.ssaoMaterial.defines.KERNEL_SIZE=s,this.ssaoMaterial.uniforms.tNormal.value=this.normalRenderTarget.texture,this.ssaoMaterial.uniforms.tDepth.value=this.normalRenderTarget.depthTexture,this.ssaoMaterial.uniforms.tNoise.value=this.noiseTexture,this.ssaoMaterial.uniforms.kernel.value=this.kernel,this.ssaoMaterial.uniforms.cameraNear.value=this.camera.near,this.ssaoMaterial.uniforms.cameraFar.value=this.camera.far,this.ssaoMaterial.uniforms.resolution.value.set(this.width,this.height),this.ssaoMaterial.uniforms.cameraProjectionMatrix.value.copy(this.camera.projectionMatrix),this.ssaoMaterial.uniforms.cameraInverseProjectionMatrix.value.copy(this.camera.projectionMatrixInverse),this.normalMaterial=new oe,this.normalMaterial.blending=0,this.blurMaterial=new c({defines:Object.assign({},q.defines),uniforms:v.clone(q.uniforms),vertexShader:q.vertexShader,fragmentShader:q.fragmentShader}),this.blurMaterial.uniforms.tDiffuse.value=this.ssaoRenderTarget.texture,this.blurMaterial.uniforms.resolution.value.set(this.width,this.height),this.depthRenderMaterial=new c({defines:Object.assign({},K.defines),uniforms:v.clone(K.uniforms),vertexShader:K.vertexShader,fragmentShader:K.fragmentShader,blending:0}),this.depthRenderMaterial.uniforms.tDepth.value=this.normalRenderTarget.depthTexture,this.depthRenderMaterial.uniforms.cameraNear.value=this.camera.near,this.depthRenderMaterial.uniforms.cameraFar.value=this.camera.far,this.copyMaterial=new c({uniforms:v.clone(he.uniforms),vertexShader:he.vertexShader,fragmentShader:he.fragmentShader,transparent:!0,depthTest:!1,depthWrite:!1,blendSrc:208,blendDst:200,blendEquation:100,blendSrcAlpha:206,blendDstAlpha:200,blendEquationAlpha:100}),this._fsQuad=new N(null),this._originalClearColor=new o}dispose(){this.normalRenderTarget.dispose(),this.ssaoRenderTarget.dispose(),this.blurRenderTarget.dispose(),this.normalMaterial.dispose(),this.blurMaterial.dispose(),this.copyMaterial.dispose(),this.depthRenderMaterial.dispose(),this._fsQuad.dispose()}render(t,n,r){switch(this._overrideVisibility(),this._renderOverride(t,this.normalMaterial,this.normalRenderTarget,7829503,1),this._restoreVisibility(),this.ssaoMaterial.uniforms.kernelRadius.value=this.kernelRadius,this.ssaoMaterial.uniforms.minDistance.value=this.minDistance,this.ssaoMaterial.uniforms.maxDistance.value=this.maxDistance,this._renderPass(t,this.ssaoMaterial,this.ssaoRenderTarget),this._renderPass(t,this.blurMaterial,this.blurRenderTarget),this.output){case e.OUTPUT.SSAO:this.copyMaterial.uniforms.tDiffuse.value=this.ssaoRenderTarget.texture,this.copyMaterial.blending=0,this._renderPass(t,this.copyMaterial,this.renderToScreen?null:r);break;case e.OUTPUT.Blur:this.copyMaterial.uniforms.tDiffuse.value=this.blurRenderTarget.texture,this.copyMaterial.blending=0,this._renderPass(t,this.copyMaterial,this.renderToScreen?null:r);break;case e.OUTPUT.Depth:this._renderPass(t,this.depthRenderMaterial,this.renderToScreen?null:r);break;case e.OUTPUT.Normal:this.copyMaterial.uniforms.tDiffuse.value=this.normalRenderTarget.texture,this.copyMaterial.blending=0,this._renderPass(t,this.copyMaterial,this.renderToScreen?null:r);break;case e.OUTPUT.Default:this.copyMaterial.uniforms.tDiffuse.value=this.blurRenderTarget.texture,this.copyMaterial.blending=5,this._renderPass(t,this.copyMaterial,this.renderToScreen?null:r);break;default:console.warn(`THREE.SSAOPass: Unknown output type.`)}}setSize(e,t){this.width=e,this.height=t,this.ssaoRenderTarget.setSize(e,t),this.normalRenderTarget.setSize(e,t),this.blurRenderTarget.setSize(e,t),this.ssaoMaterial.uniforms.resolution.value.set(e,t),this.ssaoMaterial.uniforms.cameraProjectionMatrix.value.copy(this.camera.projectionMatrix),this.ssaoMaterial.uniforms.cameraInverseProjectionMatrix.value.copy(this.camera.projectionMatrixInverse),this.blurMaterial.uniforms.resolution.value.set(e,t)}_renderPass(e,t,n,r,i){e.getClearColor(this._originalClearColor);let a=e.getClearAlpha(),o=e.autoClear;e.setRenderTarget(n),e.autoClear=!1,r!=null&&(e.setClearColor(r),e.setClearAlpha(i||0),e.clear()),this._fsQuad.material=t,this._fsQuad.render(e),e.autoClear=o,e.setClearColor(this._originalClearColor),e.setClearAlpha(a)}_renderOverride(e,t,n,r,i){e.getClearColor(this._originalClearColor);let a=e.getClearAlpha(),o=e.autoClear;e.setRenderTarget(n),e.autoClear=!1,r=t.clearColor||r,i=t.clearAlpha||i,r!=null&&(e.setClearColor(r),e.setClearAlpha(i||0),e.clear()),this.scene.overrideMaterial=t,e.render(this.scene,this.camera),this.scene.overrideMaterial=null,e.autoClear=o,e.setClearColor(this._originalClearColor),e.setClearAlpha(a)}_generateSampleKernel(e){let t=this.kernel;for(let n=0;n<e;n++){let r=new H;r.x=Math.random()*2-1,r.y=Math.random()*2-1,r.z=Math.random(),r.normalize();let i=n/e;i=P.lerp(.1,1,i*i),r.multiplyScalar(i),t.push(r)}}_generateRandomKernelRotations(){let e=new De,t=new Float32Array(16);for(let n=0;n<16;n++){let r=Math.random()*2-1,i=Math.random()*2-1;t[n]=e.noise3d(r,i,0)}this.noiseTexture=new B(t,4,4,f,d),this.noiseTexture.wrapS=b,this.noiseTexture.wrapT=b,this.noiseTexture.needsUpdate=!0}_overrideVisibility(){let e=this.scene,t=this._visibilityCache;e.traverse(function(e){(e.isPoints||e.isLine||e.isLine2)&&e.visible&&(e.visible=!1,t.push(e))})}_restoreVisibility(){let e=this._visibilityCache;for(let t=0;t<e.length;t++)e[t].visible=!0;e.length=0}};Oe.OUTPUT={Default:0,SSAO:1,Blur:2,Depth:3,Normal:4};var ke={name:`BokehShader`,defines:{DEPTH_PACKING:1,PERSPECTIVE_CAMERA:1},uniforms:{tColor:{value:null},tDepth:{value:null},focus:{value:1},aspect:{value:1},aperture:{value:.025},maxblur:{value:.01},nearClip:{value:1},farClip:{value:1e3}},vertexShader:`

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

		}`},Ae=class extends re{constructor(e,t,r){super(),this.scene=e,this.camera=t;let i=r.focus===void 0?1:r.focus,a=r.aperture===void 0?.025:r.aperture,s=r.maxblur===void 0?1:r.maxblur;this._renderTargetDepth=new j(1,1,{minFilter:_e,magFilter:_e,type:n}),this._renderTargetDepth.texture.name=`BokehPass.depth`,this._materialDepth=new ne,this._materialDepth.depthPacking=m,this._materialDepth.blending=0;let l=v.clone(ke.uniforms);l.tDepth.value=this._renderTargetDepth.texture,l.focus.value=i,l.aspect.value=t.aspect,l.aperture.value=a,l.maxblur.value=s,l.nearClip.value=t.near,l.farClip.value=t.far,this.materialBokeh=new c({defines:Object.assign({},ke.defines),uniforms:l,vertexShader:ke.vertexShader,fragmentShader:ke.fragmentShader}),this.uniforms=l,this._fsQuad=new N(this.materialBokeh),this._oldClearColor=new o}render(e,t,n){this.scene.overrideMaterial=this._materialDepth,e.getClearColor(this._oldClearColor);let r=e.getClearAlpha(),i=e.autoClear;e.autoClear=!1,e.setClearColor(16777215),e.setClearAlpha(1),e.setRenderTarget(this._renderTargetDepth),e.clear(),e.render(this.scene,this.camera),this.uniforms.tColor.value=n.texture,this.uniforms.nearClip.value=this.camera.near,this.uniforms.farClip.value=this.camera.far,this.renderToScreen?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(t),e.clear(),this._fsQuad.render(e)),this.scene.overrideMaterial=null,e.setClearColor(this._oldClearColor),e.setClearAlpha(r),e.autoClear=i}setSize(e,t){this.materialBokeh.uniforms.aspect.value=e/t,this._renderTargetDepth.setSize(e,t)}dispose(){this._renderTargetDepth.dispose(),this._materialDepth.dispose(),this.materialBokeh.dispose(),this._fsQuad.dispose()}},je={uniforms:{tDiffuse:{value:null},amount:{value:.01}},vertexShader:`
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
  `},Me={uniforms:{tDiffuse:{value:null},uTime:{value:0},uGrainAmp:{value:.04},uVignetteAmp:{value:1}},vertexShader:`
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
  `};function Ne(e,t,n,r=!1,i=null){let a=window.innerWidth,o=window.innerHeight,s=new ce(e);s.addPass(new A(t,n));let c=null,l=null;r||(c=new Oe(t,n,a,o),c.kernelRadius=8,c.minDistance=.005,c.maxDistance=.1,s.addPass(c));let u=new xe(r?new U(a/2,o/2):new U(a,o),r?.18:.25,r?.35:.4,r?.92:.9);s.addPass(u),r||(l=new Ae(t,n,{focus:4,aperture:1e-4,maxblur:.005}),s.addPass(l)),i&&s.addPass(i);let d=null;r||(d=new pe(je),s.addPass(d));let f=new pe(Me);return r&&(f.uniforms.uGrainAmp.value=0,f.uniforms.uVignetteAmp.value=0),f.renderToScreen=!0,s.addPass(f),{composer:s,bloom:u,chroma:d,ssao:c,bokeh:l,grainVignette:f,setSize(e,t){s.setSize(e,t),u&&u.setSize(e,t),c&&c.setSize(e,t)}}}var Pe=new Ce;Pe.setDecoderPath(`https://www.gstatic.com/draco/versioned/decoders/1.5.6/`);var Fe=new Se;Fe.setDRACOLoader(Pe);function Ie(e){Fe=new Se(e),Fe.setDRACOLoader(Pe)}var Le=new Map;function Re(e,{onProgress:t}={}){return Le.has(e)?Promise.resolve(Le.get(e).clone(!0)):new Promise((n,r)=>{Fe.load(e,t=>{let r=t.scene;r.traverse(e=>{e.isMesh&&(e.castShadow=!0,e.receiveShadow=!0)});let i=new k().setFromObject(r),a=new H;i.getCenter(a),console.log(`[loader] ✓ ${e} | bbox center:`,a.toArray().map(e=>e.toFixed(2))),Le.set(e,r),n(r.clone(!0))},t,t=>{console.error(`[loader] ✗ ${e}`,t),r(t)})})}var ze=3,Be=`#000000`,Ve=2,He=.75,Ue=`power3.inOut`,We=2.2,Ge=`power2.inOut`,Ke=180;function qe(e=16){let t=[],n=[],r=Math.PI/e,i=[[.55,0,0],[.55,.42,0],[.36,.68,r],[.08,1,0],[-.18,.88,r],[-.68,.42,0],[-.98,0,0]],a=[];for(let[n,r,o]of i)if(a.push(t.length/3),r===0)t.push(0,n,0);else for(let i=0;i<e;i++){let a=i/e*Math.PI*2+o;t.push(Math.cos(a)*r,n,Math.sin(a)*r)}for(let t=0;t<i.length-1;t++){let[,r]=i[t],[,o]=i[t+1],s=a[t],c=a[t+1];if(r===0&&o>0)for(let t=0;t<e;t++){let r=(t+1)%e;n.push(s,c+t,c+r)}else if(r>0&&o===0)for(let t=0;t<e;t++){let r=(t+1)%e;n.push(s+t,s+r,c)}else for(let t=0;t<e;t++){let r=(t+1)%e;n.push(s+t,s+r,c+t),n.push(s+r,c+r,c+t)}}let o=new M;return o.setAttribute(`position`,new l(t,3)),o.setIndex(n),o}var Je=class{constructor({renderer:e,onReveal:t}){this.renderer=e,this._onReveal=t,this.loadingManager=new ue,this._realProgress=0,this._displayProgress={value:0},this._loadDone=!1,this._startTime=0,this.scene=new T,this.camera=new ve(38,1,.1,100),this.camera.position.set(0,0,3.9),this.overlay=null,this.frameEl=null,this.counterEl=null,this.diamond=null,this._rafId=null,this._active=!1,this._resize=null}getLoadingManager(){return this.loadingManager}markComplete(){this._realProgress=1,this._loadDone=!0}async run(){this._prevPixelRatio=this.renderer.getPixelRatio();let e=Math.min(window.devicePixelRatio,window.innerWidth<768||`ontouchstart`in window?Ve:2);e>this._prevPixelRatio&&(this.renderer.setPixelRatio(e),this.renderer.setSize(window.innerWidth,window.innerHeight,!1)),this._createDOM(),this._createDiamond(),this._bindLoadingManager(),this._startLoop(),await this._runPhase1(),await this._runPhase2(),await this._runPhase3(),this._destroy()}_runPhase1(){return new Promise(e=>{let t=()=>{let n=(performance.now()-this._startTime)/1e3;this._loadDone&&n>=ze?F.to(this._displayProgress,{value:1,duration:.45,ease:`power2.out`,onComplete:()=>F.delayedCall(.25,e)}):setTimeout(t,60)};t()})}_runPhase2(){return new Promise(e=>{let t=F.timeline({onComplete:e});t.to(this.diamond.scale,{x:.05,y:.05,z:.05,duration:He,ease:Ue},0),t.to(this.diamond.material,{opacity:0,duration:He*.85,ease:`power2.in`},He*.15),t.to(this.frameEl,{clipPath:`polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%)`,duration:He,ease:Ue},0),t.to(this.barEl,{opacity:0,scaleY:.4,duration:He*.7,ease:`power3.in`,transformOrigin:`50% 50%`},He*.15)})}_runPhase3(){return new Promise(e=>{this._active=!1,this._rafId&&cancelAnimationFrame(this._rafId),this._prevPixelRatio!=null&&this.renderer.getPixelRatio()!==this._prevPixelRatio&&(this.renderer.setPixelRatio(this._prevPixelRatio),this.renderer.setSize(window.innerWidth,window.innerHeight,!1)),this._onReveal&&this._onReveal();let t=this.overlay,n=Math.hypot(window.innerWidth,window.innerHeight)*.6,r=e=>{let n=`radial-gradient(circle at 50% 50%, transparent ${Math.max(0,e)}px, black ${e+Ke}px)`;t.style.maskImage=n,t.style.webkitMaskImage=n};r(0);let i={r:0},a=F.timeline({onComplete:()=>F.delayedCall(.05,e)});a.to(i,{r:n,duration:We,ease:Ge,onUpdate:()=>r(i.r)},0),a.to(t,{opacity:0,duration:.75,ease:`power2.out`},We-.55)})}_createDOM(){document.body.classList.add(`holm-loading`);let e=document.createElement(`div`);e.className=`holm-loader`,e.style.setProperty(`--holm-loader-bg`,Be),e.innerHTML=`
      <div class="holm-loader__frame">
        <div class="holm-loader__bar" aria-hidden="true">
          <div class="holm-loader__bar-fill"></div>
        </div>
      </div>
    `,document.body.appendChild(e),this.overlay=e,this.frameEl=e.querySelector(`.holm-loader__frame`),this.barEl=e.querySelector(`.holm-loader__bar`),this.fillEl=e.querySelector(`.holm-loader__bar-fill`)}_createDiamond(){let t=qe(16);t.scale(.85,.98,.85);let n=new p(t,1),r=new D({color:16777215,transparent:!0,opacity:.94});this.diamond=new e(n,r),this.diamond.rotation.x=-.28,this.diamond.scale.setScalar(1/3),this.scene.add(this.diamond),t.dispose(),this._resize=()=>{let e=window.innerWidth/window.innerHeight;this.camera.aspect=e,this.camera.position.z=e<.75?7.4:e<1?5.8:6.2,this.camera.updateProjectionMatrix()},window.addEventListener(`resize`,this._resize),this._resize()}_bindLoadingManager(){this.loadingManager.onProgress=(e,t,n)=>{if(this._loadDone)return;let r=n>0?t/n:0;this._realProgress=Math.max(this._realProgress,r)}}_startLoop(){this._active=!0,this._startTime=performance.now();let e=this._startTime,t=n=>{if(!this._active)return;let r=(n-e)/1e3,i=(n-this._startTime)/1e3;e=n,this._displayProgress.value+=(this._realProgress-this._displayProgress.value)*.06;let a=Math.min(i/ze,1),o=Math.min(this._displayProgress.value,a);this.fillEl&&(this.fillEl.style.transform=`scaleX(${o})`),this.diamond.rotation.y+=r*.52,this.diamond.rotation.x=-.28+Math.sin(i*.35)*.05,this.renderer.autoClear=!0,this.renderer.setClearColor(Be,1),this.renderer.render(this.scene,this.camera),this._rafId=requestAnimationFrame(t)};this._rafId=requestAnimationFrame(t)}_destroy(){this._active=!1,document.body.classList.remove(`holm-loading`),this._rafId&&cancelAnimationFrame(this._rafId),this._resize&&window.removeEventListener(`resize`,this._resize),this.diamond&&(this.diamond.geometry.dispose(),this.diamond.material.dispose()),this.overlay?.parentNode&&this.overlay.parentNode.removeChild(this.overlay),this.scene=null,this.camera=null,this.diamond=null,this.overlay=null}},Ye=`
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`,Xe=`
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
`,Ze={uniforms:{tDiffuse:{value:null},uWaveTex:{value:null},uTime:{value:0},uIntensity:{value:1},uDispAmount:{value:.045},uCausticAmp:{value:.38},uTintAmount:{value:.5},uAspect:{value:1}},vertexShader:`
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
  `};function Qe(e,{isMobile:t=!1}={}){let r=Math.min(window.devicePixelRatio,2),a=t?.4:.6,o=()=>Math.max(64,Math.floor(window.innerWidth*r*a)),l=()=>Math.max(64,Math.floor(window.innerHeight*r*a)),u={format:_,type:n,minFilter:te,magFilter:te,stencilBuffer:!1,depthBuffer:!1},d=new j(o(),l(),u),f=new j(o(),l(),u),p=new T,m=new i(-1,1,1,-1,0,1),h=new U,g=0,v=new c({uniforms:{textureA:{value:null},mouse:{value:h},resolution:{value:new U(o(),l())},time:{value:0},frame:{value:0}},vertexShader:Ye,fragmentShader:Xe}),y=new s(2,2),b=new W(y,v);p.add(b);let x=new pe(Ze);x.uniforms.uWaveTex.value=d.texture,x.uniforms.uAspect.value=window.innerWidth/window.innerHeight,t&&(x.uniforms.uDispAmount.value=.035,x.uniforms.uCausticAmp.value=.28,x.uniforms.uTintAmount.value=.42);let S=()=>{let t=performance.now()/1e3;v.uniforms.textureA.value=d.texture,v.uniforms.frame.value=g++,v.uniforms.time.value=t;let n=e.getRenderTarget();e.setRenderTarget(f),e.render(p,m),e.setRenderTarget(n);let r=d;d=f,f=r,x.uniforms.uWaveTex.value=d.texture,x.uniforms.uTime.value=t},C=(e,t)=>{if(e<0||t<0){h.set(0,0);return}h.x=e*o(),h.y=t*l()},w=e=>{x.uniforms.uIntensity.value=Math.max(0,Math.min(1,e))},E=()=>{d.setSize(o(),l()),f.setSize(o(),l()),v.uniforms.resolution.value.set(o(),l()),x.uniforms.uAspect.value=window.innerWidth/window.innerHeight};return window.addEventListener(`resize`,E),{pass:x,update:S,setMouseNorm:C,setIntensity:w,dispose:()=>{window.removeEventListener(`resize`,E),y.dispose(),v.dispose(),d.dispose(),f.dispose()}}}var J=new O,$e=new H,et=new U,tt=new U,nt=new U,rt=class{constructor(e){this.geometry=e.geometry,this.randomFunction=Math.random,this.indexAttribute=this.geometry.index,this.positionAttribute=this.geometry.getAttribute(`position`),this.normalAttribute=this.geometry.getAttribute(`normal`),this.colorAttribute=this.geometry.getAttribute(`color`),this.uvAttribute=this.geometry.getAttribute(`uv`),this.weightAttribute=null,this.distribution=null}setWeightAttribute(e){return this.weightAttribute=e?this.geometry.getAttribute(e):null,this}build(){let e=this.indexAttribute,t=this.positionAttribute,n=this.weightAttribute,r=e?e.count/3:t.count/3,i=new Float32Array(r);for(let a=0;a<r;a++){let r=1,o=3*a,s=3*a+1,c=3*a+2;e&&(o=e.getX(o),s=e.getX(s),c=e.getX(c)),n&&(r=n.getX(o)+n.getX(s)+n.getX(c)),J.a.fromBufferAttribute(t,o),J.b.fromBufferAttribute(t,s),J.c.fromBufferAttribute(t,c),r*=J.getArea(),i[a]=r}let a=new Float32Array(r),o=0;for(let e=0;e<r;e++)o+=i[e],a[e]=o;return this.distribution=a,this}setRandomGenerator(e){return this.randomFunction=e,this}sample(e,t,n,r){let i=this._sampleFaceIndex();return this._sampleFace(i,e,t,n,r)}_sampleFaceIndex(){let e=this.distribution[this.distribution.length-1];return this._binarySearch(this.randomFunction()*e)}_binarySearch(e){let t=this.distribution,n=0,r=t.length-1,i=-1;for(;n<=r;){let a=Math.ceil((n+r)/2);if(a===0||t[a-1]<=e&&t[a]>e){i=a;break}else e<t[a]?r=a-1:n=a+1}return i}_sampleFace(e,t,n,r,i){let a=this.randomFunction(),o=this.randomFunction();a+o>1&&(a=1-a,o=1-o);let s=this.indexAttribute,c=e*3,l=e*3+1,u=e*3+2;return s&&(c=s.getX(c),l=s.getX(l),u=s.getX(u)),J.a.fromBufferAttribute(this.positionAttribute,c),J.b.fromBufferAttribute(this.positionAttribute,l),J.c.fromBufferAttribute(this.positionAttribute,u),t.set(0,0,0).addScaledVector(J.a,a).addScaledVector(J.b,o).addScaledVector(J.c,1-(a+o)),n!==void 0&&(this.normalAttribute===void 0?J.getNormal(n):(J.a.fromBufferAttribute(this.normalAttribute,c),J.b.fromBufferAttribute(this.normalAttribute,l),J.c.fromBufferAttribute(this.normalAttribute,u),n.set(0,0,0).addScaledVector(J.a,a).addScaledVector(J.b,o).addScaledVector(J.c,1-(a+o)).normalize())),r!==void 0&&this.colorAttribute!==void 0&&(J.a.fromBufferAttribute(this.colorAttribute,c),J.b.fromBufferAttribute(this.colorAttribute,l),J.c.fromBufferAttribute(this.colorAttribute,u),$e.set(0,0,0).addScaledVector(J.a,a).addScaledVector(J.b,o).addScaledVector(J.c,1-(a+o)),r.r=$e.x,r.g=$e.y,r.b=$e.z),i!==void 0&&this.uvAttribute!==void 0&&(et.fromBufferAttribute(this.uvAttribute,c),tt.fromBufferAttribute(this.uvAttribute,l),nt.fromBufferAttribute(this.uvAttribute,u),i.set(0,0).addScaledVector(et,a).addScaledVector(tt,o).addScaledVector(nt,1-(a+o))),this}},it=.51,at=.53,ot=.56,st=.55,ct=.57,lt=.58,ut=.6,dt=.62,ft=.65,pt=3.5,mt=8,ht=.04,gt=32,_t=18,vt=22,yt=12,bt=7,xt=new o(2109520),St=.55;function Y(e){let t=Math.max(0,Math.min(1,e));return t*t*(3-2*t)}function Ct(e,t,n,r){let i=r?vt:gt,a=r?yt:_t,o=i*a,s=r?bt:mt,c=e.getSize(new U),l=new j(Math.floor(c.x*(r?.7:1)),Math.floor(c.y*(r?.7:1)),{minFilter:te,magFilter:te}),u=1/i,d=1/a,f=new Float32Array(o*4);for(let e=0;e<a;e++)for(let t=0;t<i;t++){let n=e*i+t;f[n*4+0]=t*u,f[n*4+1]=1-(e+1)*d,f[n*4+2]=u,f[n*4+3]=d}let p=new C(f,4),m=new ge(1,1,ht);m.setAttribute(`instanceUV`,p);let h={uOpacity:{value:1},uTintColor:{value:xt.clone()},uTintAmount:{value:0}},g=new ee({map:l.texture,transparent:!0,depthWrite:!1,side:0});g.onBeforeCompile=e=>{e.uniforms.uOpacity=h.uOpacity,e.uniforms.uTintColor=h.uTintColor,e.uniforms.uTintAmount=h.uTintAmount,e.vertexShader=e.vertexShader.replace(`void main() {`,`attribute vec4 instanceUV;
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
`},g.customProgramCacheKey=()=>`shatter_tile`;let _=new E(m,g,o);_.frustumCulled=!1,_.visible=!1,t.add(_);let v=Array(o),y=Array(o),b=Array(o),S=Array(o).fill(null).map(()=>new H),w=new Float32Array(o*3),T=1,D=1,O=!1,k=!0,A=new x,M=new H,N=[],P=[],F=[],I=[];function ne(e,t){let n=new Set;e.traverse(e=>{if(!e.isMesh)return;let r=e.material;r&&!n.has(r)&&(n.add(r),t.push(r))})}function L(e,t){for(let n of e)n.opacity=t}function R(){for(let e of P)e.opacity=1;for(let e of N)e.opacity=1;for(let e of F)e.visible=!0;for(let e of I)e.visible=!0}function z(){for(let e of F)e.visible=!1;for(let e of I)e.visible=!1}function B(){n.updateMatrixWorld();let e=n.fov*Math.PI/180,t=Math.tan(e/2)*pt,r=t*n.aspect;T=r*2/i,D=t*2/a;let o=new H,s=new H,c=new H;n.getWorldDirection(o),s.setFromMatrixColumn(n.matrixWorld,0),c.setFromMatrixColumn(n.matrixWorld,1);let l=n.position.clone().addScaledVector(o,pt);for(let e=0;e<a;e++)for(let n=0;n<i;n++){let o=e*i+n,u=(n+.5)/i*2-1,d=1-(e+.5)/a*2;v[o]=l.clone().addScaledVector(s,u*r).addScaledVector(c,d*t)}}function V(){let e=new H;for(let t=0;t<o;t++)e.set(Math.random()-.5,Math.random()-.5,Math.random()-.5).normalize().multiplyScalar(s*(.4+Math.random()*.6)),S[t].copy(e),w[t*3]=(Math.random()-.5)*Math.PI*2,w[t*3+1]=(Math.random()-.5)*Math.PI*2,w[t*3+2]=(Math.random()-.5)*Math.PI*2}function re(){for(let e=0;e<o;e++)y[e]=v[e].clone().add(S[e])}function ie(e){e.updateMatrixWorld(!0);let t=[];if(e.traverse(e=>{e.isMesh&&e.geometry&&e.geometry.attributes.position&&t.push(e)}),!t.length){console.warn(`[shatter] setSurface: no sampelable meshes found`);return}ne(e,N);for(let e of N)e.transparent=!0,e.opacity=1;let n=new H,r=new H,i=[],a=Math.ceil(o/t.length);for(let e of t){if(i.length>=o)break;let t=new rt(e).build(),s=Math.min(a,o-i.length);for(let a=0;a<s;a++)t.sample(n,r),i.push(n.clone().applyMatrix4(e.matrixWorld))}for(;i.length<o;)i.push(i[Math.floor(Math.random()*i.length)].clone());for(let e=i.length-1;e>0;e--){let t=Math.floor(Math.random()*(e+1));[i[e],i[t]]=[i[t],i[e]]}for(let e=0;e<o;e++)b[e]=i[e];O=!0,console.log(`[shatter] surface sampled — ${o} pts across ${t.length} mesh(es)`)}function ae(e,t=[]){ne(e,P);for(let e of P)e.transparent=!0,e.opacity=1;for(let e of t)F.push(e);console.log(`[shatter] hero_canvas primed — ${P.length} material(s), ${t.length} extras`)}function oe(e=[]){for(let t of e)I.push(t)}function se(){_.visible=!1,L(P,1),L(N,1);for(let e of F)e.visible=!0;for(let e of I)e.visible=!0;e.setRenderTarget(l),e.render(t,n),e.setRenderTarget(null),_.visible=!0}function ce(){B(),V(),re(),e.setRenderTarget(l),e.render(t,n),e.setRenderTarget(null),h.uOpacity.value=1,h.uTintAmount.value=0,M.set(T,D,ht),A.rotation.set(0,0,0);for(let e=0;e<o;e++)A.position.copy(v[e]),A.scale.copy(M),A.updateMatrix(),_.setMatrixAt(e,A.matrix);_.instanceMatrix.needsUpdate=!0,_.visible=!0}function le(e){let t={bgDark:0,textOpacity:0};if(e<.51||e>.65)return k||=(_.visible=!1,R(),h.uOpacity.value=1,h.uTintAmount.value=0,!0),t;k=!1,_.visible||=!0;let n=0,r=0,i=1,a,s,c=0,l=0;if(e<at){B(),re(),se(),n=0,r=0,a=v,s=y,c=0;let t=Y((e-it)/(at-it)),i=1-t;L(P,i),L(N,i);let o=t>.5;for(let e of F)e.visible=!o;for(let e of I)e.visible=!o;h.uOpacity.value=1,h.uTintAmount.value=0}else if(e<.56){let t=Y((e-at)/(ot-at));n=t,r=t,a=v,s=y,c=t,L(P,0),L(N,0),z(),h.uOpacity.value=1,h.uTintAmount.value=0}else if(e<.6)n=1,r=1,a=v,s=y,c=1,L(P,0),L(N,0),z(),h.uOpacity.value=1,h.uTintAmount.value=0,l=e<.57?Y((e-st)/(ct-st)):e<.58?1:1-Y((e-lt)/(ut-lt));else if(!O||e<.62)if(O){let t=Y((e-ut)/(dt-ut));n=t,r=1-t,a=y,s=b,c=1-t,L(P,0),L(N,0),z(),h.uOpacity.value=1,h.uTintAmount.value=t*St}else{let t=(e-ut)/(ft-ut);n=Y(1-t),r=n,a=v,s=y,c=1-Y(t)}else{let t=Y((e-dt)/(ft-dt));n=1,r=0,a=b,s=b,i=1-t,c=0,L(P,0),L(N,t);for(let e of I)e.visible=!0;for(let e of F)e.visible=!1;h.uOpacity.value=1-t,h.uTintAmount.value=St*(1-t)}M.set(T*i,D*i,ht*i);for(let e=0;e<o;e++)A.position.lerpVectors(a[e],s[e],n),A.rotation.set(w[e*3]*r,w[e*3+1]*r,w[e*3+2]*r),A.scale.copy(M),A.updateMatrix(),_.setMatrixAt(e,A.matrix);return _.instanceMatrix.needsUpdate=!0,{bgDark:c,textOpacity:l}}function ue(){t.remove(_),l.dispose(),m.dispose(),g.dispose(),R()}return{capture:ce,update:le,setSurface:ie,setHeroCanvas:ae,setVoidExtras:oe,dispose:ue,mesh:_}}var X=window.innerWidth<768||`ontouchstart`in window,wt={"hand.glb":`Every brand begins like this.`,"monument.glb":`Something is always missing at the beginning.`,"hero_canvas.glb":`Between sketch and masterpiece, there's patience.`,"void_figure.glb":`Sometimes what we leave out is what speaks.`,"arm_crystal.glb":`That's how the moment forms.`};function Tt(e){return wt[e]??``}var Z=[{file:`/models/hand.glb`,z:0,scale:3},{file:`/models/monument.glb`,z:-12,scale:.456},{file:`/models/hero_canvas.glb`,z:-24,scale:3},{file:`/models/void_figure.glb`,z:-36,orbitN:X?36:32},{file:`/models/arm_crystal.glb`,z:-48}].map(e=>({...e,caption:Tt(e.file.split(`/`).pop())})),Et=document.getElementById(`scene-canvas`),Dt=document.getElementById(`caption`),Ot=document.getElementById(`gathering-text`),kt=document.querySelector(`.wordmark`),{scene:Q,renderer:At,camera:$,spotLight:jt,armSpot:Mt,ambient:Nt,hemi:Pt,wallUniforms:Ft,onResize:It}=we(Et,X),Lt=75,Rt=55,zt=900,Bt=-48,Vt=30,Ht=Qe(At,{isMobile:X}),Ut=Ne(At,Q,$,X,Ht.pass),Wt=0,Gt=Te(Q,X),Kt=X?null:Ct(At,Q,$,X),qt=!1,Jt=1.8,Yt=X?5:4,Xt=X?16:32;function Zt(){let e=[],t=Jt,n=Yt;e.push(new H(0,t,10)),e.push(new H(0,t,7)),Z.forEach((r,i)=>{let a=r.z,o=r.orbitN??Xt;for(let r=0;r<=o;r++){let i=r/o*Math.PI*2;e.push(new H(Math.sin(i)*n,t,a+Math.cos(i)*n))}if(i<Z.length-1){let r=Z[i+1].z;e.push(new H(n*1.5,t,a)),e.push(new H(n*.8,t,a-n-1)),e.push(new H(0,t,r+n+1))}});let i=Z[Z.length-1].z;return e.push(new H(n*1.2,t,i)),e.push(new H(0,t,i-n-2)),e.push(new H(0,t,i-20)),e.push(new H(0,t,i-28)),new r(e,!1,`catmullrom`,.5)}var Qt=Zt(),$t=0,en=0,tn=new H,nn=new H(0,1.5,0),rn=new H(0,1.5,0),an=new H(0,6,0),on=new H(0,.5,0),sn=null;function cn(e){if(e!==sn){if(sn=e,F.killTweensOf(Dt),!e){F.to(Dt,{opacity:0,duration:.3});return}F.to(Dt,{opacity:0,duration:.25,ease:`power2.in`,onComplete(){Dt.textContent=e,F.to(Dt,{opacity:1,duration:.5,ease:`power2.out`})}})}}function ln(e){let t=1/0,n=null;for(let r of Z){let i=Math.hypot(e.x,e.z-r.z);i<t&&(t=i,n=r)}return{def:n,dist:t}}var un=new U(-9,-9),dn=new S;Et.addEventListener(`pointermove`,e=>{un.x=e.clientX/window.innerWidth*2-1,un.y=-(e.clientY/window.innerHeight)*2+1}),Et.addEventListener(`pointerleave`,()=>un.set(-9,-9));var fn=null,pn=null,mn=null,hn=null,gn=600;function _n(){fn=new M,pn=new Float32Array(gn*3),mn=new Float32Array(gn*3);for(let e=0;e<gn;e++){let t=(Math.random()-.5)*16,n=Math.random()*7,r=5-Math.random()*65;pn[e*3]=mn[e*3]=t,pn[e*3+1]=mn[e*3+1]=n,pn[e*3+2]=mn[e*3+2]=r}fn.setAttribute(`position`,new ye(pn,3));let e=new V({size:.015,color:8425664,transparent:!0,opacity:.35,depthWrite:!1});hn=new g(fn,e),Q.add(hn)}function vn(e){if(!fn)return;let t=fn.attributes.position;for(let n=0;n<gn;n++){let r=n*3;t.array[r+1]+=.001,t.array[r+0]=mn[r]+Math.sin(e*.3+n*.17)*.08,t.array[r+2]=mn[r+2]+Math.cos(e*.2+n*.13)*.05,t.array[r+1]>7&&(t.array[r+1]=0,mn[r+1]=0)}t.needsUpdate=!0}var yn=[155,255,390,580,1190],bn=new L({color:855311,roughness:.9,metalness:.1});async function xn(e,t){try{let n=await Re(e.file);e.scale&&n.scale.setScalar(e.scale),n.updateMatrixWorld(!0);let r=new k().setFromObject(n),i=isFinite(r.min.x)?(r.min.x+r.max.x)/2:0,o=isFinite(r.min.z)?(r.min.z+r.max.z)/2:0,s=isFinite(r.min.y)?-r.min.y+.3:.3;n.position.set(-i,s,e.z-o),n.traverse(e=>{e.isMesh&&(e.castShadow=e.receiveShadow=!X)}),Q.add(n);let c=new W(new h(.4,.5,.3,32),bn);c.position.set(0,.15,e.z),c.castShadow=c.receiveShadow=!0,Q.add(c);let l=Ee();l.position.set(0,.02,e.z),Q.add(l),e.file.includes(`void_figure`)&&(Kt?.setSurface(n),Kt?.setVoidExtras([c,l])),e.file.includes(`hero_canvas`)&&Kt?.setHeroCanvas(n,[c,l]);let u=new a(13691135,yn[t]??500,16,2);u.position.set(0,6.5,e.z),Q.add(u),console.log(`[HOLM] ✓ ${e.file} @ z=${e.z}`)}catch(t){console.error(`[HOLM] ✗ ${e.file}`,t)}}var Sn=!1,Cn=document.getElementById(`projection-overlay`);function wn(){Gt.visible=!0,Cn.classList.add(`active`),F.to(Cn,{opacity:1,duration:1.2,ease:`power2.out`});let e=Cn.querySelectorAll(`.proj-line`);F.fromTo(e,{opacity:0,y:12},{opacity:1,y:0,duration:1,stagger:.4,delay:.4,ease:`power2.out`}),F.fromTo(Cn.querySelector(`.proj-cta`),{opacity:0,y:8},{opacity:1,y:0,duration:1,delay:2.6,ease:`power2.out`})}function Tn(){F.to(Cn,{opacity:0,duration:.5,onComplete:()=>{Cn.classList.remove(`active`),Gt.visible=!1,F.set(`.proj-line, .proj-cta`,{opacity:0,y:0})}})}var En=new le(X?{smoothTouch:!1,touchMultiplier:.65}:{duration:4,smoothWheel:!0,wheelMultiplier:.28,touchMultiplier:1.2,smoothTouch:!1});F.ticker.lagSmoothing(0),fe(document);var Dn=(()=>{try{return sessionStorage.getItem(`holm:transition`)===`1`}catch{return!1}})();me(),new R({lenis:En}).mount(),fe(document);var On=document.getElementById(`book-call`);On&&(On.style.display=`none`),En.on(`scroll`,({scroll:e,limit:t})=>{$t=t>0?e/t:0});function kn(e=0){requestAnimationFrame(kn),En.raf(e);let t=dn.getElapsedTime();X?(en+=($t-en)*.18,tn.copy(Qt.getPoint(en)),$.position.copy(tn)):(tn.copy(Qt.getPoint($t)),$.position.lerp(tn,.07));let{def:n,dist:r}=ln($.position),i=n&&r<Yt+1.5,a=$.position.z<-56,o=$.position.z<-68;if(a)nn.set(0,4,-89.5),an.set(0,7,$.position.z),on.set(0,3.5,-89.5),cn(``),Gt.material.uniforms.uTime.value=t,o&&!Sn&&(Sn=!0,wn()),!o&&Sn&&(Sn=!1,Tn());else if(i)nn.set(0,1.5,n.z),an.set(0,6,n.z),on.set(0,.5,n.z),cn(n.caption),Sn&&(Sn=!1,Tn());else{let e=Z.find(e=>e.z<$.position.z-1);nn.set(0,1.5,e?e.z:$.position.z-10),an.set(0,6,$.position.z-3),on.set(0,.5,$.position.z-8),r>Yt*3&&cn(``),Sn&&(Sn=!1,Tn()),Gt.visible=!1}rn.lerp(nn,.07),$.lookAt(rn),jt.position.lerp(an,.05),jt.target.position.lerp(on,.05),jt.target.updateMatrixWorld();let s=Math.hypot($.position.x,$.position.z-Bt);Mt.intensity+=((s<Yt+3?zt:0)-Mt.intensity)*.1,Ut.bokeh&&(Ut.bokeh.uniforms.focus.value=r),Ut.grainVignette&&(Ut.grainVignette.uniforms.uTime.value=t),Ft.uTime.value=t,Ht.setMouseNorm((un.x+1)*.5,(un.y+1)*.5),Ht.update(),X||vn(t);let c=0,l=0;if(Kt){let e=$t;e>=.51&&e<=.65&&!qt&&(qt=!0,Kt.capture()),e<.46&&(qt=!1);let t=Kt.update(e);c=t.bgDark,l=t.textOpacity}let u=(1-c*.92)*Wt;Nt.intensity=Lt*u,Pt.intensity=Rt*u,jt.intensity=Vt*Math.max(u,.12*Wt),Ot&&(Ot.style.opacity=l),l>.01&&cn(``),Ut.composer.render()}window.addEventListener(`resize`,()=>{It(),Ut.setSize(window.innerWidth,window.innerHeight)});async function An(){let e=Qt.getPoint(0);$.position.copy(e),$.position.z+=3,rn.set(0,1.5,Z[0].z),$.lookAt(rn);let t=!1,n=()=>{if(t)return;t=!0,requestAnimationFrame(kn);let n={v:0};F.to(n,{v:1,duration:4.2,ease:`power2.out`,onUpdate:()=>{Wt=n.v}}),F.to($.position,{z:e.z,duration:3.8,ease:`power2.out`}),F.to(Dt,{opacity:1,duration:1.4,delay:2.4,ease:`power2.out`}),kt&&F.to(kt,{opacity:.85,duration:1.2,delay:1.6,ease:`power2.out`});let r=document.getElementById(`holm-teaser`);if(r){r.setAttribute(`aria-hidden`,`false`),F.fromTo(r,{opacity:0,y:12},{opacity:1,y:0,duration:1.2,delay:1.6,ease:`power2.out`});let e=!1,t=()=>{e||(e=!0,F.to(r,{opacity:0,duration:.8,ease:`power2.out`,onComplete:()=>r.setAttribute(`aria-hidden`,`true`)}),En.off(`scroll`,n),window.removeEventListener(`wheel`,i),window.removeEventListener(`touchmove`,i),window.removeEventListener(`keydown`,a),clearTimeout(o))},n=({scroll:e})=>{e>4&&t()},i=()=>t(),a=e=>{[`ArrowDown`,`ArrowUp`,`PageDown`,`PageUp`,`End`,`Home`,` `].includes(e.key)&&t()},o=setTimeout(t,7e3);En.on(`scroll`,n),window.addEventListener(`wheel`,i,{passive:!0}),window.addEventListener(`touchmove`,i,{passive:!0}),window.addEventListener(`keydown`,a)}};if(Dn){Ie(new ue);for(let e=0;e<Z.length;e++)await xn(Z[e],e);X||_n(),n(),se()}else{let e=new Je({renderer:At,onReveal:n});Ie(e.getLoadingManager());let t=e.run();for(let e=0;e<Z.length;e++)await xn(Z[e],e);X||_n(),e.markComplete(),await t}let r=document.querySelector(`.proj-cta`);r&&(r.addEventListener(`mousemove`,e=>{let t=r.getBoundingClientRect(),n=(e.clientX-t.left-t.width*.5)/t.width,i=(e.clientY-t.top-t.height*.5)/t.height;F.to(r,{x:n*14,y:i*9,duration:.35,ease:`power2.out`})}),r.addEventListener(`mouseleave`,()=>F.to(r,{x:0,y:0,duration:.7,ease:`elastic.out(1, 0.45)`})))}An();