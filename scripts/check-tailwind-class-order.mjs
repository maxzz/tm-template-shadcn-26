import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1");
const EXT = [".tsx", ".jsx"];

const GROUPS = [
    {
        name: "element",
        test: (c) =>
            /^(?:[a-z]+:)*?(?:font-|truncate|whitespace-|cursor-|select-|pointer-events-|transition-|duration-|animate-|shrink-|grow-|basis-|compress-zero)/.test(
                c
            ) ||
            /^(?:[a-z]+:)*?(?:shrink|grow)$/.test(c),
    },
    {
        name: "margin & padding",
        test: (c) =>
            /^(?:[a-z]+:)*?(?:m-|mx-|my-|mt-|mr-|mb-|ml-|p-|px-|py-|pt-|pr-|pb-|pl-)/.test(c),
    },
    {
        name: "width & height",
        test: (c) =>
            /^(?:[a-z]+:)*?(?:w-|h-|min-w-|max-w-|min-h-|max-h-|size-|aspect-)/.test(c),
    },
    {
        name: "position & layout",
        test: (c) =>
            /^(?:[a-z]+:)*?(?:relative|absolute|fixed|sticky|static|inset-|top-|right-|bottom-|left-|z-|overflow-|block|inline|hidden|visible|isolate)/.test(
                c
            ) &&
            !/^(?:[a-z]+:)*?(?:inline-flex|inline-grid)/.test(c),
    },
    {
        name: "color",
        test: (c) =>
            /^(?:[a-z]+:)*?(?:bg-|text-|fill-|stroke-|from-|to-|via-|opacity-|accent-|caret-|decoration-)/.test(
                c
            ),
    },
    {
        name: "border",
        test: (c) =>
            /^(?:[a-z]+:)*?(?:border(?:-[a-z0-9\[\]#%.]+)?|outline-|ring-|divide-)/.test(c) &&
            !/^(?:[a-z]+:)*?rounded/.test(c),
    },
    {
        name: "rounding",
        test: (c) => /^(?:[a-z]+:)*?rounded/.test(c),
    },
    {
        name: "shadow",
        test: (c) => /^(?:[a-z]+:)*?shadow/.test(c),
    },
    {
        name: "children",
        test: (c) =>
            /^(?:[a-z]+:)*?(?:flex(?:-[a-z0-9\[\]#%.]+)?|inline-flex|grid(?:-[a-z0-9\[\]#%.]+)?|inline-grid|gap-|items-|justify-|content-|self-|place-|order-|col-|row-|space-x-|space-y-|table|table-|list-)/.test(
                c
            ) ||
            /^(?:[a-z]+:)*?(?:flex|grid)$/.test(c),
    },
];

const GROUP_NAMES = GROUPS.map((g) => g.name);

function classify(token) {
    for (let i = 0; i < GROUPS.length; i++) {
        if (GROUPS[i].test(token)) return i;
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
    const lines = content.split("\n");

    for (const { value, index } of extractClassStrings(content)) {
        const violations = checkClassString(value);
        if (!violations.length) continue;

        const line = content.slice(0, index).split("\n").length;
        allViolations.push({
            file: rel,
            line,
            value,
            violations,
        });
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
