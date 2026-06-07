import { useEffect, useRef } from "react";
import { FileTree, useFileTree, useFileTreeSearch, useFileTreeSelection } from "@pierre/trees/react";
import { Input } from "@/ui/shadcn/input";
import { SearchIcon } from "lucide-react";
import { notice } from "@/ui/local-ui/7-toaster";
import { useAtomValue, useSetAtom } from "jotai";
import { pathsAtom, densityAtom, iconSetAtom, showGitStatusAtom, showDecorationsAtom, addLogAtom, fileTreeModelAtom, selectedPathsAtom } from "./4-atoms";

export function PierreTreesExplorer() {
    const paths = useAtomValue(pathsAtom);
    const density = useAtomValue(densityAtom);
    const iconSet = useAtomValue(iconSetAtom);
    const showGitStatus = useAtomValue(showGitStatusAtom);
    const showDecorations = useAtomValue(showDecorationsAtom);

    const setPaths = useSetAtom(pathsAtom);
    const addLog = useSetAtom(addLogAtom);
    const setFileTreeModel = useSetAtom(fileTreeModelAtom);
    const setSelectedPaths = useSetAtom(selectedPathsAtom);

    // Initialize the file tree model
    const { model } = useFileTree({
        paths,
        search: true,
        fileTreeSearchMode: 'hide-non-matches',
        initialExpandedPaths: ['src', 'src/components', 'src/components/2-main', 'src/components/2-main/xyz-demos'],
        density,
        icons: iconSet,
        renaming: {
            canRename: (item) => item.path !== 'package.json',
            onRename: ({ sourcePath, destinationPath }: { sourcePath: string, destinationPath: string; }) => {
                setPaths(prev => prev.map(p => p === sourcePath ? destinationPath : p));
                addLog(`Renamed: ${sourcePath} -> ${destinationPath}`);
                notice.success(`Renamed file to ${destinationPath}`);
            },
            onError: (message) => {
                addLog(`Rename error: ${message}`);
                notice.error(`Rename failed: ${message}`);
            },
        },
        gitStatus:
            showGitStatus
                ? [
                    { path: 'package.json', status: 'modified' },
                    { path: 'src/components/2-main/xyz-demos/04-test-pierre-trees/index.tsx', status: 'added' },
                    { path: 'README.md', status: 'untracked' },
                ] : undefined,
        renderRowDecoration:
            showDecorations
                ? ({ item }) => {
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
                } : undefined,
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
            model.setGitStatus(showGitStatus ? [
                { path: 'package.json', status: 'modified' },
                { path: 'src/components/2-main/xyz-demos/04-test-pierre-trees/index.tsx', status: 'added' },
                { path: 'README.md', status: 'untracked' },
            ] : undefined);

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
                <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    value={search.value}
                    onChange={(e) => search.setValue(e.target.value)}
                    placeholder="Search files (e.g. 'dialog', 'ui')..."
                    className="pl-9 h-9"
                />
            </div>
        </div>

        <div className="border rounded-lg bg-background/50 overflow-hidden">
            <div className="px-3 py-2 border-b bg-muted/30 flex items-center justify-between text-xs font-medium text-muted-foreground">
                <span>WORKSPACE EXPLORER</span>
                <span>Right-click items for actions</span>
            </div>
            <div className="p-2">
                <FileTree
                    key={`${density}-${iconSet}`}
                    model={model}
                    className="rounded-md border bg-background"
                    style={{
                        height: '350px',
                        '--trees-theme-list-active-selection-bg': 'color-mix(in oklab, var(--primary) 15%, transparent)',
                        '--trees-theme-list-active-selection-fg': 'var(--foreground)',
                        '--trees-theme-list-hover-bg': 'color-mix(in oklab, var(--primary) 5%, transparent)',
                        '--trees-theme-focus-ring': 'var(--ring)',
                        '--trees-theme-font-family': 'var(--font-sans)',
                        '--trees-theme-font-size': '13px',
                    } as React.CSSProperties}
                    renderContextMenu={
                        (item, context) => (
                            <div className="flex flex-col min-w-[120px] rounded-md border bg-popover p-1 shadow-md text-xs text-popover-foreground">
                                <button
                                    onClick={() => {
                                        context.close({ restoreFocus: true });
                                        model.startRenaming(item.path);
                                    }}
                                    className="px-2 py-1.5 text-left rounded-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                                    type="button"
                                >
                                    Rename File
                                </button>

                                <button
                                    onClick={() => {
                                        context.close({ restoreFocus: true });
                                        const handle = model.getItem(item.path);
                                        handle?.toggleSelect();
                                    }}
                                    className="px-2 py-1.5 text-left rounded-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                                    type="button"
                                >
                                    Toggle Select
                                </button>

                                <button
                                    onClick={() => {
                                        context.close({ restoreFocus: true });
                                        addLog(`Context action on: ${item.path}`);
                                        notice.info(`Selected ${item.path} from menu`);
                                    }}
                                    className="px-2 py-1.5 text-left rounded-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                                    type="button"
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
