import { type ButtonHTMLAttributes, useEffect, useRef } from "react";
import { atom, useAtomValue, useSetAtom } from "jotai";
import { proxy } from "valtio";
import { animate, cancelFrame, frame, type FrameData, motion, motionValue, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import { classNames } from "@/utils";

/**
 * Look of the morphing outline. Read on every frame, so edits (from code, settings UI, or devtools) apply immediately.
 */
export const blobButtonConfig = proxy({
    samples: 48,            // points the outline is drawn through (8..MAX_SAMPLES); more is smoother, it does not add bumps
    wobble: 4.5,            // px, typical depth of the waves running along the outline
    endWobble: 0.3,         // wobble multiplier on the rounded ends and side walls, where a deep wave would fold into a sharp corner
    roundness: 1,           // corner radius as a fraction of the half-height: 1 gives semicircle ends, lower gives straight side walls
    speed: 1,               // morph speed at rest
    activeWobble: 1.7,      // wobble multiplier while hovered
    activeSpeed: 2.4,       // speed multiplier while hovered
    ghostLag: 2.4,          // how far ahead in morph time the faint second outline runs
});

/** True while the pointer is over the button. Shared, so the Welcome page piece copies show the same state. */
export const blobButtonActiveAtom = atom(false);

const setBlobButtonActiveAtom = atom(null,
    (get, set, active: boolean) => {
        if (get(blobButtonActiveAtom) === active) {
            return;
        }
        set(blobButtonActiveAtom, active);
        animate(activity, active ? 1 : 0, { type: "spring", visualDuration: 0.7, bounce: 0.25 });
    }
);

//---------------------------------------------------------------------------

/**
 * Morph time and activity are module-level and the wave seeds are deterministic: every instance
 * (the live button and its inert copies in the Welcome page pieces) must draw the identical outline,
 * or the seams between the pieces would show during the view transition.
 */
const morphTime = motionValue(0);
const activity = motionValue(0);    // 0 at rest, 1 hovered

const MAX_SAMPLES = 96;
const TAU = Math.PI * 2;
const waves = createWaves();

let clockUsers = 0;

function tickClock({ delta }: FrameData) {
    const { speed, activeSpeed } = blobButtonConfig;
    const seconds = Math.min(delta, 50) / 1000; // a backgrounded tab must not jump the shape
    morphTime.set(morphTime.get() + seconds * speed * (1 + (activeSpeed - 1) * activity.get()));
}

function useMorphClock(enabled: boolean) {
    useEffect(
        () => {
            if (!enabled) {
                return;
            }
            if (clockUsers++ === 0) {
                frame.update(tickClock, true);
            }
            return () => {
                if (--clockUsers === 0) {
                    cancelFrame(tickClock);
                }
            };
        },
        [enabled]);
}

//---------------------------------------------------------------------------

export function BlobButton({ className, children, ...rest }: ButtonHTMLAttributes<HTMLButtonElement>) {
    const ref = useRef<HTMLButtonElement>(null);
    const width = useMotionValue(0);
    const height = useMotionValue(0);

    const active = useAtomValue(blobButtonActiveAtom);
    const setActive = useSetAtom(setBlobButtonActiveAtom);

    useMorphClock(!useReducedMotion());

    const outline = useTransform(() => buildOutline(width.get(), height.get(), morphTime.get(), activity.get()));
    const ghost = useTransform(() => buildOutline(width.get(), height.get(), morphTime.get() + blobButtonConfig.ghostLag, activity.get()));

    useEffect(
        () => {
            const el = ref.current;
            if (!el) {
                return;
            }

            const observer = new ResizeObserver(() => {
                width.set(el.offsetWidth);
                height.set(el.offsetHeight);
            });
            observer.observe(el);

            // The live button unmounts on navigation without a pointerleave; the inert copies must not reset the shared state
            const isCopy = !!el.closest("[inert]");
            return () => {
                observer.disconnect();
                !isCopy && setActive(false);
            };
        },
        [width, height, setActive]);

    // Only fill and stroke transition: the Welcome page toggles `invisible` around the view transition, and a transitioned visibility blinks for a frame
    return (
        <button
            ref={ref}
            type="button"
            data-active={active || undefined}
            onPointerEnter={() => setActive(true)}
            onPointerLeave={() => setActive(false)}
            className={classNames("relative group px-9 py-3.5 text-sm font-medium text-primary outline-none cursor-pointer", className)}
            {...rest}
        >
            <svg className="absolute inset-0 size-full overflow-visible pointer-events-none" aria-hidden>
                <motion.path d={ghost} className="fill-none stroke-primary/25 [stroke-width:1]" />
                <motion.path
                    d={outline}
                    className="fill-primary/8 stroke-primary/70 group-data-active:fill-primary/15 group-data-active:stroke-primary group-focus-visible:stroke-ring [stroke-width:1.5] group-focus-visible:[stroke-width:2.5] transition-[fill,stroke] duration-300"
                />
            </svg>
            <span className="relative">
                {children}
            </span>
        </button>
    );
}

//---------------------------------------------------------------------------

const xs = new Float64Array(MAX_SAMPLES);
const ys = new Float64Array(MAX_SAMPLES);
const waveWeights = new Float64Array(waves.length);
const waveOffsets = new Float64Array(waves.length);

/**
 * A rounded-rectangle base shape displaced along its normal by a few slow waves that travel around it.
 * The displacement is one smooth field sampled at evenly spaced points, so no single point can run off
 * on its own and fold the curve into a corner; a closed Catmull-Rom spline through the samples keeps it smooth.
 */
function buildOutline(width: number, height: number, time: number, activityLevel: number): string {
    if (!width || !height) {
        return "";
    }

    const { samples, wobble, endWobble, roundness, activeWobble } = blobButtonConfig;
    const n = Math.min(Math.max(Math.round(samples), 8), MAX_SAMPLES);
    const amplitude = wobble * (1 + (activeWobble - 1) * activityLevel);
    const cx = width / 2;
    const cy = height / 2;
    const rx = Math.max(cx - amplitude * endWobble * 1.2, 1);
    const ry = Math.max(cy - amplitude * 1.2, 1);
    const radius = Math.max(Math.min(ry * roundness, rx, ry), 0.5);
    const perimeter = 4 * (rx - radius) + 4 * (ry - radius) + TAU * radius;
    const edgeEnd = rx - radius;                    // half-length of the straight top and bottom edges
    const fade = Math.max(radius * 1.5, 1);         // distance before a corner over which the waves die down

    for (let j = 0; j < waves.length; j++) {
        const w = waves[j];
        waveWeights[j] = w.weight * (0.6 + 0.4 * Math.sin(time * w.pulse + w.pulsePhase));
        waveOffsets[j] = w.phase - time * w.travel;
    }

    for (let i = 0; i < n; i++) {
        const u = i / n;
        baseShapeAt(u * perimeter, cx, cy, rx, ry, radius);

        let wave = 0;
        for (let j = 0; j < waves.length; j++) {
            wave += waveWeights[j] * Math.sin(TAU * waves[j].harmonic * u + waveOffsets[j]);
        }

        // Full depth mid-edge, eased down to endWobble before the corners begin, so a deep wave cannot kink into a corner
        const t = Math.min(Math.max((edgeEnd - Math.abs(baseX - cx)) / fade, 0), 1);
        const depth = amplitude * wave * (endWobble + (1 - endWobble) * t * t * (3 - 2 * t));
        xs[i] = baseX + baseNx * depth;
        ys[i] = baseY + baseNy * depth;
    }

    let d = `M${xs[0].toFixed(2)},${ys[0].toFixed(2)}`;
    for (let i = 0; i < n; i++) {
        const prev = (i - 1 + n) % n;
        const next = (i + 1) % n;
        const after = (i + 2) % n;

        const c1x = xs[i] + (xs[next] - xs[prev]) / 6;
        const c1y = ys[i] + (ys[next] - ys[prev]) / 6;
        const c2x = xs[next] - (xs[after] - xs[i]) / 6;
        const c2y = ys[next] - (ys[after] - ys[i]) / 6;

        d += `C${c1x.toFixed(2)},${c1y.toFixed(2)} ${c2x.toFixed(2)},${c2y.toFixed(2)} ${xs[next].toFixed(2)},${ys[next].toFixed(2)}`;
    }
    return d + "Z";
}

// Output of baseShapeAt, kept in module variables so the per-frame loop does not allocate
let baseX = 0;
let baseY = 0;
let baseNx = 0;
let baseNy = 0;

/** Point and outward normal at arc length `s`, clockwise from the left end of the top edge. */
function baseShapeAt(s: number, cx: number, cy: number, rx: number, ry: number, radius: number) {
    const straightX = 2 * (rx - radius);
    const straightY = 2 * (ry - radius);
    const arc = Math.PI * radius / 2;

    if (s < straightX) { return setEdge(cx - rx + radius + s, cy - ry, 0, -1); }
    s -= straightX;
    if (s < arc) { return setCorner(cx + rx - radius, cy - ry + radius, radius, -Math.PI / 2 + s / radius); }
    s -= arc;
    if (s < straightY) { return setEdge(cx + rx, cy - ry + radius + s, 1, 0); }
    s -= straightY;
    if (s < arc) { return setCorner(cx + rx - radius, cy + ry - radius, radius, s / radius); }
    s -= arc;
    if (s < straightX) { return setEdge(cx + rx - radius - s, cy + ry, 0, 1); }
    s -= straightX;
    if (s < arc) { return setCorner(cx - rx + radius, cy + ry - radius, radius, Math.PI / 2 + s / radius); }
    s -= arc;
    if (s < straightY) { return setEdge(cx - rx, cy + ry - radius - s, -1, 0); }
    s -= straightY;
    setCorner(cx - rx + radius, cy - ry + radius, radius, Math.PI + s / radius);
}

function setEdge(x: number, y: number, nx: number, ny: number) {
    baseX = x;
    baseY = y;
    baseNx = nx;
    baseNy = ny;
}

function setCorner(centerX: number, centerY: number, radius: number, angle: number) {
    const nx = Math.cos(angle);
    const ny = Math.sin(angle);
    setEdge(centerX + nx * radius, centerY + ny * radius, nx, ny);
}

/** Whole-number harmonics keep the outline closed; low ones only, so bumps stay broad. Neighbors travel in opposite directions. */
function createWaves() {
    let state = 0x9e3779b9; // mulberry32 with a fixed seed
    const random = () => {
        state = (state + 0x6d2b79f5) | 0;
        let t = Math.imul(state ^ (state >>> 15), 1 | state);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };

    return [
        { harmonic: 2, weight: 0.6 },
        { harmonic: 3, weight: 0.45 },
        { harmonic: 4, weight: 0.33 },
        { harmonic: 5, weight: 0.22 },
    ].map(
        ({ harmonic, weight }, i) => ({
            harmonic,
            weight,
            travel: (0.35 + random() * 0.5) * (i % 2 ? -1 : 1),
            phase: random() * TAU,
            pulse: 0.2 + random() * 0.3,
            pulsePhase: random() * TAU,
        })
    );
}

