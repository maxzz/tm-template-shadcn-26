import { type ButtonHTMLAttributes, useEffect, useRef } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { motion, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import { classNames } from "@/utils";
import { acquireMorphClock, activity, blobButtonActiveAtom, blobButtonConfig, morphTime, setBlobButtonActiveAtom } from "./4-blob-button-state";
import { buildOutline } from "./4-blob-button-math";

export { blobButtonActiveAtom, blobButtonConfig } from "./4-blob-button-state";

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
            className={classNames("relative group px-10 py-5 text-sm font-medium text-primary outline-none cursor-pointer", className)}
            {...rest}
        >
            <svg className="absolute inset-0 size-full overflow-visible pointer-events-none" aria-hidden>
                <motion.path d={ghost} className="fill-none stroke-primary/25 stroke-1" />
                <motion.path
                    d={outline}
                    className="fill-primary/8 stroke-primary/70 group-data-active:fill-primary/15 group-data-active:stroke-primary group-focus-visible:stroke-ring stroke-[1.5] group-focus-visible:stroke-[2.5] transition-[fill,stroke] duration-300"
                />
            </svg>
            <span className="relative">
                {children}
            </span>
        </button>
    );
}

//---------------------------------------------------------------------------

function useMorphClock(enabled: boolean) {
    useEffect(
        () => {
            if (!enabled) {
                return;
            }
            return acquireMorphClock();
        },
        [enabled]);
}
