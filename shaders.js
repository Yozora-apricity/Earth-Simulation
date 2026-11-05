// ============================================================================
// shaders.js — Power-of-Two Texture Pipeline & Custom GLSL Shaders
// ============================================================================

function loadImageFromUrls(loader, urls, onSuccess) {
    let idx = 0;
    function next() {
        if (idx >= urls.length) return;
        const url = urls[idx++];
        loader.load(url, tex => onSuccess(tex.image), undefined, () => next());
    }
    next();
}

export function createEarthAndMoonTextures(renderer) {
    const maxAniso = renderer.capabilities.getMaxAnisotropy();
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin('anonymous');

    const ASSETS = {
        day: [
            'https://unpkg.com/three-globe@2.31.1/example/img/earth-blue-marble.jpg',
            'https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg',
            'https://cdn.jsdelivr.net/gh/mrdoob/three.js@r128/examples/textures/planets/earth_atmos_2048.jpg',
            'https://assets.science.nasa.gov/content/dam/science/esd/eo/images/bmng/bmng-topography-bathymetry/january/world.topo.bathy.200401.3x5400x2700.jpg'
        ],
        night: [
            'https://unpkg.com/three-globe@2.31.1/example/img/earth-night.jpg',
            'https://assets.science.nasa.gov/content/dam/science/esd/eo/images/imagerecords/144000/144898/BlackMarble_2016_01deg.jpg'
        ],
        clouds: [
            'https://threejs.org/examples/textures/planets/earth_clouds_1024.png',
            'https://cdn.jsdelivr.net/gh/mrdoob/three.js@r128/examples/textures/planets/earth_clouds_1024.png',
            'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_clouds_1024.png'
        ]
    };

    const dayCan = document.createElement('canvas');
    dayCan.width = 2048; dayCan.height = 1024;
    const dCtx = dayCan.getContext('2d');
    const oceanGrad = dCtx.createLinearGradient(0, 0, 0, 1024);
    oceanGrad.addColorStop(0, '#071b3a');
    oceanGrad.addColorStop(0.5, '#0b2b5c');
    oceanGrad.addColorStop(1, '#071b3a');
    dCtx.fillStyle = oceanGrad;
    dCtx.fillRect(0, 0, 2048, 1024);
    const dayTex = new THREE.CanvasTexture(dayCan);
    dayTex.encoding = THREE.sRGBEncoding;
    dayTex.anisotropy = maxAniso;

    const nightCan = document.createElement('canvas');
    nightCan.width = 2048; nightCan.height = 1024;
    const nCtx = nightCan.getContext('2d');
    nCtx.fillStyle = '#010308';
    nCtx.fillRect(0, 0, 2048, 1024);
    const nightTex = new THREE.CanvasTexture(nightCan);
    nightTex.encoding = THREE.sRGBEncoding;
    nightTex.anisotropy = maxAniso;

    const cloudCan = document.createElement('canvas');
    cloudCan.width = 1024; cloudCan.height = 512;
    const cCtx = cloudCan.getContext('2d');
    cCtx.clearRect(0, 0, 1024, 512);
    const cloudTex = new THREE.CanvasTexture(cloudCan);
    cloudTex.encoding = THREE.sRGBEncoding;
    cloudTex.wrapS = THREE.RepeatWrapping;
    cloudTex.wrapT = THREE.ClampToEdgeWrapping;
    cloudTex.anisotropy = maxAniso;

    const topoCan = document.createElement('canvas');
    topoCan.width = 1024; topoCan.height = 512;
    const tCtx = topoCan.getContext('2d');
    tCtx.fillStyle = '#222222';
    tCtx.fillRect(0, 0, 1024, 512);
    const topoTex = new THREE.CanvasTexture(topoCan);

    const moonCan = document.createElement('canvas');
    moonCan.width = 1024; moonCan.height = 512;
    const mCtx = moonCan.getContext('2d');
    mCtx.fillStyle = '#8b9098';
    mCtx.fillRect(0, 0, 1024, 512);

    const moonBumpCan = document.createElement('canvas');
    moonBumpCan.width = 1024; moonBumpCan.height = 512;
    const mbCtx = moonBumpCan.getContext('2d');
    mbCtx.fillStyle = '#808080';
    mbCtx.fillRect(0, 0, 1024, 512);

    for (let i = 0; i < 240; i++) {
        const cx = ((Math.sin(i * 12.9898) * 0.5 + 0.5)) * 1024;
        const cy = ((Math.cos(i * 78.233) * 0.5 + 0.5)) * 512;
        const r = i < 16 ? (32 + (i % 6) * 14) : (3 + (i % 14) * 2.1);
        if (i < 16) {
            const mg = mCtx.createRadialGradient(cx, cy, 2, cx, cy, r);
            mg.addColorStop(0, 'rgba(65, 70, 78, 0.72)');
            mg.addColorStop(1, 'rgba(139, 144, 152, 0)');
            mCtx.fillStyle = mg;
            mCtx.beginPath(); mCtx.arc(cx, cy, r, 0, Math.PI * 2); mCtx.fill();
        } else {
            mbCtx.strokeStyle = 'rgba(230, 230, 230, 0.45)';
            mbCtx.lineWidth = 1.4;
            mbCtx.beginPath(); mbCtx.arc(cx, cy, r, 0, Math.PI * 2); mbCtx.stroke();
            mbCtx.fillStyle = 'rgba(60, 60, 60, 0.45)';
            mbCtx.beginPath(); mbCtx.arc(cx, cy, r * 0.78, 0, Math.PI * 2); mbCtx.fill();
        }
    }

    const moonAlbedoTex = new THREE.CanvasTexture(moonCan);
    moonAlbedoTex.anisotropy = maxAniso;
    const moonBumpTex = new THREE.CanvasTexture(moonBumpCan);
    moonBumpTex.anisotropy = maxAniso;

    loadImageFromUrls(loader, ASSETS.day, img => {
        dCtx.drawImage(img, 0, 0, 2048, 1024);
        dayTex.needsUpdate = true;
    });

    loadImageFromUrls(loader, ASSETS.night, img => {
        nCtx.drawImage(img, 0, 0, 2048, 1024);
        nightTex.needsUpdate = true;
    });

    loadImageFromUrls(loader, ASSETS.clouds, img => {
        cCtx.clearRect(0, 0, 1024, 512);
        cCtx.drawImage(img, 0, 0, 1024, 512);
        cloudTex.needsUpdate = true;
    });

    loader.load('https://unpkg.com/three-globe@2.31.1/example/img/earth-topology.png', (t) => {
        tCtx.drawImage(t.image, 0, 0, 1024, 512);
        topoTex.needsUpdate = true;
    });

    loader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/moon_1024.jpg', (t) => {
        mCtx.drawImage(t.image, 0, 0, 1024, 512);
        mbCtx.drawImage(t.image, 0, 0, 1024, 512);
        moonAlbedoTex.needsUpdate = true;
        moonBumpTex.needsUpdate = true;
    });

    return { dayTex, nightTex, topoTex, cloudTex, moonAlbedoTex, moonBumpTex };
}

export const GOOGLE_EARTH_CLOUD_GLSL = `
    float hash21(vec2 p) {
        p = fract(p * vec2(123.34, 456.21));
        p += dot(p, p + 45.32);
        return fract(p.x * p.y);
    }
    float noise2D(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        float a = hash21(i);
        float b = hash21(i + vec2(1.0, 0.0));
        float c = hash21(i + vec2(0.0, 1.0));
        float d = hash21(i + vec2(1.0, 1.0));
        return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
    }
    float fbmClouds(vec2 p) {
        float v = 0.0;
        float a = 0.5;
        for (int i = 0; i < 3; i++) {
            v += a * noise2D(p);
            p = p * 2.07 + vec2(13.4, 7.1);
            a *= 0.5;
        }
        return v;
    }
    float sampleGoogleEarthCloudDensity(sampler2D cloudSampler, vec2 uv, float windPhase) {
        float lat = (uv.y - 0.5) * 2.0;
        float zonalProfile = -0.35 * cos(lat * 3.14159) + 0.85 * sin(lat * 3.14159 * 2.0);

        vec2 uvPrimary = vec2(fract(uv.x - windPhase * 1.0 - zonalProfile * windPhase * 0.45), uv.y);
        vec2 uvHighJet = vec2(fract(uv.x - windPhase * 1.55 - zonalProfile * windPhase * 0.85 + 0.17), uv.y);

        float warpX = (fbmClouds(uv * 11.0 + vec2(windPhase * 3.2, -windPhase * 1.8)) - 0.5) * 0.009;
        float warpY = (fbmClouds(uv * 11.0 + vec2(-windPhase * 2.4, windPhase * 2.9)) - 0.5) * 0.006;

        vec4 c1 = texture2D(cloudSampler, clamp(uvPrimary + vec2(warpX, warpY), vec2(0.001), vec2(0.999)));
        vec4 c2 = texture2D(cloudSampler, clamp(uvHighJet - vec2(warpX * 0.7, warpY * 0.7), vec2(0.001), vec2(0.999)));

        float d1 = smoothstep(0.22, 0.74, c1.r) * c1.a;
        float d2 = smoothstep(0.32, 0.82, c2.r) * c2.a;

        return clamp(d1 * 0.76 + d2 * 0.36, 0.0, 1.0);
    }
`;

export function createEarthMaterial(textures, initialSunVec, initialCloudOpacity) {
    return new THREE.ShaderMaterial({
        uniforms: {
            uDayTexture: { value: textures.dayTex },
            uNightTexture: { value: textures.nightTex },
            uTopoTexture: { value: textures.topoTex },
            uCloudTexture: { value: textures.cloudTex },
            uSunDirLocal: { value: initialSunVec },
            uCityIntensity: { value: 1.0 },
            uZoomLod: { value: 0.0 },
            uWindPhase: { value: 0.0 },
            uCloudStrength: { value: initialCloudOpacity }
        },
        vertexShader: `
            uniform sampler2D uTopoTexture;
            uniform float uZoomLod;
            varying vec2 vUv;
            varying vec3 vNormalLocal;
            varying vec3 vNormalView;
            varying vec3 vViewPosition;

            void main() {
                vUv = uv;
                vNormalLocal = normalize(normal);
                float elev = texture2D(uTopoTexture, uv).r;
                vec3 displaced = position + normal * (elev * 0.14 * uZoomLod);
                vNormalView = normalize(normalMatrix * normal);
                vec4 viewPosition = modelViewMatrix * vec4(displaced, 1.0);
                vViewPosition = -viewPosition.xyz;
                gl_Position = projectionMatrix * viewPosition;
            }
        `,
        fragmentShader: `
            uniform sampler2D uDayTexture;
            uniform sampler2D uNightTexture;
            uniform sampler2D uTopoTexture;
            uniform sampler2D uCloudTexture;
            uniform vec3 uSunDirLocal;
            uniform float uCityIntensity;
            uniform float uZoomLod;
            uniform float uWindPhase;
            uniform float uCloudStrength;

            varying vec2 vUv;
            varying vec3 vNormalLocal;
            varying vec3 vNormalView;
            varying vec3 vViewPosition;
            #include <common>

            ${GOOGLE_EARTH_CLOUD_GLSL}

            void main() {
                vec2 texel = vec2(1.0 / 2048.0, 1.0 / 1024.0);
                float hL = texture2D(uTopoTexture, vUv - vec2(texel.x, 0.0)).r;
                float hR = texture2D(uTopoTexture, vUv + vec2(texel.x, 0.0)).r;
                float hD = texture2D(uTopoTexture, vUv - vec2(0.0, texel.y)).r;
                float hU = texture2D(uTopoTexture, vUv + vec2(0.0, texel.y)).r;
                vec3 bumpOffset = vec3(hL - hR, hD - hU, 0.0) * (1.2 + uZoomLod * 2.2);

                vec3 normalLocal = normalize(vNormalLocal + bumpOffset * 0.22);
                vec3 sunDir = normalize(uSunDirLocal);
                float sunDot = dot(normalLocal, sunDir);

                vec3 daySample = sRGBToLinear(texture2D(uDayTexture, vUv)).rgb;
                vec3 nightSample = sRGBToLinear(texture2D(uNightTexture, vUv)).rgb;

                float daylight = smoothstep(-0.14, 0.16, sunDot);
                float nightSide = 1.0 - smoothstep(-0.08, 0.09, sunDot);

                vec2 sunShadowOffset = vec2(-sunDir.x, -sunDir.y) * 0.0038;
                float shadowCloud = sampleGoogleEarthCloudDensity(uCloudTexture, vUv + sunShadowOffset, uWindPhase);
                float cloudGroundShadow = 1.0 - (shadowCloud * uCloudStrength * 0.36 * daylight);

                float diffuse = (0.46 + 0.54 * max(sunDot, 0.0)) * cloudGroundShadow;
                vec3 litDay = daySample * diffuse;
                vec3 nightBase = daySample * vec3(0.018, 0.035, 0.075) + vec3(0.0015, 0.003, 0.008);

                float nightLuma = dot(nightSample, vec3(0.2126, 0.7152, 0.0722));
                float cityMask = smoothstep(0.018, 0.075, nightLuma);
                vec3 citySignal = max(nightSample - vec3(0.012, 0.015, 0.022), vec3(0.0));
                vec3 cityTint = mix(vec3(1.0, 0.58, 0.26), vec3(1.0, 0.89, 0.65), clamp(nightLuma * 2.6, 0.0, 1.0));
                vec3 cityGlow = cityTint * citySignal * cityMask * uCityIntensity * 2.55 * nightSide;

                float duskScatter = smoothstep(-0.16, 0.0, sunDot) * (1.0 - smoothstep(0.0, 0.18, sunDot));
                vec3 rayleighDusk = vec3(0.02, 0.06, 0.14) * duskScatter * 0.25;

                vec3 surface = mix(nightBase, litDay, daylight) + cityGlow + rayleighDusk;

                float viewFacing = max(dot(normalize(vNormalView), normalize(vViewPosition)), 0.0);
                float fresnel = pow(1.0 - viewFacing, 5.5);
                surface += vec3(0.04, 0.28, 0.68) * fresnel * 0.14;

                gl_FragColor = vec4(clamp(surface, 0.0, 1.0), 1.0);
                #include <tonemapping_fragment>
                #include <encodings_fragment>
            }
        `
    });
}

export function createCloudMaterial(textures, initialSunVec, initialCloudOpacity) {
    return new THREE.ShaderMaterial({
        uniforms: {
            uCloudTexture: { value: textures.cloudTex },
            uSunDirLocal: { value: initialSunVec },
            uCloudOpacity: { value: initialCloudOpacity },
            uWindPhase: { value: 0.0 }
        },
        vertexShader: `
            varying vec2 vUv;
            varying vec3 vNormalLocal;
            void main() {
                vUv = uv;
                vNormalLocal = normalize(normal);
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform sampler2D uCloudTexture;
            uniform vec3 uSunDirLocal;
            uniform float uCloudOpacity;
            uniform float uWindPhase;
            varying vec2 vUv;
            varying vec3 vNormalLocal;

            ${GOOGLE_EARTH_CLOUD_GLSL}

            void main() {
                float cloudDensity = sampleGoogleEarthCloudDensity(uCloudTexture, vUv, uWindPhase);
                float sunDot = dot(normalize(vNormalLocal), normalize(uSunDirLocal));
                float dayFactor = smoothstep(-0.20, 0.22, sunDot);

                vec3 dayCloudCol = vec3(0.93, 0.96, 1.0);
                vec3 nightCloudCol = vec3(0.04, 0.07, 0.13);

                vec3 cloudColor = mix(nightCloudCol, dayCloudCol, dayFactor);
                float cloudAlpha = cloudDensity * mix(0.11, 0.42, dayFactor) * uCloudOpacity;
                gl_FragColor = vec4(cloudColor, cloudAlpha);
            }
        `,
        transparent: true,
        depthWrite: false,
        side: THREE.FrontSide
    });
}

export function createMoonMaterial(textures) {
    return new THREE.ShaderMaterial({
        uniforms: {
            uMoonAlbedo: { value: textures.moonAlbedoTex },
            uMoonBump: { value: textures.moonBumpTex },
            uSunDirWorld: { value: new THREE.Vector3(1, 0, 0) },
            uMoonZoomLod: { value: 0.0 }
        },
        vertexShader: `
            uniform sampler2D uMoonBump;
            uniform float uMoonZoomLod;
            varying vec2 vUv;
            varying vec3 vWorldNormal;

            void main() {
                vUv = uv;
                float h = texture2D(uMoonBump, uv).r;
                vec3 displaced = position + normal * ((h - 0.5) * 0.12 * (0.4 + uMoonZoomLod * 0.9));
                vWorldNormal = normalize(mat3(modelMatrix) * normal);
                gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
            }
        `,
        fragmentShader: `
            uniform sampler2D uMoonAlbedo;
            uniform sampler2D uMoonBump;
            uniform vec3 uSunDirWorld;
            uniform float uMoonZoomLod;
            varying vec2 vUv;
            varying vec3 vWorldNormal;

            void main() {
                vec3 albedo = texture2D(uMoonAlbedo, vUv).rgb;
                vec2 stepUv = vec2(1.0 / 1024.0, 1.0 / 512.0);
                float hL = texture2D(uMoonBump, vUv - vec2(stepUv.x, 0.0)).r;
                float hR = texture2D(uMoonBump, vUv + vec2(stepUv.x, 0.0)).r;
                float hD = texture2D(uMoonBump, vUv - vec2(0.0, stepUv.y)).r;
                float hU = texture2D(uMoonBump, vUv + vec2(0.0, stepUv.y)).r;

                vec3 bump = vec3(hL - hR, hD - hU, 0.0) * (3.2 + uMoonZoomLod * 3.5);
                vec3 N = normalize(vWorldNormal + bump * 0.35);
                vec3 L = normalize(uSunDirWorld);

                float ndotl = dot(N, L);
                float terminator = smoothstep(-0.08, 0.12, ndotl);
                float diff = clamp(ndotl, 0.0, 1.0);
                float dustyReflect = pow(diff, 0.72) * 1.15;

                vec3 earthshine = albedo * vec3(0.07, 0.10, 0.16) * 0.45;
                vec3 litMoon = albedo * dustyReflect;

                vec3 col = mix(earthshine, litMoon, terminator);
                gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
            }
        `
    });
}