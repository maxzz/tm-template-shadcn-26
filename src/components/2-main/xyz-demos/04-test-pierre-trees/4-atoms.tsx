import { atom } from "jotai";
import { type FileTree } from "@pierre/trees";

export const INITIAL_DEMO_PATHS = [
    "package.json",
    "README.md",
    "src/index.ts",
    "src/components/0-all/0-app.tsx",
    "src/components/2-main/index.tsx",
    "src/components/2-main/xyz-demos/index.tsx",
    "src/components/2-main/xyz-demos/01-test-confirmation-dialog.tsx",
    "src/components/2-main/xyz-demos/02-test-resizable-panels.tsx",
    "src/components/2-main/xyz-demos/03-test-login-dialog.tsx",
    "src/components/2-main/xyz-demos/04-test-pierre-trees/index.tsx",
    "src/ui/shadcn/button.tsx",
    "src/ui/shadcn/input.tsx",
    "src/ui/shadcn/accordion.tsx",
    "src/index.css",
    "public/favicon.ico",
    "public/index.html",
];

export const pathsAtom = atom<string[]>(INITIAL_DEMO_PATHS);

export const densityAtom = atom<'compact' | 'default' | 'relaxed'>('default');
export const iconSetAtom = atom<'minimal' | 'standard' | 'complete'>('complete');
export const showGitStatusAtom = atom<boolean>(true);
export const showDecorationsAtom = atom<boolean>(true);

// Theming atoms
export const lightThemeAtom = atom<string>('pierre-light');
export const darkThemeAtom = atom<string>('pierre-dark');
export const themeModeAtom = atom<'auto' | 'light' | 'dark'>('auto');

export const logsAtom = atom<string[]>(["Tree initialized."]);

// Write-only atom for adding logs with timestamps
export const addLogAtom = atom(
    null,
    (_get, set, message: string) => {
        const timestamp = new Date().toLocaleTimeString();
        set(logsAtom, prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 19)]);
    }
);

// Atom to share the imperative FileTree model instance across components
export const fileTreeModelAtom = atom<FileTree | null>(null);

// Atom to share the current selected paths across components
export const selectedPathsAtom = atom<readonly string[]>([]);
