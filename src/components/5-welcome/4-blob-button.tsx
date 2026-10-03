import { type ButtonHTMLAttributes, useEffect, useRef } from "react";
import { atom, useAtomValue, useSetAtom } from "jotai";
import { proxy } from "valtio";
import { animate, cancelFrame, frame, type FrameData, motion, motionValue, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import { classNames } from "@/utils";

/**
 * Look of the morphing outline. Read on every frame, so edits (from code, settings UI, or devtools) apply immediately.
 */
export const blobButtonConfig = proxy({
    points: 9,              // control points around the outline (3..MAX_POINTS)
    wobble: 3.5,            // px, how far points drift in and out of the base shape
    slide: 0.35,            // how far points slide along the outline, as a fraction of the gap between neighbors
    speed: 1,               // morph speed at rest
    squareness: 3.5,        // superellipse exponent of the base shape: 2 is an ellipse, higher approaches a rounded rectangle
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
 * Morph time and activity are module-level and the point seeds are deterministic: every instance
 * (the live button and its inert copies in the Welcome page pieces) must draw the identical outline,
 * or the seams between the pieces would show during the view transition.
 */
const morphTime = motionValue(0);
const activity = motionValue(0);    // 0 at rest, 1 hovered

const MAX_POINTS = 24;
const TAU = Math.PI * 2;
const seeds = createSeeds(MAX_POINTS);

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

const xs = new Float64Array(MAX_POINTS);
const ys = new Float64Array(MAX_POINTS);

/**
 * Points sit on a superellipse inscribed in the button box; each drifts in and out along its direction
 * and slides along the outline on its own slow sine mix. A closed Catmull-Rom spline through them keeps the curve smooth.
 */
function buildOutline(width: number, height: number, time: number, activityLevel: number): string {
    if (!width || !height) {
        return "";
    }

    const { points, wobble, slide, squareness, activeWobble } = blobButtonConfig;
    const n = Math.min(Math.max(Math.round(points), 3), MAX_POINTS);
    const amplitude = wobble * (1 + (activeWobble - 1) * activityLevel);
    const cx = width / 2;
    const cy = height / 2;
    const rx = Math.max(cx - amplitude, 1);
    const ry = Math.max(cy - amplitude, 1);
    const exponent = 2 / squareness;
    const step = TAU / n;

    for (let i = 0; i < n; i++) {
        const s = seeds[i];
        const angle = i * step + Math.sin(time * s.slideFreq + s.slidePhase) * step * slide;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const drift = (0.65 * Math.sin(time * s.freq1 + s.phase1) + 0.35 * Math.sin(time * s.freq2 + s.phase2)) * amplitude;

        xs[i] = cx + Math.sign(cos) * Math.abs(cos) ** exponent * rx + cos * drift;
        ys[i] = cy + Math.sign(sin) * Math.abs(sin) ** exponent * ry + sin * drift;
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

function createSeeds(count: number) {
    let state = 0x9e3779b9; // mulberry32 with a fixed seed
    const random = () => {
        state = (state + 0x6d2b79f5) | 0;
        let t = Math.imul(state ^ (state >>> 15), 1 | state);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };

    return Array.from({ length: count }, () => ({
        freq1: 0.7 + random() * 0.6,
        freq2: 1.3 + random() * 0.9,
        slideFreq: 0.4 + random() * 0.5,
        phase1: random() * TAU,
        phase2: random() * TAU,
        slidePhase: random() * TAU,
    }));
}
