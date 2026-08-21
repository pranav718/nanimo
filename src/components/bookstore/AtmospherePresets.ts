import * as THREE from 'three';

export type AtmospherePreset = 'midnight' | 'sunset' | 'rain';

export interface AtmosphereConfig {
    id: AtmospherePreset;
    name: string;
    bgColor: number;
    fogColor: number;
    fogDensity: number;
    ambientColor: number;
    ambientIntensity: number;
    sunColor: number;
    sunIntensity: number;
    sunPosition: [number, number, number];
}

export const ATMOSPHERE_PRESETS: Record<AtmospherePreset, AtmosphereConfig> = {
    midnight: {
        id: 'midnight',
        name: 'Cyber Midnight',
        bgColor: 0x0a0808,
        fogColor: 0x0a0808,
        fogDensity: 0.018,
        ambientColor: 0xffeedd,
        ambientIntensity: 0.9,
        sunColor: 0xfff0dd,
        sunIntensity: 1.2,
        sunPosition: [10, 20, 10],
    },
    sunset: {
        id: 'sunset',
        name: 'Golden Sunset',
        bgColor: 0x1f1008,
        fogColor: 0x2a140a,
        fogDensity: 0.015,
        ambientColor: 0xffaa77,
        ambientIntensity: 1.1,
        sunColor: 0xff7722,
        sunIntensity: 2.2,
        sunPosition: [-20, 8, -15],
    },
    rain: {
        id: 'rain',
        name: 'Misty Rain',
        bgColor: 0x0b1118,
        fogColor: 0x0e1722,
        fogDensity: 0.024,
        ambientColor: 0x93c5fd,
        ambientIntensity: 0.8,
        sunColor: 0x60a5fa,
        sunIntensity: 0.9,
        sunPosition: [5, 18, 5],
    },
};

export function applyAtmosphere(
    preset: AtmospherePreset,
    scene: THREE.Scene,
    lights: THREE.Light[]
) {
    const config = ATMOSPHERE_PRESETS[preset] || ATMOSPHERE_PRESETS.midnight;
    scene.background = new THREE.Color(config.bgColor);
    scene.fog = new THREE.FogExp2(config.fogColor, config.fogDensity);

    lights.forEach((light) => {
        if (light instanceof THREE.AmbientLight) {
            light.color.setHex(config.ambientColor);
            light.intensity = config.ambientIntensity;
        } else if (light instanceof THREE.DirectionalLight) {
            light.color.setHex(config.sunColor);
            light.intensity = config.sunIntensity;
            light.position.set(...config.sunPosition);
        }
    });
}
