import { useEffect, useRef } from "react";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { SearchIcon } from "lucide-react";
import { Input } from "@/ui/shadcn/input";
import { notice } from "@/ui/local-ui/7-toaster";
import { type ContextMenuItem, type ContextMenuOpenContext, type FileTreeRenameEvent, type FileTreeRenamingItem, type FileTreeRowDecoration, type GitStatusEntry } from "@pierre/trees";
import { FileTree, useFileTree, useFileTreeSearch, useFileTreeSelection } from "@pierre/trees/react"; // https://trees.software/docs
import { useTheme } from "next-themes";
import { themeToTreeStyles } from "@pierre/trees";
import { LIGHT_THEMES, DARK_THEMES } from "./themes-data";
import { pathsAtom, densityAtom, iconSetAtom, showGitStatusAtom, showDecorationsAtom, addLogAtom, fileTreeModelAtom, selectedPathsAtom, lightThemeAtom, darkThemeAtom, themeModeAtom } from "./4-atoms";

export function PierreTreesExplorer() {
    const [paths, setPaths] = useAtom(pathsAtom);

    const density = useAtomValue(densityAtom);
    const iconSet = useAtomValue(iconSetAtom);
    const showGitStatus = useAtomValue(showGitStatusAtom);
    const showDecorations = useAtomValue(showDecorationsAtom);

    const setFileTreeModel = useSetAtom(fileTreeModelAtom);
    const setSelectedPaths = useSetAtom(selectedPathsAtom);
    const addLog = useSetAtom(addLogAtom);

    // Theming state
    const lightThemeKey = useAtomValue(lightThemeAtom);
    const darkThemeKey = useAtomValue(darkThemeAtom);
    const themeMode = useAtomValue(themeModeAtom);
    const { resolvedTheme } = useTheme();

    const isDark = themeMode === "dark" || (themeMode === "auto" && resolvedTheme === "dark");
    const activeThemeKey = isDark ? darkThemeKey : lightThemeKey;
    const activeTheme = isDark ? DARK_THEMES[darkThemeKey] : LIGHT_THEMES[lightThemeKey];

    // Convert Shiki theme to tree CSS styles
    const treeStyles = activeTheme ? themeToTreeStyles(activeTheme as any) : {};

    // Initialize the file tree model
    const { model } = useFileTree({
        paths,
        //search: true,
        fileTreeSearchMode: 'hide-non-matches',
        initialExpandedPaths: ['src', 'src/components', 'src/components/2-main', 'src/components/2-main/xyz-demos'],
        density,
        icons: iconSet,
        renaming: {
            canRename: (item: FileTreeRenamingItem) => item.path !== 'package.json',
            onRename: ({ sourcePath, destinationPath }: FileTreeRenameEvent) => {
                setPaths(prev => prev.map(p => p === sourcePath ? destinationPath : p));
                addLog(`Renamed: ${sourcePath} -> ${destinationPath}`);
                notice.success(`Renamed file to ${destinationPath}`);
            },
            onError: (message: string) => {
                addLog(`Rename error: ${message}`);
                notice.error(`Rename failed: ${message}`);
            },
        },
        gitStatus: showGitStatus ? gitStatusItems : undefined,
        renderRowDecoration: showDecorations ? renderRowDecoration : undefined,
    });

    const selectedPaths = useFileTreeSelection(model);
    const search = useFileTreeSearch(model);

    // Sync the model to the atom
    useEffect(
        () => {
            setFileTreeModel(model);
            return () => {
                setFileTreeModel(null);
            };
        },
        [model, setFileTreeModel]);

    // Sync selection to the atom
    useEffect(
        () => {
            setSelectedPaths(selectedPaths);
        },
        [selectedPaths, setSelectedPaths]);

    // Sync git status state to model when it changes
    const prevGitStatusRef = useRef<boolean>(showGitStatus);
    useEffect(
        () => {
            model.setGitStatus(showGitStatus ? gitStatusItems : undefined);

            if (prevGitStatusRef.current !== showGitStatus) {
                prevGitStatusRef.current = showGitStatus;
                addLog(`Git status toggled: ${showGitStatus ? 'ON' : 'OFF'}`);
            }
        },
        [showGitStatus, model, addLog]);

    // Sync icon set state to model when it changes
    const prevIconSetRef = useRef<string>(iconSet);
    useEffect(
        () => {
            model.setIcons(iconSet);

            if (prevIconSetRef.current !== iconSet) {
                prevIconSetRef.current = iconSet;
                addLog(`Icon set changed to: ${iconSet}`);
            }
        },
        [iconSet, model, addLog]);

    return (<>
        <div className="flex items-center gap-2">
            <div className="relative flex-1">
                <SearchIcon className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                <Input
                    className="pl-9 h-9"
                    placeholder="Search files (e.g. 'dialog', 'ui')..."
                    value={search.value}
                    onChange={(e) => search.setValue(e.target.value)}
                />
            </div>
        </div>

        <div className="bg-background/50 border rounded-md overflow-hidden">

            <div className="px-3 py-2 border-b bg-muted/30 flex items-center justify-between text-xs font-medium text-muted-foreground">
                <span>WORKSPACE EXPLORER</span>
                <span>Right-click items for actions</span>
            </div>

            <div className="p-2">
                <FileTree
                    model={model}
                    className="bg-muted border rounded-md"
                    style={{
                        height: '350px',
                        '--trees-theme-list-active-selection-bg': 'var(--color-trees-active-selection-bg)',
                        '--trees-theme-list-active-selection-fg': 'var(--color-trees-active-selection-fg)',
                        '--trees-theme-list-hover-bg': 'var(--color-trees-hover-bg)',
                        '--trees-theme-focus-ring': 'var(--color-trees-focus-ring)',
                        '--trees-theme-font-family': 'var(--font-trees-font-family)',
                        '--trees-theme-font-size': 'var(--text-trees-font-size)',
                        ...treeStyles,
                    } as React.CSSProperties}
                    key={`${density}-${iconSet}-${activeThemeKey}-${themeMode}`}
                    renderContextMenu={
                        (item: ContextMenuItem, context: ContextMenuOpenContext) => (
                            <div className="min-w-[120px] bg-popover p-1 shadow-md text-xs text-popover-foreground border rounded-md flex flex-col">
                                <button
                                    className="px-2 py-1.5 text-left hover:text-accent-foreground hover:bg-accent transition-colors rounded-sm" type="button"
                                    onClick={() => { context.close({ restoreFocus: true }); model.startRenaming(item.path); }}
                                >
                                    Rename File
                                </button>

                                <button
                                    className="px-2 py-1.5 text-left hover:text-accent-foreground hover:bg-accent transition-colors rounded-sm" type="button"
                                    onClick={() => { context.close({ restoreFocus: true }); const handle = model.getItem(item.path); handle?.toggleSelect(); }}
                                >
                                    Toggle Select
                                </button>

                                <button
                                    className="px-2 py-1.5 text-left hover:text-accent-foreground hover:bg-accent transition-colors rounded-sm" type="button"
                                    onClick={() => { context.close({ restoreFocus: true }); addLog(`Context action on: ${item.path}`); notice.info(`Selected ${item.path} from menu`); }}
                                >
                                    Log Path
                                </button>
                            </div>
                        )
                    }
                />
            </div>
        </div>
    </>);
}

function renderRowDecoration({ item }: { item: ContextMenuItem; }): FileTreeRowDecoration | null {
    if (item.path.endsWith('.tsx')) {
        return { text: 'React', title: 'React Component' };
    }
    if (item.path.endsWith('.json')) {
        return { text: 'Config', title: 'Configuration File' };
    }
    if (item.path === 'README.md') {
        return { text: 'DOC', title: 'Documentation' };
    }
    return null;
}

const gitStatusItems: GitStatusEntry[] = [
    { path: 'package.json', status: 'modified' },
    { path: 'src/components/2-main/xyz-demos/04-test-pierre-trees/index.tsx', status: 'added' },
    { path: 'README.md', status: 'untracked' },
];
