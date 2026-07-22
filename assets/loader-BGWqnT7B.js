import{$t as e,Ct as t,F as n,G as r,Gt as i,H as a,I as o,Jt as s,M as c,Mt as l,Rt as u,Ut as d,V as f,W as p,Wt as m,_ as h,b as g,c as _,cn as v,d as y,dn as b,f as x,ft as S,g as C,gt as w,ht as T,in as E,jt as D,k as O,kt as k,l as A,mt as j,on as M,pt as N,qt as P,s as F,sn as I,tn as L,u as R,x as ee,xt as z,yt as B}from"./pageTransition-Bn3H0bLI.js";import{t as V}from"./UnrealBloomPass-D7Agko5q.js";import{n as H,r as U}from"./matcap-8GLFS9Wk.js";var te=`/assets/marble-wall-exp-1-CyJUA1jL.webp`;function ne(t,n=!1){let o=new C({canvas:t,antialias:!n});o.setPixelRatio(Math.min(window.devicePixelRatio,n?1:2)),o.setSize(window.innerWidth,window.innerHeight),o.toneMapping=4,o.toneMappingExposure=6.5,o.shadowMap.enabled=!n,o.shadowMap.type=2,o.outputColorSpace=i;let s=new P;s.background=new O(394762),s.fog=new a(394762,.022);let c=new k(60,window.innerWidth/window.innerHeight,.1,100);c.position.set(0,1.8,8),c.lookAt(0,1.5,0);let u={uTime:{value:0}},d=new T({color:1315864,side:1}),f=new j(new ee(20,8,102),d);f.position.set(0,4,-39),f.receiveShadow=!0,s.add(f);let p=new z({color:925272,roughness:.72,metalness:.04}),g=new j(new D(20,102),p);g.rotation.x=-Math.PI/2,g.position.set(0,.001,-39),g.receiveShadow=!0,s.add(g);let _=new T({color:925272}),v=new j(new D(20,102),_);v.rotation.x=Math.PI/2,v.position.set(0,7.99,-39),s.add(v);let y=new L().load(te);y.colorSpace=i,y.wrapS=m,y.wrapT=m,y.repeat.set(12,1),y.anisotropy=8;let b=new z({map:y,color:6645104,roughness:.78,metalness:0}),x=new j(new D(102,8),b);x.rotation.y=Math.PI/2,x.position.set(-9.99,4,-39),x.receiveShadow=!0,s.add(x);let S=new j(new D(102,8),b);S.rotation.y=-Math.PI/2,S.position.set(9.99,4,-39),S.receiveShadow=!0,s.add(S);let w=new L().load(te);w.colorSpace=i,w.wrapS=m,w.wrapT=m,w.repeat.set(2.4,1),w.anisotropy=8;let E=new z({map:w,color:6645104,roughness:.78,metalness:0}),A=new j(new D(20,8),E);A.position.set(0,4,-89.9),A.receiveShadow=!0,s.add(A);let M=new h(2109520,75);s.add(M);let N=new r(3162208,526352,55);s.add(N);let F=new e(13162751,30,22,.6,.75,2);F.position.set(0,6,0),F.castShadow=!n,F.shadow.mapSize.set(n?512:1024,n?512:1024),F.shadow.bias=-.002,s.add(F),s.add(F.target);let I=new e(13691135,0,18,.5,.85,2);I.position.set(0,7,-48),I.target.position.set(0,0,-48),I.castShadow=!n,I.shadow.mapSize.set(n?512:1024,n?512:1024),I.shadow.bias=-.002,I.target.updateMatrixWorld(),s.add(I),s.add(I.target);let R=new l(5271728,3e3,30,2);R.position.set(0,5,-83),s.add(R);function B(){c.aspect=window.innerWidth/window.innerHeight,c.updateProjectionMatrix(),o.setSize(window.innerWidth,window.innerHeight)}return window.addEventListener(`resize`,B),{scene:s,renderer:o,camera:c,spotLight:F,armSpot:I,ambient:M,hemi:N,wallUniforms:u,onResize:B}}function re(e,t=!1){let n=new s({uniforms:{uTime:{value:0}},vertexShader:`
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
    `,transparent:!0,blending:2,depthWrite:!1,side:0}),r=new j(t?new D(48,42):new D(32,18),n);return r.position.set(0,t?8:4,-89.5),r.visible=!1,e.add(r),r}function ie(){let e=new s({uniforms:{uColor:{value:new O(1721548)}},vertexShader:`
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
    `,transparent:!0,blending:2,depthWrite:!1,side:2}),t=new j(new D(2,2),e);return t.rotation.x=-Math.PI/2,t}var ae=class{constructor(e=Math){this.grad3=[[1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],[1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],[0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]],this.grad4=[[0,1,1,1],[0,1,1,-1],[0,1,-1,1],[0,1,-1,-1],[0,-1,1,1],[0,-1,1,-1],[0,-1,-1,1],[0,-1,-1,-1],[1,0,1,1],[1,0,1,-1],[1,0,-1,1],[1,0,-1,-1],[-1,0,1,1],[-1,0,1,-1],[-1,0,-1,1],[-1,0,-1,-1],[1,1,0,1],[1,1,0,-1],[1,-1,0,1],[1,-1,0,-1],[-1,1,0,1],[-1,1,0,-1],[-1,-1,0,1],[-1,-1,0,-1],[1,1,1,0],[1,1,-1,0],[1,-1,1,0],[1,-1,-1,0],[-1,1,1,0],[-1,1,-1,0],[-1,-1,1,0],[-1,-1,-1,0]],this.p=[];for(let t=0;t<256;t++)this.p[t]=Math.floor(e.random()*256);this.perm=[];for(let e=0;e<512;e++)this.perm[e]=this.p[e&255];this.simplex=[[0,1,2,3],[0,1,3,2],[0,0,0,0],[0,2,3,1],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,2,3,0],[0,2,1,3],[0,0,0,0],[0,3,1,2],[0,3,2,1],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,3,2,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,2,0,3],[0,0,0,0],[1,3,0,2],[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,3,0,1],[2,3,1,0],[1,0,2,3],[1,0,3,2],[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,0,3,1],[0,0,0,0],[2,1,3,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,0,1,3],[0,0,0,0],[0,0,0,0],[0,0,0,0],[3,0,1,2],[3,0,2,1],[0,0,0,0],[3,1,2,0],[2,1,0,3],[0,0,0,0],[0,0,0,0],[0,0,0,0],[3,1,0,2],[0,0,0,0],[3,2,0,1],[3,2,1,0]]}noise(e,t){let n,r,i,a=.5*(Math.sqrt(3)-1),o=(e+t)*a,s=Math.floor(e+o),c=Math.floor(t+o),l=(3-Math.sqrt(3))/6,u=(s+c)*l,d=s-u,f=c-u,p=e-d,m=t-f,h,g;p>m?(h=1,g=0):(h=0,g=1);let _=p-h+l,v=m-g+l,y=p-1+2*l,b=m-1+2*l,x=s&255,S=c&255,C=this.perm[x+this.perm[S]]%12,w=this.perm[x+h+this.perm[S+g]]%12,T=this.perm[x+1+this.perm[S+1]]%12,E=.5-p*p-m*m;E<0?n=0:(E*=E,n=E*E*this._dot(this.grad3[C],p,m));let D=.5-_*_-v*v;D<0?r=0:(D*=D,r=D*D*this._dot(this.grad3[w],_,v));let O=.5-y*y-b*b;return O<0?i=0:(O*=O,i=O*O*this._dot(this.grad3[T],y,b)),70*(n+r+i)}noise3d(e,t,n){let r,i,a,o,s=(e+t+n)*(1/3),c=Math.floor(e+s),l=Math.floor(t+s),u=Math.floor(n+s),d=1/6,f=(c+l+u)*d,p=c-f,m=l-f,h=u-f,g=e-p,_=t-m,v=n-h,y,b,x,S,C,w;g>=_?_>=v?(y=1,b=0,x=0,S=1,C=1,w=0):g>=v?(y=1,b=0,x=0,S=1,C=0,w=1):(y=0,b=0,x=1,S=1,C=0,w=1):_<v?(y=0,b=0,x=1,S=0,C=1,w=1):g<v?(y=0,b=1,x=0,S=0,C=1,w=1):(y=0,b=1,x=0,S=1,C=1,w=0);let T=g-y+d,E=_-b+d,D=v-x+d,O=g-S+2*d,k=_-C+2*d,A=v-w+2*d,j=g-1+3*d,M=_-1+3*d,N=v-1+3*d,P=c&255,F=l&255,I=u&255,L=this.perm[P+this.perm[F+this.perm[I]]]%12,R=this.perm[P+y+this.perm[F+b+this.perm[I+x]]]%12,ee=this.perm[P+S+this.perm[F+C+this.perm[I+w]]]%12,z=this.perm[P+1+this.perm[F+1+this.perm[I+1]]]%12,B=.6-g*g-_*_-v*v;B<0?r=0:(B*=B,r=B*B*this._dot3(this.grad3[L],g,_,v));let V=.6-T*T-E*E-D*D;V<0?i=0:(V*=V,i=V*V*this._dot3(this.grad3[R],T,E,D));let H=.6-O*O-k*k-A*A;H<0?a=0:(H*=H,a=H*H*this._dot3(this.grad3[ee],O,k,A));let U=.6-j*j-M*M-N*N;return U<0?o=0:(U*=U,o=U*U*this._dot3(this.grad3[z],j,M,N)),32*(r+i+a+o)}noise4d(e,t,n,r){let i=this.grad4,a=this.simplex,o=this.perm,s=(Math.sqrt(5)-1)/4,c=(5-Math.sqrt(5))/20,l,u,d,f,p,m=(e+t+n+r)*s,h=Math.floor(e+m),g=Math.floor(t+m),_=Math.floor(n+m),v=Math.floor(r+m),y=(h+g+_+v)*c,b=h-y,x=g-y,S=_-y,C=v-y,w=e-b,T=t-x,E=n-S,D=r-C,O=w>T?32:0,k=w>E?16:0,A=T>E?8:0,j=w>D?4:0,M=T>D?2:0,N=+(E>D),P=O+k+A+j+M+N,F=+(a[P][0]>=3),I=+(a[P][1]>=3),L=+(a[P][2]>=3),R=+(a[P][3]>=3),ee=+(a[P][0]>=2),z=+(a[P][1]>=2),B=+(a[P][2]>=2),V=+(a[P][3]>=2),H=+(a[P][0]>=1),U=+(a[P][1]>=1),te=+(a[P][2]>=1),ne=+(a[P][3]>=1),re=w-F+c,ie=T-I+c,ae=E-L+c,W=D-R+c,G=w-ee+2*c,K=T-z+2*c,q=E-B+2*c,J=D-V+2*c,oe=w-H+3*c,se=T-U+3*c,ce=E-te+3*c,le=D-ne+3*c,Y=w-1+4*c,X=T-1+4*c,ue=E-1+4*c,Z=D-1+4*c,Q=h&255,$=g&255,de=_&255,fe=v&255,pe=o[Q+o[$+o[de+o[fe]]]]%32,me=o[Q+F+o[$+I+o[de+L+o[fe+R]]]]%32,he=o[Q+ee+o[$+z+o[de+B+o[fe+V]]]]%32,ge=o[Q+H+o[$+U+o[de+te+o[fe+ne]]]]%32,_e=o[Q+1+o[$+1+o[de+1+o[fe+1]]]]%32,ve=.6-w*w-T*T-E*E-D*D;ve<0?l=0:(ve*=ve,l=ve*ve*this._dot4(i[pe],w,T,E,D));let ye=.6-re*re-ie*ie-ae*ae-W*W;ye<0?u=0:(ye*=ye,u=ye*ye*this._dot4(i[me],re,ie,ae,W));let be=.6-G*G-K*K-q*q-J*J;be<0?d=0:(be*=be,d=be*be*this._dot4(i[he],G,K,q,J));let xe=.6-oe*oe-se*se-ce*ce-le*le;xe<0?f=0:(xe*=xe,f=xe*xe*this._dot4(i[ge],oe,se,ce,le));let Se=.6-Y*Y-X*X-ue*ue-Z*Z;return Se<0?p=0:(Se*=Se,p=Se*Se*this._dot4(i[_e],Y,X,ue,Z)),27*(l+u+d+f+p)}_dot(e,t,n){return e[0]*t+e[1]*n}_dot3(e,t,n,r){return e[0]*t+e[1]*n+e[2]*r}_dot4(e,t,n,r,i){return e[0]*t+e[1]*n+e[2]*r+e[3]*i}},W={name:`SSAOShader`,defines:{PERSPECTIVE_CAMERA:1,KERNEL_SIZE:32},uniforms:{tNormal:{value:null},tDepth:{value:null},tNoise:{value:null},kernel:{value:null},cameraNear:{value:null},cameraFar:{value:null},resolution:{value:new I},cameraProjectionMatrix:{value:new N},cameraInverseProjectionMatrix:{value:new N},kernelRadius:{value:8},minDistance:{value:.005},maxDistance:{value:.05}},vertexShader:`

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

		}`},G={name:`SSAODepthShader`,defines:{PERSPECTIVE_CAMERA:1},uniforms:{tDepth:{value:null},cameraNear:{value:null},cameraFar:{value:null}},vertexShader:`varying vec2 vUv;

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

		}`},K={name:`SSAOBlurShader`,uniforms:{tDiffuse:{value:null},resolution:{value:new I}},vertexShader:`varying vec2 vUv;

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

		}`},q=class e extends y{constructor(e,r,i=512,a=512,c=32){super(),this.width=i,this.height=a,this.clear=!0,this.needsSwap=!1,this.camera=r,this.scene=e,this.kernelRadius=8,this.kernel=[],this.noiseTexture=null,this.output=0,this.minDistance=.005,this.maxDistance=.1,this._visibilityCache=[],this._generateSampleKernel(c),this._generateRandomKernelRotations();let l=new o;l.format=n,l.type=M,this.normalRenderTarget=new b(this.width,this.height,{minFilter:t,magFilter:t,type:p,depthTexture:l}),this.ssaoRenderTarget=new b(this.width,this.height,{type:p}),this.blurRenderTarget=this.ssaoRenderTarget.clone(),this.ssaoMaterial=new s({defines:Object.assign({},W.defines),uniforms:E.clone(W.uniforms),vertexShader:W.vertexShader,fragmentShader:W.fragmentShader,blending:0}),this.ssaoMaterial.defines.KERNEL_SIZE=c,this.ssaoMaterial.uniforms.tNormal.value=this.normalRenderTarget.texture,this.ssaoMaterial.uniforms.tDepth.value=this.normalRenderTarget.depthTexture,this.ssaoMaterial.uniforms.tNoise.value=this.noiseTexture,this.ssaoMaterial.uniforms.kernel.value=this.kernel,this.ssaoMaterial.uniforms.cameraNear.value=this.camera.near,this.ssaoMaterial.uniforms.cameraFar.value=this.camera.far,this.ssaoMaterial.uniforms.resolution.value.set(this.width,this.height),this.ssaoMaterial.uniforms.cameraProjectionMatrix.value.copy(this.camera.projectionMatrix),this.ssaoMaterial.uniforms.cameraInverseProjectionMatrix.value.copy(this.camera.projectionMatrixInverse),this.normalMaterial=new B,this.normalMaterial.blending=0,this.blurMaterial=new s({defines:Object.assign({},K.defines),uniforms:E.clone(K.uniforms),vertexShader:K.vertexShader,fragmentShader:K.fragmentShader}),this.blurMaterial.uniforms.tDiffuse.value=this.ssaoRenderTarget.texture,this.blurMaterial.uniforms.resolution.value.set(this.width,this.height),this.depthRenderMaterial=new s({defines:Object.assign({},G.defines),uniforms:E.clone(G.uniforms),vertexShader:G.vertexShader,fragmentShader:G.fragmentShader,blending:0}),this.depthRenderMaterial.uniforms.tDepth.value=this.normalRenderTarget.depthTexture,this.depthRenderMaterial.uniforms.cameraNear.value=this.camera.near,this.depthRenderMaterial.uniforms.cameraFar.value=this.camera.far,this.copyMaterial=new s({uniforms:E.clone(x.uniforms),vertexShader:x.vertexShader,fragmentShader:x.fragmentShader,transparent:!0,depthTest:!1,depthWrite:!1,blendSrc:208,blendDst:200,blendEquation:100,blendSrcAlpha:206,blendDstAlpha:200,blendEquationAlpha:100}),this._fsQuad=new R(null),this._originalClearColor=new O}dispose(){this.normalRenderTarget.dispose(),this.ssaoRenderTarget.dispose(),this.blurRenderTarget.dispose(),this.normalMaterial.dispose(),this.blurMaterial.dispose(),this.copyMaterial.dispose(),this.depthRenderMaterial.dispose(),this._fsQuad.dispose()}render(t,n,r){switch(this._overrideVisibility(),this._renderOverride(t,this.normalMaterial,this.normalRenderTarget,7829503,1),this._restoreVisibility(),this.ssaoMaterial.uniforms.kernelRadius.value=this.kernelRadius,this.ssaoMaterial.uniforms.minDistance.value=this.minDistance,this.ssaoMaterial.uniforms.maxDistance.value=this.maxDistance,this._renderPass(t,this.ssaoMaterial,this.ssaoRenderTarget),this._renderPass(t,this.blurMaterial,this.blurRenderTarget),this.output){case e.OUTPUT.SSAO:this.copyMaterial.uniforms.tDiffuse.value=this.ssaoRenderTarget.texture,this.copyMaterial.blending=0,this._renderPass(t,this.copyMaterial,this.renderToScreen?null:r);break;case e.OUTPUT.Blur:this.copyMaterial.uniforms.tDiffuse.value=this.blurRenderTarget.texture,this.copyMaterial.blending=0,this._renderPass(t,this.copyMaterial,this.renderToScreen?null:r);break;case e.OUTPUT.Depth:this._renderPass(t,this.depthRenderMaterial,this.renderToScreen?null:r);break;case e.OUTPUT.Normal:this.copyMaterial.uniforms.tDiffuse.value=this.normalRenderTarget.texture,this.copyMaterial.blending=0,this._renderPass(t,this.copyMaterial,this.renderToScreen?null:r);break;case e.OUTPUT.Default:this.copyMaterial.uniforms.tDiffuse.value=this.blurRenderTarget.texture,this.copyMaterial.blending=5,this._renderPass(t,this.copyMaterial,this.renderToScreen?null:r);break;default:console.warn(`THREE.SSAOPass: Unknown output type.`)}}setSize(e,t){this.width=e,this.height=t,this.ssaoRenderTarget.setSize(e,t),this.normalRenderTarget.setSize(e,t),this.blurRenderTarget.setSize(e,t),this.ssaoMaterial.uniforms.resolution.value.set(e,t),this.ssaoMaterial.uniforms.cameraProjectionMatrix.value.copy(this.camera.projectionMatrix),this.ssaoMaterial.uniforms.cameraInverseProjectionMatrix.value.copy(this.camera.projectionMatrixInverse),this.blurMaterial.uniforms.resolution.value.set(e,t)}_renderPass(e,t,n,r,i){e.getClearColor(this._originalClearColor);let a=e.getClearAlpha(),o=e.autoClear;e.setRenderTarget(n),e.autoClear=!1,r!=null&&(e.setClearColor(r),e.setClearAlpha(i||0),e.clear()),this._fsQuad.material=t,this._fsQuad.render(e),e.autoClear=o,e.setClearColor(this._originalClearColor),e.setClearAlpha(a)}_renderOverride(e,t,n,r,i){e.getClearColor(this._originalClearColor);let a=e.getClearAlpha(),o=e.autoClear;e.setRenderTarget(n),e.autoClear=!1,r=t.clearColor||r,i=t.clearAlpha||i,r!=null&&(e.setClearColor(r),e.setClearAlpha(i||0),e.clear()),this.scene.overrideMaterial=t,e.render(this.scene,this.camera),this.scene.overrideMaterial=null,e.autoClear=o,e.setClearColor(this._originalClearColor),e.setClearAlpha(a)}_generateSampleKernel(e){let t=this.kernel;for(let n=0;n<e;n++){let r=new v;r.x=Math.random()*2-1,r.y=Math.random()*2-1,r.z=Math.random(),r.normalize();let i=n/e;i=S.lerp(.1,1,i*i),r.multiplyScalar(i),t.push(r)}}_generateRandomKernelRotations(){let e=new ae,t=new Float32Array(16);for(let n=0;n<16;n++){let r=Math.random()*2-1,i=Math.random()*2-1;t[n]=e.noise3d(r,i,0)}this.noiseTexture=new c(t,4,4,d,f),this.noiseTexture.wrapS=m,this.noiseTexture.wrapT=m,this.noiseTexture.needsUpdate=!0}_overrideVisibility(){let e=this.scene,t=this._visibilityCache;e.traverse(function(e){(e.isPoints||e.isLine||e.isLine2)&&e.visible&&(e.visible=!1,t.push(e))})}_restoreVisibility(){let e=this._visibilityCache;for(let t=0;t<e.length;t++)e[t].visible=!0;e.length=0}};q.OUTPUT={Default:0,SSAO:1,Blur:2,Depth:3,Normal:4};var J={name:`BokehShader`,defines:{DEPTH_PACKING:1,PERSPECTIVE_CAMERA:1},uniforms:{tColor:{value:null},tDepth:{value:null},focus:{value:1},aspect:{value:1},aperture:{value:.025},maxblur:{value:.01},nearClip:{value:1},farClip:{value:1e3}},vertexShader:`

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

		}`},oe=class extends y{constructor(e,n,r){super(),this.scene=e,this.camera=n;let i=r.focus===void 0?1:r.focus,a=r.aperture===void 0?.025:r.aperture,o=r.maxblur===void 0?1:r.maxblur;this._renderTargetDepth=new b(1,1,{minFilter:t,magFilter:t,type:p}),this._renderTargetDepth.texture.name=`BokehPass.depth`,this._materialDepth=new w,this._materialDepth.depthPacking=u,this._materialDepth.blending=0;let c=E.clone(J.uniforms);c.tDepth.value=this._renderTargetDepth.texture,c.focus.value=i,c.aspect.value=n.aspect,c.aperture.value=a,c.maxblur.value=o,c.nearClip.value=n.near,c.farClip.value=n.far,this.materialBokeh=new s({defines:Object.assign({},J.defines),uniforms:c,vertexShader:J.vertexShader,fragmentShader:J.fragmentShader}),this.uniforms=c,this._fsQuad=new R(this.materialBokeh),this._oldClearColor=new O}render(e,t,n){this.scene.overrideMaterial=this._materialDepth,e.getClearColor(this._oldClearColor);let r=e.getClearAlpha(),i=e.autoClear;e.autoClear=!1,e.setClearColor(16777215),e.setClearAlpha(1),e.setRenderTarget(this._renderTargetDepth),e.clear(),e.render(this.scene,this.camera),this.uniforms.tColor.value=n.texture,this.uniforms.nearClip.value=this.camera.near,this.uniforms.farClip.value=this.camera.far,this.renderToScreen?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(t),e.clear(),this._fsQuad.render(e)),this.scene.overrideMaterial=null,e.setClearColor(this._oldClearColor),e.setClearAlpha(r),e.autoClear=i}setSize(e,t){this.materialBokeh.uniforms.aspect.value=e/t,this._renderTargetDepth.setSize(e,t)}dispose(){this._renderTargetDepth.dispose(),this._materialDepth.dispose(),this.materialBokeh.dispose(),this._fsQuad.dispose()}},se={uniforms:{tDiffuse:{value:null},amount:{value:.01}},vertexShader:`
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
  `},ce={uniforms:{tDiffuse:{value:null},uTime:{value:0},uGrainAmp:{value:.04},uVignetteAmp:{value:1}},vertexShader:`
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
  `};function le(e,t,n,r=!1,i=null){let a=window.innerWidth,o=window.innerHeight,s=new _(e);s.addPass(new F(t,n));let c=null,l=null;r||(c=new q(t,n,a,o),c.kernelRadius=8,c.minDistance=.005,c.maxDistance=.1,s.addPass(c));let u=new V(r?new I(a/2,o/2):new I(a,o),r?.18:.25,r?.35:.4,r?.92:.9);s.addPass(u),r||(l=new oe(t,n,{focus:4,aperture:1e-4,maxblur:.005}),s.addPass(l)),i&&s.addPass(i);let d=null;r||(d=new A(se),s.addPass(d));let f=new A(ce);return r&&(f.uniforms.uGrainAmp.value=0,f.uniforms.uVignetteAmp.value=0),f.renderToScreen=!0,s.addPass(f),{composer:s,bloom:u,chroma:d,ssao:c,bokeh:l,grainVignette:f,setSize(e,t){s.setSize(e,t),u&&u.setSize(e,t),c&&c.setSize(e,t)}}}var Y=new H;Y.setDecoderPath(`https://www.gstatic.com/draco/versioned/decoders/1.5.6/`);var X=new U;X.setDRACOLoader(Y);function ue(e){X=new U(e),X.setDRACOLoader(Y)}var Z=new Map;function Q(e,{onProgress:t}={}){return Z.has(e)?Promise.resolve(Z.get(e).clone(!0)):new Promise((n,r)=>{X.load(e,t=>{let r=t.scene;r.traverse(e=>{e.isMesh&&(e.castShadow=!0,e.receiveShadow=!0)});let i=new g().setFromObject(r),a=new v;i.getCenter(a),console.log(`[loader] ✓ ${e} | bbox center:`,a.toArray().map(e=>e.toFixed(2))),Z.set(e,r),n(r.clone(!0))},t,t=>{console.error(`[loader] ✗ ${e}`,t),r(t)})})}export{re as a,ie as i,ue as n,ne as o,le as r,Q as t};