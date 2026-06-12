import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1");
const EXT = [".tsx", ".jsx"];

const GROUP_NAMES = [
    "position anchor",
    "self & group",
    "element",
    "margin & padding",
    "width & height",
    "position offsets & display",
    "text size",
    "font",
    "color",
    "variant modifiers",
    "transition",
    "border",
    "rounding",
    "shadow",
    "truncate & overflow",
    "children",
    "end",
];

const TEXT_SIZES = new Set([
    "text-xs", "text-sm", "text-base", "text-lg", "text-xl",
    "text-2xl", "text-3xl", "text-4xl", "text-5xl", "text-6xl", "text-7xl", "text-8xl", "text-9xl",
]);

function baseToken(token) {
    if (/^group\/[\w-]+$/.test(token)) {
        return token;
    }
    const parts = token.split(":");
    return parts[parts.length - 1];
}

function hasVariantPrefix(token) {
    if (/^group\/[\w-]+$/.test(token)) {
        return false;
    }
    return token.includes(":");
}

function classify(token) {
    const base = baseToken(token);
    const variant = hasVariantPrefix(token);

    // 17 — end (always last)
    if (/^(?:cursor-|pointer-events)/.test(base) || base === "pointer-events-none" || /^z-/.test(base)) {
        return 16;
    }

    // 1 — position anchor
    if (/^(?:relative|absolute|fixed|sticky|static)/.test(base)) {
        return variant ? 9 : 0;
    }

    // 2 — self & group
    if (/^self-/.test(base) || base === "group" || /^group\//.test(base)) {
        return 1;
    }

    // 11 — transition (including variant-prefixed)
    if (/^(?:transition|duration|animate)/.test(base)) {
        return 10;
    }

    // 15 — truncate & overflow
    if (base === "truncate" || base === "text-ellipsis" || /^overflow-/.test(base)) {
        return 14;
    }

    // 16 — children (grid before flex in same group)
    if (
        /^grid(?:-|$)/.test(base) ||
        base === "grid" ||
        /^inline-grid/.test(base) ||
        /^flex(?:-|$)/.test(base) ||
        base === "flex" ||
        /^inline-flex/.test(base) ||
        /^gap-/.test(base) ||
        /^items-/.test(base) ||
        /^justify-/.test(base) ||
        /^content-/.test(base) ||
        /^place-/.test(base) ||
        /^order-/.test(base) ||
        /^col-/.test(base) ||
        /^row-/.test(base) ||
        /^space-[xy]-/.test(base) ||
        /^list-/.test(base)
    ) {
        return variant ? 9 : 15;
    }

    // 3 — element
    if (
        /^(?:shrink|grow)$/.test(base) ||
        /^shrink-/.test(base) ||
        /^grow-/.test(base) ||
        /^basis-/.test(base) ||
        /^select-/.test(base) ||
        /^whitespace-/.test(base) ||
        base === "compress-zero"
    ) {
        return 2;
    }

    // 4 — margin & padding (unprefixed only; prefixed → variant modifiers)
    if (
        !variant &&
        /^(?:m-|mx-|my-|mt-|mr-|mb-|ml-|p-|px-|py-|pt-|pr-|pb-|pl-)/.test(base)
    ) {
        return 3;
    }

    // 5 — width & height
    if (/^(?:w-|h-|min-w-|max-w-|min-h-|max-h-|size-|aspect-)/.test(base)) {
        return 4;
    }

    // 6 — position offsets & display
    if (
        /^(?:inset-|top-|right-|bottom-|left-)/.test(base) ||
        ["block", "inline", "hidden", "visible", "isolate"].includes(base)
    ) {
        return variant ? 9 : 5;
    }

    // 7 — text size
    if (TEXT_SIZES.has(base)) {
        return 6;
    }

    // 8 — font
    if (/^font-/.test(base)) {
        return 7;
    }

    // 12–14 — border, rounding, shadow (variant-prefixed → modifiers)
    if (/^(?:border|outline-|ring-|divide-)/.test(base) && !/^rounded/.test(base)) {
        return variant ? 9 : 11;
    }
    if (/^rounded/.test(base)) {
        return variant ? 9 : 12;
    }
    if (/^shadow/.test(base)) {
        return variant ? 9 : 13;
    }

    // 9 — color (unprefixed only)
    if (
        !variant &&
        (/^(?:bg-|fill-|stroke-|from-|to-|via-|opacity-|accent-|caret-|decoration-)/.test(base) ||
            (/^text-/.test(base) && !TEXT_SIZES.has(base)))
    ) {
        return 8;
    }

    // 10 — variant modifiers (remaining prefixed utilities)
    if (variant) {
        return 9;
    }

    return -1;
}

function extractClassStrings(content) {
    const results = [];
    const patterns = [
        /className\s*=\s*"([^"]+)"/g,
        /className\s*=\s*'([^']+)'/g,
        /className\s*=\s*\{`([^`]+)`\}/g,
        /className\s*=\s*\{\s*["'`]([^"'`]+)["'`]\s*\}/g,
        /class\s*=\s*"([^"]+)"/g,
        /cn\(\s*["'`]([^"'`]+)["'`]/g,
        /classNames\(\s*["'`]([^"'`]+)["'`]/g,
    ];

    for (const pattern of patterns) {
        let match;
        while ((match = pattern.exec(content))) {
            results.push({ value: match[1], index: match.index });
        }
    }

    return results;
}

function checkClassString(value) {
    const tokens = value.split(/\s+/).filter(Boolean);
    const classified = tokens
        .map((token) => ({ token, group: classify(token) }))
        .filter((x) => x.group >= 0);

    const violations = [];
    let maxGroup = -1;

    for (const { token, group } of classified) {
        if (group < maxGroup) {
            violations.push({
                token,
                group: GROUP_NAMES[group],
                after: GROUP_NAMES[maxGroup],
            });
        }
        maxGroup = Math.max(maxGroup, group);
    }

    return violations;
}

function walk(dir, files = []) {
    for (const entry of readdirSync(dir)) {
        const full = join(dir, entry);
        if (statSync(full).isDirectory()) {
            if (!["node_modules", "dist", ".git"].includes(entry)) walk(full, files);
        } else if (EXT.some((e) => entry.endsWith(e))) {
            files.push(full);
        }
    }
    return files;
}

const files = walk(join(ROOT, "src"));
const allViolations = [];

for (const file of files) {
    const content = readFileSync(file, "utf8");
    const rel = relative(ROOT, file).replace(/\\/g, "/");

    for (const { value, index } of extractClassStrings(content)) {
        const violations = checkClassString(value);
        if (!violations.length) continue;

        const line = content.slice(0, index).split("\n").length;
        allViolations.push({ file: rel, line, value, violations });
    }
}

const byFile = new Map();
for (const v of allViolations) {
    if (!byFile.has(v.file)) byFile.set(v.file, []);
    byFile.get(v.file).push(v);
}

console.log(`Scanned ${files.length} files`);
console.log(`Found ${allViolations.length} class strings with order violations in ${byFile.size} files\n`);

for (const [file, items] of [...byFile.entries()].sort()) {
    console.log(`${file}`);
    for (const item of items) {
        console.log(`  L${item.line}: ${item.value.slice(0, 100)}${item.value.length > 100 ? "..." : ""}`);
        for (const v of item.violations) {
            console.log(`    - "${v.token}" (${v.group}) appears after ${v.after}`);
        }
    }
    console.log();
}
