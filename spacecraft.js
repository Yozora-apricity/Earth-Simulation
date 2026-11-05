// ============================================================================
// spacecraft.js — NASA 3D Models, Fixed Hinged Hubble Door & Blueprints
// ============================================================================

export function generateNasaReferenceDiagram(type) {
    const can = document.createElement('canvas');
    can.width = 1100;
    can.height = 540;
    const ctx = can.getContext('2d');

    const bg = ctx.createLinearGradient(0, 0, 1100, 540);
    bg.addColorStop(0, '#030b1e');
    bg.addColorStop(0.5, '#071938');
    bg.addColorStop(1, '#020713');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, 1100, 540);

    ctx.strokeStyle = 'rgba(56, 189, 248, 0.06)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= 1100; x += 20) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 540); ctx.stroke(); }
    for (let y = 0; y <= 540; y += 20) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(1100, y); ctx.stroke(); }

    ctx.strokeStyle = 'rgba(56, 189, 248, 0.14)';
    for (let x = 0; x <= 1100; x += 100) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 540); ctx.stroke(); }
    for (let y = 0; y <= 540; y += 100) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(1100, y); ctx.stroke(); }

    ctx.strokeStyle = 'rgba(56, 189, 248, 0.55)';
    ctx.lineWidth = 2;
    ctx.strokeRect(14, 14, 1072, 512);

    function drawCallout(px, py, tx, ty, numStr, titleStr, subStr) {
        ctx.save();
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.6;
        ctx.setLineDash([4, 3]);
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(tx, ty);
        const dir = tx >= px ? 1 : -1;
        ctx.lineTo(tx + dir * 26, ty);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = '#38bdf8';
        ctx.beginPath(); ctx.arc(px, py, 4.5, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#e0f2fe'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(px, py, 8.5, 0, Math.PI * 2); ctx.stroke();

        const boxX = dir > 0 ? tx + 30 : tx - 245;
        ctx.fillStyle = 'rgba(3, 12, 30, 0.92)';
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
        ctx.lineWidth = 1.2;
        ctx.fillRect(boxX, ty - 20, 215, 38);
        ctx.strokeRect(boxX, ty - 20, 215, 38);

        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 11px "JetBrains Mono", monospace';
        ctx.fillText(`[${numStr}] ${titleStr}`, boxX + 8, ty - 4);
        ctx.fillStyle = '#94a3b8';
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.fillText(subStr, boxX + 8, ty + 11);
        ctx.restore();
    }

    ctx.save();
    ctx.translate(540, 290);

    if (type === 'landsat9') {
        ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 5;
        ctx.beginPath(); ctx.moveTo(35, -45); ctx.lineTo(35, -82); ctx.stroke();
        for (let p = 0; p < 4; p++) {
            const py = -125 - p * 38;
            ctx.fillStyle = '#1e3a8a';
            ctx.strokeStyle = '#60a5fa';
            ctx.lineWidth = 1.8;
            ctx.fillRect(-55, py, 180, 33);
            ctx.strokeRect(-55, py, 180, 33);
        }

        ctx.fillStyle = '#cbd5e1';
        ctx.strokeStyle = '#f8fafc'; ctx.lineWidth = 2;
        ctx.fillRect(-135, -42, 95, 84);
        ctx.strokeRect(-135, -42, 95, 84);

        ctx.fillStyle = '#1e293b'; ctx.strokeStyle = '#38bdf8';
        ctx.fillRect(-172, -30, 37, 26); ctx.strokeRect(-172, -30, 37, 26);
        ctx.fillStyle = '#d97706';
        ctx.fillRect(-165, 6, 30, 22); ctx.strokeRect(-165, 6, 30, 22);

        ctx.fillStyle = '#d97706';
        ctx.strokeStyle = '#fde047'; ctx.lineWidth = 2;
        ctx.fillRect(-40, -46, 145, 92);
        ctx.strokeRect(-40, -46, 145, 92);

        ctx.fillStyle = '#64748b';
        ctx.fillRect(105, -34, 28, 68);

        ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 5;
        ctx.beginPath(); ctx.moveTo(-95, 42); ctx.lineTo(-145, 102); ctx.stroke();
        ctx.fillStyle = '#f1f5f9'; ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(-155, 112, 42, -0.3, Math.PI - 0.3); ctx.fill(); ctx.stroke();

        drawCallout(35, -185, 195, -205, '01', '4-PANEL GaAs WING', '4.2 kW Single-Sided Array');
        drawCallout(45, 0, 195, -20, '02', 'LEOSTAR-3 GOLD BUS', 'Octagonal MLI Bus & Louvers');
        drawCallout(-160, -18, -225, -125, '03', 'OLI-2 & TIRS-2 OPTICS', 'Cryo-Cooled 43K Imagers');
        drawCallout(-155, 112, -225, 125, '04', 'X-BAND GIMBAL DISH', '384 Mbps Science Downlink');
        drawCallout(130, 0, 195, 95, '05', 'HYDRAZINE PROPULSION', 'Aft Marman Adapter & RCS');

    } else if (type === 'tdrsm') {
        ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.moveTo(0, -45); ctx.lineTo(0, -210); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, 45); ctx.lineTo(0, 185); ctx.stroke();
        for (let p = 0; p < 4; p++) {
            ctx.fillStyle = '#1e3a8a'; ctx.strokeStyle = '#60a5fa'; ctx.lineWidth = 1.5;
            ctx.fillRect(-36, -95 - p * 30, 72, 26); ctx.strokeRect(-36, -95 - p * 30, 72, 26);
            ctx.fillRect(-36, 68 + p * 28, 72, 24); ctx.strokeRect(-36, 68 + p * 28, 72, 24);
        }

        ctx.strokeStyle = '#475569'; ctx.lineWidth = 5;
        ctx.beginPath(); ctx.moveTo(-50, 0); ctx.lineTo(-175, 0); ctx.lineTo(-195, -25); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(50, 0); ctx.lineTo(175, 0); ctx.lineTo(195, -25); ctx.stroke();

        ctx.fillStyle = 'rgba(245, 158, 11, 0.28)';
        ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 2.2;
        [-205, 205].forEach(dx => {
            ctx.beginPath(); ctx.arc(dx, -32, 66, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        });

        ctx.fillStyle = '#d97706'; ctx.strokeStyle = '#fde047'; ctx.lineWidth = 2;
        ctx.fillRect(-52, -45, 104, 90); ctx.strokeRect(-52, -45, 104, 90);

        drawCallout(-205, -32, -255, -165, '01', 'DUAL 4.6m MESH DISHES', 'Molybdenum Gold S/Ku/Ka');
        drawCallout(-20, -10, -255, 110, '02', 'S-BAND PHASED ARRAY', '32-Helix Multiple Access');
        drawCallout(45, 20, 215, 120, '03', 'BSS-601HP GOLD BUS', 'Hexagonal GEO Relay Bus');
        drawCallout(0, -165, 185, -195, '04', 'TWIN GEO SOLAR WINGS', '3.24 kW Continuous Span');

    } else if (type === 'hubble') {
        ctx.fillStyle = '#94a3b8'; ctx.strokeStyle = '#f8fafc'; ctx.lineWidth = 2;
        ctx.fillRect(15, -56, 130, 112); ctx.strokeRect(15, -56, 130, 112);

        ctx.fillStyle = '#cbd5e1'; ctx.strokeStyle = '#f8fafc';
        ctx.fillRect(-145, -42, 160, 84); ctx.strokeRect(-145, -42, 160, 84);

        ctx.save();
        ctx.translate(-145, -42);
        ctx.rotate(-0.38);
        ctx.fillStyle = '#eab308'; ctx.strokeStyle = '#fef08a';
        ctx.fillRect(-78, -6, 78, 12); ctx.strokeRect(-78, -6, 78, 12);
        ctx.restore();

        ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.moveTo(-20, -42); ctx.lineTo(-20, -185); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-20, 42); ctx.lineTo(-20, 165); ctx.stroke();
        for (let s = -1; s <= 1; s += 2) {
            const sy = s < 0 ? -185 : 58;
            ctx.fillStyle = '#1e3a8a'; ctx.strokeStyle = '#60a5fa'; ctx.lineWidth = 1.8;
            ctx.fillRect(-58, sy, 76, 108); ctx.strokeRect(-58, sy, 76, 108);
        }

        drawCallout(-85, 0, -245, 95, '01', '2.4m OPTICAL BARREL', 'Baffled Ritchey-Chrétien');
        drawCallout(-178, -56, -245, -135, '02', 'HINGED APERTURE DOOR', 'Bolted to Forward Rim Lip');
        drawCallout(85, 0, 195, 105, '03', 'AFT SCIENCE SHROUD', 'WFC3, COS & 4 Gyro Wheels');
        drawCallout(-20, -145, 185, -175, '05', 'BI-STEM SOLAR WINGS', '2.80 kW ESA/NASA Arrays');

    } else {
        ctx.fillStyle = '#d97706'; ctx.strokeStyle = '#fde047'; ctx.lineWidth = 2;
        ctx.fillRect(20, -44, 115, 88); ctx.strokeRect(20, -44, 115, 88);

        ctx.fillStyle = '#e2e8f0'; ctx.strokeStyle = '#f8fafc';
        ctx.fillRect(-95, -36, 115, 72); ctx.strokeRect(-95, -36, 115, 72);

        ctx.strokeStyle = '#334155'; ctx.lineWidth = 6;
        ctx.beginPath(); ctx.moveTo(-75, -36); ctx.lineTo(-155, -105); ctx.lineTo(-215, -145); ctx.stroke();

        ctx.fillStyle = 'rgba(245, 158, 11, 0.30)';
        ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.ellipse(-235, -162, 82, 34, -0.35, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();

        for (let p = 0; p < 3; p++) {
            ctx.fillStyle = '#1e3a8a'; ctx.strokeStyle = '#60a5fa'; ctx.lineWidth = 1.6;
            ctx.fillRect(42, -82 - p * 34, 72, 29); ctx.strokeRect(42, -82 - p * 34, 72, 29);
            ctx.fillRect(42, 54 + p * 34, 72, 29); ctx.strokeRect(42, 54 + p * 34, 72, 29);
        }

        drawCallout(-235, -162, -255, -35, '01', '12m ASTROMESH DRUM', 'Gold Wire-Mesh Radar Antenna');
        drawCallout(-45, -15, -245, 115, '02', 'L & S-BAND SAR FEED', 'JPL 24cm + ISRO 12cm Tiles');
        drawCallout(85, 0, 195, 25, '03', 'I-3K OCTAGONAL BUS', '85 TB/Day Ka-Band Downlink');
        drawCallout(78, -140, 195, -175, '04', 'DAWN-DUSK SOLAR WINGS', '6.40 kW GaAs Arrays');
    }
    ctx.restore();

    const meta = {
        landsat9: { title: 'LANDSAT 9 EARTH OBSERVATORY // ORTHOGRAPHIC ENGINEERING BLUEPRINT', doc: 'DOC: NP-2021-07-028-GSFC // SCALE: 1:24 // LEO 705 KM' },
        tdrsm: { title: 'NASA TDRS-M (3RD GEN) RELAY SATELLITE // ENGINEERING BLUEPRINT', doc: 'DOC: NP-2022-3-742-GSFC // SCALE: 1:48 // GEO 35,786 KM' },
        hubble: { title: 'HUBBLE SPACE TELESCOPE (HST) // SMITHSONIAN NASM & GSFC BLUEPRINT', doc: 'DOC: NASM-A19870194000 // SCALE: 1:36 // LEO 535 KM' },
        nisar: { title: 'NISAR DUAL-BAND (L & S) SAR // NASA JPL & ISRO ENGINEERING BLUEPRINT', doc: 'DOC: JPL-PIA24575 // SCALE: 1:42 // SSO 747 KM' }
    }[type];

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 14px "Orbitron", sans-serif';
    ctx.fillText(meta.title, 30, 42);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px "JetBrains Mono", monospace';
    ctx.fillText(meta.doc, 30, 60);

    return can.toDataURL('image/png');
}

export const SPACECRAFT_CATALOG = {
    landsat9: {
        name: 'LANDSAT 9 OBSERVATORY',
        badge: 'NASA GSFC / USGS // LEO 705 KM',
        altitudeKm: '705',
        regime: 'SUN-SYNCHRONOUS LEO',
        inclination: '98°',
        officialUrl: 'https://science.nasa.gov/mission/landsat-9/',
        copyright: '© Public Domain // NASA Goddard Space Flight Center / USGS (NP-2021-07-028-GSFC)',
        apaCitation: 'National Aeronautics and Space Administration, Goddard Space Flight Center. (2021). <em>Landsat 9 mission overview: Continuing the legacy of Earth observation</em> (NP-2021-07-028-GSFC). NASA Science Mission Directorate. <a href="https://science.nasa.gov/mission/landsat-9/" target="_blank" rel="noopener noreferrer" class="text-cyan-300 hover:underline">https://science.nasa.gov/mission/landsat-9/</a>',
        desc: 'NASA/USGS Earth observation spacecraft carrying the Operational Land Imager 2 (OLI-2), Thermal Infrared Sensor 2 (TIRS-2), and gold Kapton MLI blanket.',
        parts: [
            { id: 'solar', name: 'Single-Sided 4-Panel GaAs Solar Wing', spec: 'Authentic Landsat-9 single-wing 4-panel gallium-arsenide solar array canted on a deployment boom generating 4.2 kW regulated power.', status: '4.20 kW NOMINAL', offset: [0, 0.55, 0] },
            { id: 'bus', name: 'LEOStar-3 Gold Kapton Octagonal Bus', spec: 'Northrop Grumman LEOStar-3 octagonal bus wrapped in crinkled gold aluminized Kapton MLI thermal blankets with silver radiator louvers.', status: '291 K STABLE', offset: [0.35, 0, 0] },
            { id: 'optics', name: 'OLI-2 & TIRS-2 Cryo-Optical Bench', spec: '9-band visible/SWIR pushbroom telescope and dual-channel thermal infrared sensor with stray-light earth-shield baffles cooled to 43 K.', status: 'CRYO 43 K LOCK', offset: [-0.45, 0.15, 0.45] },
            { id: 'dish', name: 'X-Band Gimballed High-Gain Antenna', spec: 'Articulated X-band parabolic dish with 3-strut Cassegrain feed horn and welded gimbal mount downlinking 384 Mbps imagery.', status: '384 MBPS LINK', offset: [-0.48, -0.42, 0] },
            { id: 'thruster', name: 'Hydrazine Propulsion & Launch Ring', spec: 'Aft Marman clamp launch vehicle adapter ring housing redundant monopropellant hydrazine thrusters for orbital drag makeup.', status: 'PRESSURIZED', offset: [0.55, 0, 0] }
        ]
    },
    tdrsm: {
        name: 'NASA TDRS-M DATA RELAY',
        badge: 'NASA SCaN // GEO 35,786 KM',
        altitudeKm: '35,786',
        regime: 'GEOSYNCHRONOUS RELAY',
        inclination: '07°',
        officialUrl: 'https://www.nasa.gov/missions/tdrs/tracking-and-data-relay-satellite-tdrs-generations-of-spacecraft/',
        copyright: '© Public Domain // NASA Goddard Space Flight Center / SCaN (NP-2022-3-742-GSFC)',
        apaCitation: 'National Aeronautics and Space Administration, Space Communications and Navigation (SCaN). (2022). <em>Tracking and Data Relay Satellite (TDRS) generations of spacecraft fact sheet</em>. NASA Official Publications. <a href="https://www.nasa.gov/missions/tdrs/tracking-and-data-relay-satellite-tdrs-generations-of-spacecraft/" target="_blank" rel="noopener noreferrer" class="text-cyan-300 hover:underline">https://www.nasa.gov/missions/tdrs/tracking-and-data-relay-satellite-tdrs-generations-of-spacecraft/</a>',
        desc: 'Third-generation NASA Tracking and Data Relay Satellite featuring dual 4.6-meter deployable gold molybdenum wire-mesh parabolic reflectors.',
        parts: [
            { id: 'dualdishes', name: 'Dual 4.6m Spring-Back Mesh Dishes', spec: 'Twin articulated Single-Access molybdenum gold-mesh parabolic reflectors with radial ribs tracking two LEO missions across S, Ku, and Ka bands.', status: 'DUAL S/Ka LOCK', offset: [-0.45, 0.25, 0] },
            { id: 'phased', name: 'S-Band Multiple Access Phased Array', spec: 'Earth-facing 32-element helical dipole phased-array panel and Space-to-Ground Link (SGL) dish receiving telemetry from 5 spacecraft.', status: '5-LINK ACTIVE', offset: [-0.48, -0.25, 0] },
            { id: 'bus', name: 'BSS-601HP Gold-Blanketed Comms Bus', spec: 'Hexagonal geostationary bus housing Traveling Wave Tube Amplifiers (TWTAs), silver radiator mirrors, and C-band omni mast.', status: 'THERMAL NOMINAL', offset: [0.30, 0, 0] },
            { id: 'solar', name: 'Twin High-Span GEO Solar Wings', spec: 'North/South 4-panel articulated solar wings with yoke struts delivering 3.2 kW continuous bus power.', status: '3.24 kW BUS', offset: [0, 0.55, 0] },
            { id: 'thruster', name: 'Bipropellant Liquid Apogee Engine', spec: '490N liquid apogee motor + attitude control thrusters and spherical titanium propellant tanks.', status: 'NOMINAL', offset: [0.55, 0, 0] }
        ]
    },
    hubble: {
        name: 'HUBBLE SPACE TELESCOPE (HST)',
        badge: 'NASA / SMITHSONIAN NASM // 535 KM',
        altitudeKm: '535',
        regime: 'LOW EARTH ORBIT 28.5°',
        inclination: '28°',
        officialUrl: 'https://science.nasa.gov/mission/hubble/',
        copyright: '© Public Domain // NASA / ESA / Smithsonian NASM Archive (A19870194000)',
        apaCitation: 'National Aeronautics and Space Administration &amp; Smithsonian National Air and Space Museum. (2023). <em>Hubble Space Telescope observatory architecture and optical assembly archival record</em> (NASM-A19870194000). NASA Science. <a href="https://science.nasa.gov/mission/hubble/" target="_blank" rel="noopener noreferrer" class="text-cyan-300 hover:underline">https://science.nasa.gov/mission/hubble/</a>',
        desc: '2.4-meter Ritchey-Chrétien space observatory archived by the Smithsonian National Air and Space Museum, featuring a hinged aperture door.',
        parts: [
            { id: 'barrel', name: 'Corrugated Aluminum Light Shield', spec: 'Forward optical telescope tube with internal black stray-light baffles, secondary mirror spider struts, and 2.4m primary mirror.', status: 'BAFFLE CLEAR', offset: [-0.45, 0, 0] },
            { id: 'aperture', name: 'Hinged Contamination Aperture Door', spec: 'Honeycomb aluminum sun-avoidance aperture door bolted directly to the forward light shield lip via dual knuckle hinges and damper strut.', status: 'HINGED 105°', offset: [-0.42, 0.38, 0] },
            { id: 'aftshroud', name: 'Aft Equipment & Science Bay Shroud', spec: 'Houses Wide Field Camera 3 (WFC3), Cosmic Origins Spectrograph (COS), 4 reaction wheels, and 3-axis magnetometers.', status: 'GYRO LOCK', offset: [0.50, 0, 0] },
            { id: 'hga', name: 'Twin Mast High-Gain Relay Dishes', spec: 'Dual gimballed S/Ku-band parabolic dishes on deployable masts relaying science data via NASA TDRS constellation.', status: 'TDRS RELAY ON', offset: [0, 0, 0.55] },
            { id: 'solar', name: 'Twin Bi-Stem Solar Array Wings', spec: 'Roll-out high-efficiency gallium-arsenide solar wings with copper busbars supplying 2.8 kW orbital power.', status: '2.80 kW NOMINAL', offset: [0, 0.55, 0] }
        ]
    },
    nisar: {
        name: 'NISAR DUAL-BAND SAR (JPL)',
        badge: 'NASA / CALTECH JPL & ISRO // 747 KM',
        altitudeKm: '747',
        regime: 'DAWN-DUSK SUN-SYNC',
        inclination: '98°',
        officialUrl: 'https://science.nasa.gov/mission/nisar/',
        copyright: '© Public Domain // NASA / Caltech JPL / ISRO (PIA24575)',
        apaCitation: 'Jet Propulsion Laboratory, California Institute of Technology, &amp; National Aeronautics and Space Administration. (2025). <em>NASA-ISRO Synthetic Aperture Radar (NISAR) mission overview and engineering handbook</em>. NASA Science. <a href="https://science.nasa.gov/mission/nisar/" target="_blank" rel="noopener noreferrer" class="text-cyan-300 hover:underline">https://science.nasa.gov/mission/nisar/</a>',
        desc: 'NASA-ISRO Synthetic Aperture Radar mission combining L-band and S-band radar with a 12-meter deployable gold wire-mesh reflector boom.',
        parts: [
            { id: 'meshboom', name: '12m AstroMesh Gold Drum Reflector', spec: 'Northrop Grumman AstroMesh 12-meter perimeter-truss gold wire-mesh radar antenna deployed on an articulated carbon-composite boom.', status: 'DEPLOYED 12M', offset: [-0.50, 0.48, 0] },
            { id: 'sarfeed', name: 'L-Band & S-Band Radar Feed Structure', spec: 'JPL L-band (24 cm) and ISRO S-band (12 cm) sweep-SAR phased-array feed tiles housed in the forward thermal structure.', status: 'SWEEP-SAR ON', offset: [-0.35, -0.25, 0.35] },
            { id: 'bus', name: 'I-3K Octagonal Gold MLI Spacecraft Bus', spec: 'ISRO I-3K octagonal bus wrapped in gold Kapton thermal blankets with high-rate Ka-band science downlink gimbal.', status: '85 TB/DAY', offset: [0.50, 0, 0] },
            { id: 'solar', name: 'High-Power Dawn-Dusk Solar Wings', spec: 'Dual 4-panel GaAs solar wings continuously illuminated in a dawn-dusk sun-synchronous orbit generating 6.4 kW.', status: '6.40 kW BUS', offset: [0, 0.55, 0] }
        ]
    }
};

export function createSpacecraftMaterials() {
    const sCan = document.createElement('canvas');
    sCan.width = 512; sCan.height = 256;
    const sCtx = sCan.getContext('2d');
    const sg = sCtx.createLinearGradient(0, 0, 512, 256);
    sg.addColorStop(0, '#091b58'); sg.addColorStop(0.5, '#173ca8'); sg.addColorStop(1, '#0b226c');
    sCtx.fillStyle = sg; sCtx.fillRect(0, 0, 512, 256);
    for (let x = 0; x < 512; x += 32) {
        for (let y = 0; y < 256; y += 32) {
            sCtx.fillStyle = ((x + y) % 64 === 0) ? 'rgba(42, 108, 246, 0.30)' : 'rgba(18, 52, 145, 0.30)';
            sCtx.fillRect(x + 2, y + 2, 28, 28);
            sCtx.fillStyle = 'rgba(205, 235, 255, 0.72)';
            sCtx.fillRect(x + 2, y + 2, 4, 4);
        }
    }
    sCtx.strokeStyle = 'rgba(135, 210, 255, 0.60)'; sCtx.lineWidth = 1.5;
    for (let x = 0; x <= 512; x += 32) { sCtx.beginPath(); sCtx.moveTo(x, 0); sCtx.lineTo(x, 256); sCtx.stroke(); }
    for (let y = 0; y <= 256; y += 32) { sCtx.beginPath(); sCtx.moveTo(0, y); sCtx.lineTo(512, y); sCtx.stroke(); }
    const solarTex = new THREE.CanvasTexture(sCan);

    const kCan = document.createElement('canvas');
    kCan.width = 256; kCan.height = 256;
    const kCtx = kCan.getContext('2d');
    kCtx.fillStyle = '#d4941c'; kCtx.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 520; i++) {
        const x = (Math.sin(i * 12.9898) * 0.5 + 0.5) * 256;
        const y = (Math.cos(i * 78.233) * 0.5 + 0.5) * 256;
        const w = 8 + (i % 22);
        const h = 6 + ((i * 7) % 18);
        kCtx.fillStyle = i % 2 === 0 ? 'rgba(255, 220, 105, 0.38)' : 'rgba(130, 74, 8, 0.35)';
        kCtx.save();
        kCtx.translate(x, y);
        kCtx.rotate((i % 12) * 0.52);
        kCtx.fillRect(-w / 2, -h / 2, w, h);
        kCtx.restore();
    }
    const kaptonTex = new THREE.CanvasTexture(kCan);

    const wCan = document.createElement('canvas');
    wCan.width = 256; wCan.height = 256;
    const wCtx = wCan.getContext('2d');
    wCtx.fillStyle = '#cbd5e1'; wCtx.fillRect(0, 0, 256, 256);
    wCtx.strokeStyle = 'rgba(100, 116, 139, 0.35)'; wCtx.lineWidth = 1.5;
    for (let i = 0; i <= 256; i += 32) {
        wCtx.beginPath(); wCtx.moveTo(i, 0); wCtx.lineTo(i, 256); wCtx.stroke();
        wCtx.beginPath(); wCtx.moveTo(0, i); wCtx.lineTo(256, i); wCtx.stroke();
    }
    const whiteBetaTex = new THREE.CanvasTexture(wCan);

    const silCan = document.createElement('canvas');
    silCan.width = 256; silCan.height = 256;
    const silCtx = silCan.getContext('2d');
    silCtx.fillStyle = '#cbd5e1'; silCtx.fillRect(0, 0, 256, 256);
    for (let y = 0; y < 256; y += 6) {
        silCtx.fillStyle = (y % 12 === 0) ? '#e2e8f0' : '#94a3b8';
        silCtx.fillRect(0, y, 256, 3);
    }
    const silverTeflonTex = new THREE.CanvasTexture(silCan);

    return {
        whiteAerospace: new THREE.MeshStandardMaterial({ map: whiteBetaTex, bumpMap: whiteBetaTex, bumpScale: 0.012, color: 0xdbe4ee, metalness: 0.25, roughness: 0.52, side: THREE.DoubleSide }),
        silverTeflon: new THREE.MeshStandardMaterial({ map: silverTeflonTex, bumpMap: silverTeflonTex, bumpScale: 0.02, color: 0xd8e2ec, metalness: 0.72, roughness: 0.28, side: THREE.DoubleSide }),
        titaniumAlloy: new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.80, roughness: 0.28, side: THREE.DoubleSide }),
        darkCarbon: new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.55, roughness: 0.36, side: THREE.DoubleSide }),
        goldKapton: new THREE.MeshStandardMaterial({ map: kaptonTex, bumpMap: kaptonTex, bumpScale: 0.038, color: 0xffc436, metalness: 0.82, roughness: 0.26, side: THREE.DoubleSide }),
        solarCell: new THREE.MeshPhongMaterial({ map: solarTex, emissive: 0x07194d, specular: 0x7dd3fc, shininess: 95, side: THREE.DoubleSide }),
        goldMeshDish: new THREE.MeshStandardMaterial({ color: 0xf5b027, metalness: 0.84, roughness: 0.28, side: THREE.DoubleSide }),
        opticsMirror: new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.96, roughness: 0.08, side: THREE.DoubleSide })
    };
}

const satMats = createSpacecraftMaterials();

export function createStrutBetweenPoints(pA, pB, radius = 0.032, material = satMats.titaniumAlloy) {
    const dir = new THREE.Vector3().subVectors(pB, pA);
    const len = dir.length();
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, len, 12), material);
    mesh.position.copy(pA).add(pB).multiplyScalar(0.5);
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
    return mesh;
}

export function createParabolicDish(radius = 1.05, depth = 0.34, mat = satMats.whiteAerospace, addRadialRibs = true) {
    const dishGroup = new THREE.Group();
    const profile = [];
    for (let i = 0; i <= 16; i++) {
        const t = i / 16;
        profile.push(new THREE.Vector2(t * radius, (t * t) * depth));
    }
    const dishSurface = new THREE.Mesh(new THREE.LatheGeometry(profile, 40), mat);
    dishGroup.add(dishSurface);

    const backHub = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.24, radius * 0.30, 0.16, 24), satMats.titaniumAlloy);
    backHub.position.y = -0.07;
    dishGroup.add(backHub);

    const rim = new THREE.Mesh(new THREE.TorusGeometry(radius, 0.022, 12, 40).rotateX(Math.PI / 2), satMats.titaniumAlloy);
    rim.position.y = depth;
    dishGroup.add(rim);

    if (addRadialRibs) {
        for (let r = 0; r < 8; r++) {
            const ang = (r * Math.PI * 2) / 8;
            const ribEnd = new THREE.Vector3(Math.cos(ang) * radius, depth, Math.sin(ang) * radius);
            const ribStart = new THREE.Vector3(Math.cos(ang) * radius * 0.16, 0.01, Math.sin(ang) * radius * 0.16);
            dishGroup.add(createStrutBetweenPoints(ribStart, ribEnd, 0.010, satMats.titaniumAlloy));
        }
    }

    const feedCone = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.11, 0.24, 16), satMats.darkCarbon);
    feedCone.position.y = 0.12;
    dishGroup.add(feedCone);

    const focalY = depth + radius * 0.48;
    const subRef = new THREE.Mesh(new THREE.CylinderGeometry(0.10, 0.07, 0.08, 16), satMats.goldKapton);
    subRef.position.y = focalY;
    dishGroup.add(subRef);

    for (let k = 0; k < 3; k++) {
        const ang = (k * Math.PI * 2) / 3;
        const startVec = new THREE.Vector3(Math.cos(ang) * radius * 0.72, depth * 0.52, Math.sin(ang) * radius * 0.72);
        const endVec = new THREE.Vector3(0, focalY, 0);
        dishGroup.add(createStrutBetweenPoints(startVec, endVec, 0.014, satMats.titaniumAlloy));
    }
    return dishGroup;
}

export function createSegmentedSolarWing(signY = 1, panelCount = 4, panelWidth = 0.78, panelLength = 0.72, mountX = 0.0) {
    const wing = new THREE.Group();
    wing.position.x = mountX;

    const sadaDrive = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.13, 0.42, 18), satMats.titaniumAlloy);
    sadaDrive.position.set(0, signY * 0.52, 0);
    wing.add(sadaDrive);

    const yokeRoot = new THREE.Vector3(0, signY * 0.68, 0);
    const crossBarY = signY * 1.08;
    wing.add(createStrutBetweenPoints(yokeRoot, new THREE.Vector3(-panelWidth * 0.36, crossBarY, 0), 0.020, satMats.titaniumAlloy));
    wing.add(createStrutBetweenPoints(yokeRoot, new THREE.Vector3(panelWidth * 0.36, crossBarY, 0), 0.020, satMats.titaniumAlloy));

    const crossBar = new THREE.Mesh(new THREE.BoxGeometry(panelWidth, 0.04, 0.04), satMats.titaniumAlloy);
    crossBar.position.set(0, crossBarY, 0);
    wing.add(crossBar);

    for (let p = 0; p < panelCount; p++) {
        const py = signY * (1.12 + p * (panelLength + 0.04) + panelLength * 0.5);
        const backing = new THREE.Mesh(new THREE.BoxGeometry(panelWidth + 0.04, panelLength, 0.028), satMats.titaniumAlloy);
        backing.position.set(0, py, -0.01);
        wing.add(backing);

        const wafer = new THREE.Mesh(new THREE.BoxGeometry(panelWidth, panelLength - 0.03, 0.026), satMats.solarCell);
        wafer.position.set(0, py, 0.008);
        wing.add(wafer);

        if (p < panelCount - 1) {
            const hingeY = signY * (1.12 + (p + 1) * (panelLength + 0.04) - 0.02);
            [-panelWidth * 0.35, panelWidth * 0.35].forEach(hx => {
                const hinge = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.09, 10).rotateZ(Math.PI / 2), satMats.goldKapton);
                hinge.position.set(hx, hingeY, 0);
                wing.add(hinge);
            });
        }
    }
    return wing;
}

export function buildSpacecraftByType(type = 'landsat9') {
    const root = new THREE.Group();
    const partGroups = {};

    function registerPart(id, group) {
        partGroups[id] = group;
        group.userData.partId = id;
        group.userData.basePos = group.position.clone();
        group.userData.targetPos = group.position.clone();
        group.traverse(child => {
            if (child.isMesh) child.userData.partId = id;
        });
        root.add(group);
    }

    if (type === 'landsat9') {
        const busGroup = new THREE.Group();
        const goldBus = new THREE.Mesh(new THREE.CylinderGeometry(0.50, 0.50, 1.20, 8).rotateZ(Math.PI / 2), satMats.goldKapton);
        goldBus.position.set(0.35, 0, 0);
        busGroup.add(goldBus);

        const fwdPayloadDeck = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.50, 0.85, 8).rotateZ(Math.PI / 2), satMats.whiteAerospace);
        fwdPayloadDeck.position.set(-0.675, 0, 0);
        busGroup.add(fwdPayloadDeck);

        [1, -1].forEach(sz => {
            const radiator = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.38, 0.04), satMats.silverTeflon);
            radiator.position.set(0.35, 0, sz * 0.47);
            busGroup.add(radiator);
        });

        [-1.10, -0.25, 0.95].forEach((rx, idx) => {
            const rRad = idx === 0 ? 0.46 : 0.50;
            const ring = new THREE.Mesh(new THREE.TorusGeometry(rRad, 0.026, 12, 32).rotateY(Math.PI / 2), satMats.titaniumAlloy);
            ring.position.set(rx, 0, 0);
            busGroup.add(ring);
        });
        registerPart('bus', busGroup);

        const opticsGroup = new THREE.Group();
        const benchPlate = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.42, 0.16), satMats.titaniumAlloy);
        benchPlate.position.set(-0.68, 0.0, 0.42);
        opticsGroup.add(benchPlate);

        const oliBarrel = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.20, 0.46, 24).rotateX(Math.PI / 2), satMats.darkCarbon);
        oliBarrel.position.set(-0.52, 0.06, 0.58);
        opticsGroup.add(oliBarrel);

        const oliShade = new THREE.Mesh(new THREE.CylinderGeometry(0.20, 0.17, 0.18, 24, 1, true).rotateX(Math.PI / 2), satMats.titaniumAlloy);
        oliShade.position.set(-0.52, 0.06, 0.84);
        opticsGroup.add(oliShade);

        const oliLens = new THREE.Mesh(new THREE.CircleGeometry(0.15, 24), satMats.opticsMirror);
        oliLens.position.set(-0.52, 0.06, 0.80);
        opticsGroup.add(oliLens);

        const tirsBarrel = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.15, 0.42, 24).rotateX(Math.PI / 2), satMats.goldKapton);
        tirsBarrel.position.set(-0.84, -0.06, 0.56);
        opticsGroup.add(tirsBarrel);

        const tirsEarthShield = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.36, 0.035), satMats.silverTeflon);
        tirsEarthShield.position.set(-0.84, -0.22, 0.65);
        tirsEarthShield.rotation.x = 0.28;
        opticsGroup.add(tirsEarthShield);
        registerPart('optics', opticsGroup);

        const dishGroup = new THREE.Group();
        const mountCollar = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.10, 0.12, 16), satMats.titaniumAlloy);
        mountCollar.position.set(-0.82, -0.44, 0);
        dishGroup.add(mountCollar);

        const boomStart = new THREE.Vector3(-0.82, -0.44, 0);
        const boomEnd = new THREE.Vector3(-1.26, -0.82, 0);
        dishGroup.add(createStrutBetweenPoints(boomStart, boomEnd, 0.036, satMats.titaniumAlloy));

        const gimbalJoint = new THREE.Mesh(new THREE.SphereGeometry(0.075, 16, 16), satMats.goldKapton);
        gimbalJoint.position.copy(boomEnd);
        dishGroup.add(gimbalJoint);

        const xbandDish = createParabolicDish(0.62, 0.20, satMats.whiteAerospace, true);
        xbandDish.position.copy(boomEnd);
        xbandDish.rotation.z = Math.PI / 2.25;
        dishGroup.add(xbandDish);
        registerPart('dish', dishGroup);

        const thrusterGroup = new THREE.Group();
        const adapterCone = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.50, 0.26, 24).rotateZ(Math.PI / 2), satMats.titaniumAlloy);
        adapterCone.position.set(1.08, 0, 0);
        thrusterGroup.add(adapterCone);

        for (let k = 0; k < 4; k++) {
            const ang = (k * Math.PI) / 2 + Math.PI / 4;
            const rcsNozzle = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.16, 14).rotateZ(-Math.PI / 2), satMats.darkCarbon);
            rcsNozzle.position.set(1.24, Math.cos(ang) * 0.30, Math.sin(ang) * 0.30);
            thrusterGroup.add(rcsNozzle);
        }
        registerPart('thruster', thrusterGroup);

        const solarGroup = new THREE.Group();
        const singleWing = createSegmentedSolarWing(1, 4, 0.86, 0.68, 0.25);
        singleWing.rotation.z = -0.06;
        solarGroup.add(singleWing);
        registerPart('solar', solarGroup);

    } else if (type === 'tdrsm') {
        const busGroup = new THREE.Group();
        const hexBus = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.58, 1.40, 6).rotateZ(Math.PI / 2), satMats.goldKapton);
        busGroup.add(hexBus);

        [1, -1].forEach(sz => {
            const mirrorPanel = new THREE.Mesh(new THREE.BoxGeometry(1.16, 0.50, 0.03), satMats.silverTeflon);
            mirrorPanel.position.set(0, 0, sz * 0.51);
            busGroup.add(mirrorPanel);
        });
        registerPart('bus', busGroup);

        const phasedGroup = new THREE.Group();
        const phasedBase = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.74, 0.84), satMats.whiteAerospace);
        phasedBase.position.set(-0.74, 0, 0);
        phasedGroup.add(phasedBase);

        for (let hx = -0.26; hx <= 0.26; hx += 0.17) {
            for (let hy = -0.24; hy <= 0.24; hy += 0.16) {
                const helix = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.022, 0.16, 8).rotateZ(Math.PI / 2), satMats.goldKapton);
                helix.position.set(-0.86, hy, hx);
                phasedGroup.add(helix);
            }
        }

        const sglRoot = new THREE.Vector3(-0.35, -0.48, 0.22);
        const sglEnd = new THREE.Vector3(-0.62, -0.98, 0.22);
        phasedGroup.add(createStrutBetweenPoints(sglRoot, sglEnd, 0.028, satMats.titaniumAlloy));

        const sglJoint = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 12), satMats.titaniumAlloy);
        sglJoint.position.copy(sglEnd);
        phasedGroup.add(sglJoint);

        const sglDish = createParabolicDish(0.44, 0.15, satMats.whiteAerospace, false);
        sglDish.position.copy(sglEnd);
        sglDish.rotation.z = Math.PI / 2.2;
        phasedGroup.add(sglDish);
        registerPart('phased', phasedGroup);

        const dualDishesGroup = new THREE.Group();
        [-1, 1].forEach(sideZ => {
            const rootPt = new THREE.Vector3(-0.18, 0.08, sideZ * 0.48);
            const elbowPt = new THREE.Vector3(-0.18, 0.08, sideZ * 1.68);
            const dishVertexPt = new THREE.Vector3(-0.55, 0.12, sideZ * 1.68);

            dualDishesGroup.add(createStrutBetweenPoints(rootPt, elbowPt, 0.036, satMats.darkCarbon));
            const elbow = new THREE.Mesh(new THREE.SphereGeometry(0.068, 14, 14), satMats.titaniumAlloy);
            elbow.position.copy(elbowPt);
            dualDishesGroup.add(elbow);

            dualDishesGroup.add(createStrutBetweenPoints(elbowPt, dishVertexPt, 0.034, satMats.titaniumAlloy));

            const saDish = createParabolicDish(0.98, 0.32, satMats.goldMeshDish, true);
            saDish.position.copy(dishVertexPt);
            saDish.rotation.z = Math.PI / 2.35;
            saDish.rotation.x = sideZ * 0.18;
            dualDishesGroup.add(saDish);
        });
        registerPart('dualdishes', dualDishesGroup);

        const thrusterGroup = new THREE.Group();
        const apogeeShield = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.52, 0.24, 20).rotateZ(Math.PI / 2), satMats.titaniumAlloy);
        apogeeShield.position.set(0.80, 0, 0);
        thrusterGroup.add(apogeeShield);

        const apogeeNozzle = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.40, 24).rotateZ(-Math.PI / 2), satMats.darkCarbon);
        apogeeNozzle.position.set(1.04, 0, 0);
        thrusterGroup.add(apogeeNozzle);
        registerPart('thruster', thrusterGroup);

        const solarGroup = new THREE.Group();
        solarGroup.add(createSegmentedSolarWing(1, 4, 0.78, 0.66, 0.0));
        solarGroup.add(createSegmentedSolarWing(-1, 4, 0.78, 0.66, 0.0));
        registerPart('solar', solarGroup);

    } else if (type === 'hubble') {
        const aftGroup = new THREE.Group();
        const aftShroud = new THREE.Mesh(new THREE.CylinderGeometry(0.60, 0.60, 1.16, 36).rotateZ(Math.PI / 2), satMats.silverTeflon);
        aftShroud.position.set(0.70, 0, 0);
        aftGroup.add(aftShroud);

        const aftBulkhead = new THREE.Mesh(new THREE.CircleGeometry(0.60, 36).rotateY(Math.PI / 2), satMats.goldKapton);
        aftBulkhead.position.set(1.28, 0, 0);
        aftGroup.add(aftBulkhead);

        [-1, 1].forEach(sy => {
            const handrail = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.022, 0.022), satMats.goldKapton);
            handrail.position.set(0.70, sy * 0.63, 0);
            aftGroup.add(handrail);
        });
        registerPart('aftshroud', aftGroup);

        const barrelGroup = new THREE.Group();
        const opticalTube = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.46, 1.48, 36).rotateZ(Math.PI / 2), satMats.silverTeflon);
        opticalTube.position.set(-0.62, 0, 0);
        barrelGroup.add(opticalTube);

        const innerBaffle = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 1.44, 32, 1, true).rotateZ(Math.PI / 2), satMats.darkCarbon);
        innerBaffle.position.set(-0.62, 0, 0);
        barrelGroup.add(innerBaffle);

        for (let r = -1.32; r <= 0.10; r += 0.28) {
            const rib = new THREE.Mesh(new THREE.TorusGeometry(0.47, 0.018, 12, 36).rotateY(Math.PI / 2), satMats.titaniumAlloy);
            rib.position.set(r, 0, 0);
            barrelGroup.add(rib);
        }

        const primaryMirror = new THREE.Mesh(new THREE.CircleGeometry(0.41, 32).rotateY(-Math.PI / 2), satMats.opticsMirror);
        primaryMirror.position.set(-0.15, 0, 0);
        barrelGroup.add(primaryMirror);

        const secMirrorHousing = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.18, 20).rotateZ(Math.PI / 2), satMats.titaniumAlloy);
        secMirrorHousing.position.set(-1.12, 0, 0);
        barrelGroup.add(secMirrorHousing);

        for (let s = 0; s < 4; s++) {
            const spiderVane = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.82, 0.012), satMats.titaniumAlloy);
            spiderVane.position.set(-1.12, 0, 0);
            spiderVane.rotation.x = (s * Math.PI) / 2;
            barrelGroup.add(spiderVane);
        }

        const forwardLipRing = new THREE.Mesh(new THREE.TorusGeometry(0.465, 0.024, 14, 40).rotateY(Math.PI / 2), satMats.titaniumAlloy);
        forwardLipRing.position.set(-1.36, 0, 0);
        barrelGroup.add(forwardLipRing);
        registerPart('barrel', barrelGroup);

        // Fixed Hubble Aperture Door: Bolted & hinged directly to the top forward rim (-1.36, 0.46, 0)
        const doorGroup = new THREE.Group();
        const hingePoint = new THREE.Vector3(-1.36, 0.46, 0);

        [-0.18, 0.18].forEach(hz => {
            const knuckle = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.09, 0.06), satMats.titaniumAlloy);
            knuckle.position.set(-1.33, 0.45, hz);
            doorGroup.add(knuckle);
        });

        const hingeBar = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.032, 0.48, 16).rotateX(Math.PI / 2), satMats.titaniumAlloy);
        hingeBar.position.copy(hingePoint);
        doorGroup.add(hingeBar);

        const doorFlapPivot = new THREE.Group();
        doorFlapPivot.position.copy(hingePoint);
        doorFlapPivot.rotation.z = -0.38;

        [-0.16, 0.16].forEach(hz => {
            const arm = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.045, 0.045), satMats.titaniumAlloy);
            arm.position.set(-0.23, 0.015, hz);
            doorFlapPivot.add(arm);
        });

        const outerDoorDisk = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.46, 0.038, 36).rotateX(Math.PI / 2), satMats.silverTeflon);
        outerDoorDisk.position.set(-0.46, 0.0, 0);
        doorFlapPivot.add(outerDoorDisk);

        const doorRimTorus = new THREE.Mesh(new THREE.TorusGeometry(0.46, 0.022, 12, 36), satMats.titaniumAlloy);
        doorRimTorus.position.set(-0.46, 0.0, 0);
        doorFlapPivot.add(doorRimTorus);

        const innerGoldDisk = new THREE.Mesh(new THREE.CylinderGeometry(0.43, 0.43, 0.042, 36).rotateX(Math.PI / 2), satMats.goldKapton);
        innerGoldDisk.position.set(-0.46, -0.008, 0);
        doorFlapPivot.add(innerGoldDisk);

        doorGroup.add(doorFlapPivot);

        const strutBarrelAnchor = new THREE.Vector3(-1.22, 0.44, 0.0);
        const doorAttachLocal = new THREE.Vector3(-0.32, -0.02, 0.0).applyEuler(doorFlapPivot.rotation).add(hingePoint);
        doorGroup.add(createStrutBetweenPoints(strutBarrelAnchor, doorAttachLocal, 0.018, satMats.goldKapton));

        registerPart('aperture', doorGroup);

        const hgaGroup = new THREE.Group();
        [-1, 1].forEach(sideZ => {
            const mastStart = new THREE.Vector3(0.06, 0, sideZ * 0.46);
            const mastEnd = new THREE.Vector3(0.06, 0, sideZ * 1.18);
            hgaGroup.add(createStrutBetweenPoints(mastStart, mastEnd, 0.024, satMats.titaniumAlloy));

            const hgaJoint = new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 12), satMats.titaniumAlloy);
            hgaJoint.position.copy(mastEnd);
            hgaGroup.add(hgaJoint);

            const smallDish = createParabolicDish(0.32, 0.11, satMats.whiteAerospace, true);
            smallDish.position.copy(mastEnd);
            smallDish.rotation.x = sideZ > 0 ? Math.PI / 2 : -Math.PI / 2;
            hgaGroup.add(smallDish);
        });
        registerPart('hga', hgaGroup);

        const solarGroup = new THREE.Group();
        solarGroup.add(createSegmentedSolarWing(1, 3, 0.82, 0.78, -0.15));
        solarGroup.add(createSegmentedSolarWing(-1, 3, 0.82, 0.78, -0.15));
        registerPart('solar', solarGroup);

    } else {
        const busGroup = new THREE.Group();
        const nisarBus = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.52, 1.10, 8).rotateZ(Math.PI / 2), satMats.goldKapton);
        nisarBus.position.set(0.50, 0, 0);
        busGroup.add(nisarBus);

        const aftCone = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.50, 0.24, 20).rotateZ(Math.PI / 2), satMats.titaniumAlloy);
        aftCone.position.set(1.16, 0, 0);
        busGroup.add(aftCone);
        registerPart('bus', busGroup);

        const sarFeedGroup = new THREE.Group();
        const sarPayload = new THREE.Mesh(new THREE.BoxGeometry(1.00, 0.74, 0.74), satMats.whiteAerospace);
        sarPayload.position.set(-0.55, 0, 0);
        sarFeedGroup.add(sarPayload);

        const lBandTile = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.12, 0.60), satMats.goldKapton);
        lBandTile.position.set(-0.55, 0.42, 0);
        sarFeedGroup.add(lBandTile);

        const sBandTile = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.14, 0.46), satMats.silverTeflon);
        sBandTile.position.set(-0.82, 0.44, 0);
        sarFeedGroup.add(sBandTile);
        registerPart('sarfeed', sarFeedGroup);

        const meshBoomGroup = new THREE.Group();
        const p0 = new THREE.Vector3(-0.85, 0.36, 0);
        const p1 = new THREE.Vector3(-1.55, 0.85, 0);
        const p2 = new THREE.Vector3(-2.15, 1.25, 0);

        meshBoomGroup.add(createStrutBetweenPoints(p0, p1, 0.048, satMats.darkCarbon));
        const hingeJoint = new THREE.Mesh(new THREE.SphereGeometry(0.085, 16, 16), satMats.titaniumAlloy);
        hingeJoint.position.copy(p1);
        meshBoomGroup.add(hingeJoint);

        meshBoomGroup.add(createStrutBetweenPoints(p1, p2, 0.042, satMats.darkCarbon));
        const wristJoint = new THREE.Mesh(new THREE.SphereGeometry(0.075, 16, 16), satMats.titaniumAlloy);
        wristJoint.position.copy(p2);
        meshBoomGroup.add(wristJoint);

        const drumRing = new THREE.Mesh(new THREE.CylinderGeometry(1.18, 1.18, 0.22, 24, 1, true), satMats.darkCarbon);
        drumRing.position.copy(p2);
        drumRing.rotation.z = Math.PI / 1.45;
        meshBoomGroup.add(drumRing);

        const meshReflector = createParabolicDish(1.16, 0.24, satMats.goldMeshDish, true);
        meshReflector.position.copy(p2);
        meshReflector.rotation.z = Math.PI / 1.45;
        meshBoomGroup.add(meshReflector);
        registerPart('meshboom', meshBoomGroup);

        const solarGroup = new THREE.Group();
        solarGroup.add(createSegmentedSolarWing(1, 4, 0.80, 0.68, 0.45));
        solarGroup.add(createSegmentedSolarWing(-1, 4, 0.80, 0.68, 0.45));
        registerPart('solar', solarGroup);
    }

    Object.keys(partGroups).forEach(pid => {
        const grp = partGroups[pid];
        grp.traverse(child => {
            if (child.isMesh && child.material) {
                child.material = child.material.clone();
                child.userData.origEmissive = child.material.emissive ? child.material.emissive.clone() : new THREE.Color(0x000000);
            }
        });
    });

    root.userData.partGroups = partGroups;
    return root;
}