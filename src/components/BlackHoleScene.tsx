'use client';

import { useCallback, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { CopyShader } from 'three/examples/jsm/shaders/CopyShader.js';

interface BlackHoleSceneProps {
    onEnter?: () => void;
    isExpanding?: boolean;
}

const vertexShader = `
void main() {
    gl_Position = vec4(position, 1.0);
}
`;

const fragmentShader = `
#define PI 3.141592653589793
#define DEG_TO_RAD 0.017453292519943295
#define STEP 0.05
#define NSTEPS 600
#define ROT_Z(a) mat3(cos(a), -sin(a), 0.0, sin(a), cos(a), 0.0, 0.0, 0.0, 1.0)

uniform float time;
uniform vec2 resolution;

uniform vec3 cam_pos;
uniform vec3 cam_dir;
uniform vec3 cam_up;
uniform float fov;
uniform vec3 cam_vel;

const float MIN_TEMPERATURE = 1000.0;
const float TEMPERATURE_RANGE = 39000.0;

uniform bool accretion_disk;
uniform bool use_disk_texture;
const float DISK_IN = 2.0;
const float DISK_WIDTH = 2.5;

uniform bool doppler_shift;
uniform bool lorentz_transform;
uniform bool beaming;

uniform sampler2D bg_texture;
uniform sampler2D star_texture;
uniform sampler2D disk_texture;

vec2 square_frame(vec2 screen_size) {
    vec2 position = 2.0 * (gl_FragCoord.xy / screen_size.xy) - 1.0;
    return position;
}

vec2 to_spherical(vec3 cartesian_coord) {
    vec2 uv = vec2(atan(cartesian_coord.z, cartesian_coord.x), asin(cartesian_coord.y));
    uv *= vec2(1.0 / (2.0 * PI), 1.0 / PI);
    uv += 0.5;
    return uv;
}

vec3 lorentz_transform_velocity(vec3 u, vec3 v) {
    float speed = length(v);
    if (speed > 0.0) {
        float gamma = 1.0 / sqrt(1.0 - dot(v, v));
        float denominator = 1.0 - dot(v, u);
        vec3 new_u = (u / gamma - v + (gamma / (gamma + 1.0)) * dot(u, v) * v) / denominator;
        return new_u;
    }
    return u;
}

vec3 temp_to_color(float temp_kelvin) {
    vec3 color;
    temp_kelvin = clamp(temp_kelvin, 1000.0, 40000.0) / 100.0;
    if (temp_kelvin <= 66.0) {
        color.r = 255.0;
        color.g = temp_kelvin;
        color.g = 99.4708025861 * log(color.g) - 161.1195681661;
        if (color.g < 0.0) color.g = 0.0;
        if (color.g > 255.0) color.g = 255.0;
    } else {
        color.r = temp_kelvin - 60.0;
        if (color.r < 0.0) color.r = 0.0;
        color.r = 329.698727446 * pow(color.r, -0.1332047592);
        if (color.r < 0.0) color.r = 0.0;
        if (color.r > 255.0) color.r = 255.0;
        color.g = temp_kelvin - 60.0;
        if (color.g < 0.0) color.g = 0.0;
        color.g = 288.1221695283 * pow(color.g, -0.0755148492);
        if (color.g > 255.0) color.g = 255.0;
    }
    if (temp_kelvin >= 66.0) {
        color.b = 255.0;
    } else if (temp_kelvin <= 19.0) {
        color.b = 0.0;
    } else {
        color.b = temp_kelvin - 10.0;
        color.b = 138.5177312231 * log(color.b) - 305.0447927307;
        if (color.b < 0.0) color.b = 0.0;
        if (color.b > 255.0) color.b = 255.0;
    }
    color /= 255.0;
    return color;
}

void main() {
    float uvfov = tan(fov / 2.0 * DEG_TO_RAD);
    vec2 uv = square_frame(resolution);
    uv *= vec2(resolution.x / resolution.y, 1.0);
    
    vec3 forward = normalize(cam_dir);
    vec3 up = normalize(cam_up);
    vec3 nright = normalize(cross(forward, up));
    up = cross(nright, forward);
    
    vec3 pixel_pos = cam_pos + forward + nright * uv.x * uvfov + up * uv.y * uvfov;
    vec3 ray_dir = normalize(pixel_pos - cam_pos);

    if (lorentz_transform)
        ray_dir = lorentz_transform_velocity(ray_dir, cam_vel);

    vec4 color = vec4(0.0, 0.0, 0.0, 1.0);

    vec3 point = cam_pos;
    vec3 velocity = ray_dir;
    vec3 c = cross(point, velocity);
    float h2 = dot(c, c);

    float ray_gamma = 1.0 / sqrt(1.0 - dot(cam_vel, cam_vel));
    float ray_doppler_factor = ray_gamma * (1.0 + dot(ray_dir, -cam_vel));

    float ray_intensity = 1.0;
    if (beaming)
        ray_intensity /= pow(ray_doppler_factor, 3.0);

    vec3 oldpoint;
    float distance = length(point);

    for (int i = 0; i < NSTEPS; i++) {
        oldpoint = point;
        point += velocity * STEP;
        vec3 accel = -1.5 * h2 * point / pow(dot(point, point), 2.5);
        velocity += accel * STEP;

        distance = length(point);
        if (distance < 0.0) break;

        bool horizon_mask = distance < 1.0 && length(oldpoint) > 1.0;
        if (horizon_mask) {
            color += vec4(0.0, 0.0, 0.0, 1.0);
            break;
        }

        if (accretion_disk) {
            if (oldpoint.y * point.y < 0.0) {
                float lambda = -oldpoint.y / velocity.y;
                vec3 intersection = oldpoint + lambda * velocity;
                float r = length(intersection);
                if (DISK_IN <= r && r <= DISK_IN + DISK_WIDTH) {
                    float phi = atan(intersection.x, intersection.z);
                    vec3 disk_velocity = vec3(-intersection.x, 0.0, intersection.z) / sqrt(2.0 * (r - 1.0)) / (r * r);
                    phi -= time;
                    phi = mod(phi, PI * 2.0);
                    float disk_gamma = 1.0 / sqrt(1.0 - dot(disk_velocity, disk_velocity));
                    float disk_doppler_factor = disk_gamma * (1.0 + dot(ray_dir / distance, disk_velocity));

                    if (use_disk_texture) {
                        vec2 tex_coord = vec2(mod(phi, 2.0 * PI) / (2.0 * PI), 1.0 - (r - DISK_IN) / DISK_WIDTH);
                        vec4 disk_color = texture2D(disk_texture, tex_coord) / (ray_doppler_factor * disk_doppler_factor);
                        float disk_alpha = clamp(dot(disk_color, disk_color) / 7.0, 0.0, 1.0);
                        if (beaming) disk_alpha /= pow(disk_doppler_factor, 3.0);
                        color += disk_color * disk_alpha;
                    } else {
                        float disk_temperature = 10000.0 * pow(r / DISK_IN, -3.0 / 4.0);
                        if (doppler_shift) disk_temperature /= ray_doppler_factor * disk_doppler_factor;
                        vec3 disk_color = temp_to_color(disk_temperature);
                        float disk_alpha = clamp(dot(disk_color, disk_color) / 3.0, 0.0, 1.0);
                        if (beaming) disk_alpha /= pow(disk_doppler_factor, 3.0);
                        color += vec4(disk_color, 1.0) * disk_alpha;
                    }
                }
            }
        }
    }

    if (distance > 1.0) {
        ray_dir = normalize(point - oldpoint);
        vec2 tex_coord = to_spherical(ray_dir * ROT_Z(45.0 * DEG_TO_RAD));
        vec4 star_color = texture2D(star_texture, tex_coord);
        if (star_color.g > 0.0) {
            float star_temperature = MIN_TEMPERATURE + TEMPERATURE_RANGE * star_color.r;
            float star_velocity = star_color.b - 0.5;
            float star_doppler_factor = sqrt((1.0 + star_velocity) / (1.0 - star_velocity));
            if (doppler_shift) star_temperature /= ray_doppler_factor * star_doppler_factor;
            color += vec4(temp_to_color(star_temperature), 1.0) * star_color.g;
        }
        color += texture2D(bg_texture, tex_coord) * 0.25;
    }
    
    gl_FragColor = color * ray_intensity;
}
`;

const warpVertexShader = `
varying vec2 vUv;
void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const warpFragmentShader = `
uniform float warpProgress;
uniform float time;
uniform vec2 resolution;

varying vec2 vUv;

float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

void main() {
    vec2 uv = vUv * 2.0 - 1.0;
    uv.x *= resolution.x / resolution.y;
    
    float angle = atan(uv.y, uv.x);
    float dist = length(uv);
    
    float sideMask = 1.0 - smoothstep(0.0, 0.5, abs(cos(angle)));
    
    float tunnelDist = 0.3 / dist;
    
    float starAngle = angle * 30.0;
    float starId = floor(starAngle);
    float starFrac = fract(starAngle);
    
    float starRandom = random(vec2(starId, 0.0));
    float starBrightness = step(0.85, starRandom);
    
    float elongation = warpProgress * 15.0;
    float streakPattern = smoothstep(0.4 - elongation * 0.02, 0.5, starFrac) * 
                          smoothstep(0.6 + elongation * 0.02, 0.5, starFrac);
    
    float radialMove = fract(tunnelDist * 0.5 - time * 2.0 * warpProgress);
    float radialFade = smoothstep(0.0, 0.3, radialMove) * smoothstep(1.0, 0.7, radialMove);
    
    float star = streakPattern * radialFade * starBrightness * sideMask;
    star *= smoothstep(0.0, 0.2, warpProgress); 
    star *= (1.0 - smoothstep(0.8, 1.0, warpProgress)); 
    
    vec3 starColor = mix(vec3(0.7, 0.8, 1.0), vec3(1.0), starRandom);
    
    float centerGlow = (1.0 - dist) * warpProgress * 0.5;
    vec3 glowColor = vec3(1.0, 0.95, 0.9);
    
    vec3 finalColor = star * starColor * 2.0 + centerGlow * glowColor;
    float alpha = star + centerGlow * 0.5;
    
    gl_FragColor = vec4(finalColor, alpha * warpProgress);
}
`;

class Observer {
    position: THREE.Vector3;
    direction: THREE.Vector3;
    up: THREE.Vector3;
    velocity: THREE.Vector3;
    fov: number;
    r: number;
    theta: number;
    angularVelocity: number;
    maxAngularVelocity: number;
    moving: boolean;
    incline: number;

    constructor(fov: number) {
        this.fov = fov;
        this.position = new THREE.Vector3(0, 0, 1);
        this.direction = new THREE.Vector3(0, 0, -1);
        this.up = new THREE.Vector3(0, 1, 0);
        this.velocity = new THREE.Vector3(0, 0, 0);
        this.r = 10;
        this.theta = 0;
        this.angularVelocity = 0;
        this.maxAngularVelocity = 0;
        this.moving = false;
        this.incline = -5 * Math.PI / 180;
    }

    set distance(r: number) {
        this.r = r;
        this.maxAngularVelocity = 1 / Math.sqrt(2.0 * (r - 1.0)) / this.r;
        this.position.normalize().multiplyScalar(r);
    }

    setDirection(pitch: number, yaw: number) {
        const originalDirection = new THREE.Vector3(0, 0, -1);
        const rotation = new THREE.Euler(pitch, yaw, 0, 'YXZ');
        const newDirection = new THREE.Vector3();
        newDirection.copy(originalDirection).applyEuler(rotation);
        this.direction = newDirection.normalize();
    }

    update(delta: number) {
        this.theta += this.angularVelocity * delta;
        const cos = Math.cos(this.theta);
        const sin = Math.sin(this.theta);

        this.position.set(this.r * sin, 0, this.r * cos);
        this.velocity.set(cos * this.angularVelocity, 0, -sin * this.angularVelocity);

        const inclineMatrix = new THREE.Matrix4().makeRotationX(this.incline);
        this.position.applyMatrix4(inclineMatrix);
        this.velocity.applyMatrix4(inclineMatrix);

        if (this.moving) {
            if (this.angularVelocity < this.maxAngularVelocity) {
                this.angularVelocity += delta / this.r;
            } else {
                this.angularVelocity = this.maxAngularVelocity;
            }
        } else {
            if (this.angularVelocity > 0.0) {
                this.angularVelocity -= delta / this.r;
            } else {
                this.angularVelocity = 0;
                this.velocity.set(0, 0, 0);
            }
        }
    }
}

export default function BlackHoleScene({ onEnter, isExpanding }: BlackHoleSceneProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const composerRef = useRef<EffectComposer | null>(null);
    const observerRef = useRef<Observer | null>(null);
    const uniformsRef = useRef<Record<string, THREE.IUniform>>({});
    const animationRef = useRef<number>(0);
    const startTimeRef = useRef<number>(0);
    const isInitializedRef = useRef(false);

    const isDraggingRef = useRef(false);
    const lastMouseRef = useRef({ x: 0, y: 0 });
    const pitchRef = useRef(0);
    const yawRef = useRef(0);

    const isWarpingRef = useRef(false);
    const warpProgressRef = useRef(0);
    const warpStartTimeRef = useRef(0);
    const warpStartPitchRef = useRef(0);
    const warpStartYawRef = useRef(0);
    const warpSceneRef = useRef<THREE.Scene | null>(null);
    const warpCameraRef = useRef<THREE.OrthographicCamera | null>(null);
    const warpUniformsRef = useRef<Record<string, THREE.IUniform>>({});
    const onEnterCalledRef = useRef(false);

    const init = useCallback(() => {
        if (!containerRef.current || isInitializedRef.current) return;
        isInitializedRef.current = true;

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setClearColor(0x000000, 1.0);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        containerRef.current.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        const scene = new THREE.Scene();
        const camera = new THREE.Camera();
        camera.position.z = 1;

        const composer = new EffectComposer(renderer);
        const renderPass = new RenderPass(scene, camera);
        const bloomPass = new UnrealBloomPass(
            new THREE.Vector2(128, 128),
            0.4, 1.5, 0.1
        );
        const shaderPass = new ShaderPass(CopyShader);
        composer.addPass(renderPass);
        composer.addPass(bloomPass);
        composer.addPass(shaderPass);
        composerRef.current = composer;

        const textureLoader = new THREE.TextureLoader();
        const bgTexture = textureLoader.load('/textures/milkyway.jpg');
        const starTexture = textureLoader.load('/textures/star_noise.png');
        const diskTexture = textureLoader.load('/textures/accretion_disk.png');

        bgTexture.magFilter = THREE.NearestFilter;
        bgTexture.minFilter = THREE.NearestFilter;
        starTexture.magFilter = THREE.LinearFilter;
        starTexture.minFilter = THREE.LinearFilter;
        diskTexture.magFilter = THREE.LinearFilter;
        diskTexture.minFilter = THREE.LinearFilter;

        const uniforms: Record<string, THREE.IUniform> = {
            time: { value: 0.0 },
            resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
            accretion_disk: { value: true },
            use_disk_texture: { value: true },
            lorentz_transform: { value: true },
            doppler_shift: { value: true },
            beaming: { value: true },
            cam_pos: { value: new THREE.Vector3() },
            cam_vel: { value: new THREE.Vector3() },
            cam_dir: { value: new THREE.Vector3() },
            cam_up: { value: new THREE.Vector3() },
            fov: { value: 60.0 },
            bg_texture: { value: bgTexture },
            star_texture: { value: starTexture },
            disk_texture: { value: diskTexture },
        };
        uniformsRef.current = uniforms;

        const material = new THREE.ShaderMaterial({
            uniforms,
            vertexShader,
            fragmentShader,
        });

        const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
        scene.add(mesh);

        const observer = new Observer(60.0);
        observer.distance = 10;
        observerRef.current = observer;

        const warpScene = new THREE.Scene();
        const warpCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        warpSceneRef.current = warpScene;
        warpCameraRef.current = warpCamera;

        const warpUniforms: Record<string, THREE.IUniform> = {
            warpProgress: { value: 0.0 },
            time: { value: 0.0 },
            resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
        };
        warpUniformsRef.current = warpUniforms;

        const warpMaterial = new THREE.ShaderMaterial({
            uniforms: warpUniforms,
            vertexShader: warpVertexShader,
            fragmentShader: warpFragmentShader,
            transparent: true,
            blending: THREE.AdditiveBlending,
        });

        const warpMesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), warpMaterial);
        warpScene.add(warpMesh);

        startTimeRef.current = performance.now();
    }, []);

    const animate = useCallback(() => {
        if (!composerRef.current || !observerRef.current || !rendererRef.current) return;

        const now = performance.now();
        const delta = (now - startTimeRef.current) / 1000;
        const time = delta;

        const observer = observerRef.current;

        if (isWarpingRef.current) {
            const warpDuration = 2000; 
            const warpElapsed = now - warpStartTimeRef.current;
            const warpProgress = Math.min(warpElapsed / warpDuration, 1.0);
            warpProgressRef.current = warpProgress;

            const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
            const easeInOutCubic = (t: number) =>
                t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
            if (warpProgress < 0.3) {
                const rotationProgress = easeOutCubic(warpProgress / 0.3);
                const currentPitch = warpStartPitchRef.current * (1 - rotationProgress);
                const currentYaw = warpStartYawRef.current * (1 - rotationProgress);
                pitchRef.current = currentPitch;
                yawRef.current = currentYaw;
                observer.setDirection(currentPitch, currentYaw);
            } else {
                pitchRef.current = 0;
                yawRef.current = 0;
                observer.setDirection(0, 0);
            }
            if (warpProgress >= 0.3) {
                const moveProgress = (warpProgress - 0.3) / 0.7;
                const easedMove = easeInOutCubic(moveProgress);

                const startDistance = 10;
                const endDistance = 2;
                observer.distance = startDistance - (startDistance - endDistance) * easedMove;
            }
            if (warpUniformsRef.current.warpProgress) {
                const warpVisualProgress = warpProgress < 0.2 ? 0 :
                    (warpProgress - 0.2) / 0.6;
                warpUniformsRef.current.warpProgress.value = Math.min(warpVisualProgress, 1);
                warpUniformsRef.current.time.value = time;
                warpUniformsRef.current.resolution.value.set(window.innerWidth, window.innerHeight);
            }
            if (warpProgress >= 0.8 && !onEnterCalledRef.current) {
                onEnterCalledRef.current = true;
                onEnter?.();
            }
        }

        observer.update(0.016);

        const uniforms = uniformsRef.current;
        uniforms.time.value = time;
        uniforms.resolution.value.set(window.innerWidth, window.innerHeight);
        uniforms.cam_pos.value.copy(observer.position);
        uniforms.cam_dir.value.copy(observer.direction);
        uniforms.cam_up.value.copy(observer.up);
        uniforms.cam_vel.value.copy(observer.velocity);
        uniforms.fov.value = observer.fov;

        composerRef.current.render();

        animationRef.current = requestAnimationFrame(animate);
    }, [onEnter]);

    const handleResize = useCallback(() => {
        if (!rendererRef.current || !composerRef.current) return;
        rendererRef.current.setSize(window.innerWidth, window.innerHeight);
        composerRef.current.setSize(window.innerWidth, window.innerHeight);
        uniformsRef.current.resolution?.value?.set(window.innerWidth, window.innerHeight);
    }, []);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        isDraggingRef.current = true;
        lastMouseRef.current = { x: e.clientX, y: e.clientY };
    }, []);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (!isDraggingRef.current || !observerRef.current) return;

        const dx = e.clientX - lastMouseRef.current.x;
        const dy = e.clientY - lastMouseRef.current.y;

        yawRef.current += dx * 0.005;
        pitchRef.current += dy * 0.005;
        pitchRef.current = Math.max(-Math.PI / 2 + 0.01, Math.min(Math.PI / 2 - 0.01, pitchRef.current));

        observerRef.current.setDirection(pitchRef.current, yawRef.current);

        lastMouseRef.current = { x: e.clientX, y: e.clientY };
    }, []);

    const handleMouseUp = useCallback(() => {
        isDraggingRef.current = false;
    }, []);

    const handleClick = useCallback(() => {
        if (!isDraggingRef.current && !isWarpingRef.current) {
            isWarpingRef.current = true;
            warpStartTimeRef.current = performance.now();
            warpStartPitchRef.current = pitchRef.current;
            warpStartYawRef.current = yawRef.current;
            warpProgressRef.current = 0;
            onEnterCalledRef.current = false;
        }
    }, []);

    useEffect(() => {
        init();
        animate();
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
            if (rendererRef.current && containerRef.current) {
                containerRef.current.removeChild(rendererRef.current.domElement);
                rendererRef.current.dispose();
            }
        };
    }, [init, animate, handleResize]);

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 cursor-grab active:cursor-grabbing"
            style={{ zIndex: 0 }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onClick={handleClick}
        />
    );
}
