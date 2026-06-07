import { useState, useEffect } from "react";
import { FileTree, useFileTree, useFileTreeSearch, useFileTreeSelection } from "@pierre/trees/react";
import { Input } from "@/ui/shadcn/input";
import { Button } from "@/ui/shadcn/button";
import { SearchIcon, CheckIcon, FolderIcon, FolderOpenIcon, GitBranchIcon, SettingsIcon, RefreshCwIcon } from "lucide-react";
import { notice } from "@/ui/local-ui/7-toaster";

const INITIAL_DEMO_PATHS = [
    "package.json",
    "README.md",
    "src/index.ts",
    "src/components/0-all/0-app.tsx",
    "src/components/2-main/index.tsx",
    "src/components/2-main/xyz-demos/index.tsx",
    "src/components/2-main/xyz-demos/01-test-confirmation-dialog.tsx",
    "src/components/2-main/xyz-demos/02-test-resizable-panels.tsx",
    "src/components/2-main/xyz-demos/03-test-login-dialog.tsx",
    "src/components/2-main/xyz-demos/04-test-pierre-trees.tsx",
    "src/ui/shadcn/button.tsx",
    "src/ui/shadcn/input.tsx",
    "src/ui/shadcn/accordion.tsx",
    "src/index.css",
    "public/favicon.ico",
    "public/index.html",
];

export function TestPierreTrees() {
    const [paths, setPaths] = useState<string[]>(INITIAL_DEMO_PATHS);
    const [density, setDensity] = useState<'compact' | 'default' | 'relaxed'>('default');
    const [iconSet, setIconSet] = useState<'minimal' | 'standard' | 'complete'>('complete');
    const [showGitStatus, setShowGitStatus] = useState(true);
    const [showDecorations, setShowDecorations] = useState(true);
    const [logs, setLogs] = useState<string[]>(["Tree initialized."]);

    const addLog = (message: string) => {
        const timestamp = new Date().toLocaleTimeString();
        setLogs(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 19)]);
    };

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
            onRename: ({ sourcePath, destinationPath }) => {
                setPaths(prev => prev.map(p => p === sourcePath ? destinationPath : p));
                addLog(`Renamed: ${sourcePath} -> ${destinationPath}`);
                notice.success(`Renamed file to ${destinationPath}`);
            },
            onError: (message) => {
                addLog(`Rename error: ${message}`);
                notice.error(`Rename failed: ${message}`);
            },
        },
        gitStatus: showGitStatus ? [
            { path: 'package.json', status: 'modified' },
            { path: 'src/components/2-main/xyz-demos/04-test-pierre-trees.tsx', status: 'added' },
            { path: 'README.md', status: 'untracked' },
        ] : undefined,
        renderRowDecoration: showDecorations ? ({ item }) => {
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

    // Sync git status state to model when it changes
    useEffect(() => {
        model.setGitStatus(showGitStatus ? [
            { path: 'package.json', status: 'modified' },
            { path: 'src/components/2-main/xyz-demos/04-test-pierre-trees.tsx', status: 'added' },
            { path: 'README.md', status: 'untracked' },
        ] : undefined);
        addLog(`Git status toggled: ${showGitStatus ? 'ON' : 'OFF'}`);
    }, [showGitStatus, model]);

    // Sync icon set state to model when it changes
    useEffect(() => {
        model.setIcons(iconSet);
        addLog(`Icon set changed to: ${iconSet}`);
    }, [iconSet, model]);

    // Handle selection notifications
    useEffect(() => {
        if (selectedPaths.length > 0) {
            addLog(`Selection changed: ${selectedPaths.length} items selected`);
        } else {
            addLog(`Selection cleared`);
        }
    }, [selectedPaths]);

    const handleSelectAll = () => {
        paths.forEach(path => {
            model.getItem(path)?.select();
        });
        addLog("Selected all items");
    };

    const handleClearSelection = () => {
        paths.forEach(path => {
            model.getItem(path)?.deselect();
        });
        addLog("Cleared selection");
    };

    const handleExpandAll = () => {
        paths.forEach(path => {
            const item = model.getItem(path);
            if (item && 'expand' in item && typeof item.expand === 'function') {
                item.expand();
            }
        });
        addLog("Expanded all directories");
    };

    const handleCollapseAll = () => {
        paths.forEach(path => {
            const item = model.getItem(path);
            if (item && 'collapse' in item && typeof item.collapse === 'function') {
                item.collapse();
            }
        });
        addLog("Collapsed all directories");
    };

    const handleResetPaths = () => {
        setPaths(INITIAL_DEMO_PATHS);
        model.resetPaths(INITIAL_DEMO_PATHS);
        addLog("Reset tree paths to initial state");
        notice.info("Reset tree paths");
    };

    return (
        <div className="flex flex-col gap-4 p-4 border rounded-xl bg-card text-card-foreground shadow-sm">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-4">
                <div>
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <FolderOpenIcon className="w-5 h-5 text-primary" />
                        Pierre Trees File Explorer Demo
                    </h2>
                    <p className="text-xs text-muted-foreground">
                        A high-performance, customizable file tree component from <code className="bg-muted px-1 py-0.5 rounded text-primary">@pierre/trees</code>.
                    </p>
                </div>
                <Button variant="outline" size="sm" onClick={handleResetPaths} className="flex items-center gap-1.5">
                    <RefreshCwIcon className="w-3.5 h-3.5" />
                    Reset Demo
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column: Explorer */}
                <div className="lg:col-span-5 flex flex-col gap-3">
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
                                renderContextMenu={(item, context) => (
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
                                )}
                            />
                        </div>
                    </div>
                </div>

                {/* Right Column: Controls & Info */}
                <div className="lg:col-span-7 flex flex-col gap-4">
                    {/* Controls Card */}
                    <div className="border rounded-lg p-4 bg-muted/10 flex flex-col gap-4">
                        <h3 className="text-sm font-semibold flex items-center gap-1.5">
                            <SettingsIcon className="w-4 h-4 text-muted-foreground" />
                            Tree Configuration & Controls
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Layout & Style */}
                            <div className="flex flex-col gap-2">
                                <span className="text-xs font-medium text-muted-foreground">Density</span>
                                <div className="flex gap-1.5">
                                    {(['compact', 'default', 'relaxed'] as const).map((d) => (
                                        <Button
                                            key={d}
                                            variant={density === d ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => setDensity(d)}
                                            className="flex-1 capitalize text-xs h-8"
                                        >
                                            {d}
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <span className="text-xs font-medium text-muted-foreground">Icon Set</span>
                                <div className="flex gap-1.5">
                                    {(['minimal', 'standard', 'complete'] as const).map((i) => (
                                        <Button
                                            key={i}
                                            variant={iconSet === i ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => setIconSet(i)}
                                            className="flex-1 capitalize text-xs h-8"
                                        >
                                            {i}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
                            {/* Programmatic Actions */}
                            <div className="flex flex-col gap-2">
                                <span className="text-xs font-medium text-muted-foreground">Selection Actions</span>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" onClick={handleSelectAll} className="flex-1 text-xs h-8">
                                        Select All
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={handleClearSelection} className="flex-1 text-xs h-8">
                                        Clear Selection
                                    </Button>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <span className="text-xs font-medium text-muted-foreground">Directory Actions</span>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" onClick={handleExpandAll} className="flex-1 text-xs h-8">
                                        Expand All
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={handleCollapseAll} className="flex-1 text-xs h-8">
                                        Collapse All
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-4 border-t pt-4">
                            {/* Feature Toggles */}
                            <label className="flex items-center gap-2 text-xs font-medium cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    checked={showGitStatus}
                                    onChange={(e) => setShowGitStatus(e.target.checked)}
                                    className="rounded border-gray-300 text-primary focus:ring-primary h-3.5 w-3.5"
                                />
                                <span className="flex items-center gap-1">
                                    <GitBranchIcon className="w-3.5 h-3.5 text-muted-foreground" />
                                    Show Git Status
                                </span>
                            </label>

                            <label className="flex items-center gap-2 text-xs font-medium cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    checked={showDecorations}
                                    onChange={(e) => setShowDecorations(e.target.checked)}
                                    className="rounded border-gray-300 text-primary focus:ring-primary h-3.5 w-3.5"
                                />
                                <span className="flex items-center gap-1">
                                    <CheckIcon className="w-3.5 h-3.5 text-muted-foreground" />
                                    Show Custom Decorations
                                </span>
                            </label>
                        </div>
                    </div>

                    {/* Selection & Logs Panel */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Selection State */}
                        <div className="border rounded-lg p-4 bg-muted/5 flex flex-col gap-2 h-[180px]">
                            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Selected Items ({selectedPaths.length})
                            </h4>
                            <div className="flex-1 overflow-y-auto text-xs font-mono bg-background/50 p-2 rounded border">
                                {selectedPaths.length === 0 ? (
                                    <span className="text-muted-foreground italic">No items selected. Click rows or use "Select All".</span>
                                ) : (
                                    <ul className="list-disc list-inside space-y-1">
                                        {selectedPaths.map(path => (
                                            <li key={path} className="truncate text-primary" title={path}>
                                                {path}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>

                        {/* Event Logs */}
                        <div className="border rounded-lg p-4 bg-muted/5 flex flex-col gap-2 h-[180px]">
                            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Event Log (Last 20)
                            </h4>
                            <div className="flex-1 overflow-y-auto text-xs font-mono bg-background/50 p-2 rounded border space-y-1">
                                {logs.map((log, index) => (
                                    <div key={index} className="truncate text-muted-foreground" title={log}>
                                        {log}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
