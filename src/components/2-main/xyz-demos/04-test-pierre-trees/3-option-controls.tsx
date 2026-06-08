import { useEffect, useRef } from "react";
import { Button } from "@/ui/shadcn/button";
import { CheckIcon, GitBranchIcon, SettingsIcon } from "lucide-react";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { LIGHT_THEMES, DARK_THEMES } from "./themes-data";
import {
    pathsAtom,
    densityAtom,
    iconSetAtom,
    showGitStatusAtom,
    showDecorationsAtom,
    logsAtom,
    addLogAtom,
    fileTreeModelAtom,
    selectedPathsAtom,
    lightThemeAtom,
    darkThemeAtom,
    themeModeAtom,
} from "./4-atoms";

export function PierreTreesOptions() {
    return (
        <div className="font-condensed flex flex-col gap-4">
            <div className="px-4 bg-muted/10 border rounded-md flex flex-col gap-4">

                <h3 className="pt-4 text-sm font-semibold flex items-center gap-1.5">
                    <SettingsIcon className="w-4 h-4 text-muted-foreground" />
                    Tree Configuration & Controls
                </h3>

                <TreeThemeControls />
                <TreeLayoutStyleControls />
                <TreeProgrammaticActions />
                <TreeFeatureToggles />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TreeSelectedItemsPanel />
                <TreeEventLogPanel />
            </div>
        </div>
    );
}

function TreeThemeControls() {
    return (
        <div className="border-t pt-4 flex flex-col gap-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                <TreeLightThemeSelect />
                <TreeDarkThemeSelect />
                <TreeThemeModeToggle />
            </div>
        </div>
    );
}

const themeSelectClassName =
    "w-full h-8 px-2 text-xs rounded-md border border-input bg-background text-foreground shadow-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring cursor-pointer";

function TreeLightThemeSelect() {
    const [lightTheme, setLightTheme] = useAtom(lightThemeAtom);
    const addLog = useSetAtom(addLogAtom);

    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                ☀️ Light Theme
            </label>
            <select
                value={lightTheme}
                onChange={(e) => {
                    setLightTheme(e.target.value);
                    addLog(`Light theme changed to: ${e.target.value}`);
                }}
                className={themeSelectClassName}
            >
                {Object.entries(LIGHT_THEMES).map(([key, theme]) => (
                    <option key={key} value={key}>
                        {theme.name}
                    </option>
                ))}
            </select>
        </div>
    );
}

function TreeDarkThemeSelect() {
    const [darkTheme, setDarkTheme] = useAtom(darkThemeAtom);
    const addLog = useSetAtom(addLogAtom);

    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                🌙 Dark Theme
            </label>
            <select
                value={darkTheme}
                onChange={(e) => {
                    setDarkTheme(e.target.value);
                    addLog(`Dark theme changed to: ${e.target.value}`);
                }}
                className={themeSelectClassName}
            >
                {Object.entries(DARK_THEMES).map(([key, theme]) => (
                    <option key={key} value={key}>
                        {theme.name}
                    </option>
                ))}
            </select>
        </div>
    );
}

function TreeThemeModeToggle() {
    const [themeMode, setThemeMode] = useAtom(themeModeAtom);
    const addLog = useSetAtom(addLogAtom);

    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-medium text-muted-foreground">
                Theme Mode
            </label>
            <div className="flex gap-1 bg-muted/50 p-0.5 rounded-md border border-input h-8">
                {([
                    { id: 'auto', label: 'Auto' },
                    { id: 'light', label: 'Light' },
                    { id: 'dark', label: 'Dark' },
                ] as const).map(({ id, label }) => (
                    <button
                        key={id}
                        type="button"
                        onClick={() => {
                            setThemeMode(id);
                            addLog(`Theme mode changed to: ${label}`);
                        }}
                        className={`flex-1 text-[11px] font-medium rounded-sm transition-all cursor-pointer ${themeMode === id
                            ? "bg-background text-foreground shadow-xs"
                            : "text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        {label}
                    </button>
                ))}
            </div>
        </div>
    );
}

function TreeLayoutStyleControls() {
    const [density, setDensity] = useAtom(densityAtom);
    const [iconSet, setIconSet] = useAtom(iconSetAtom);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
                <span className="text-xs font-medium text-muted-foreground">Density</span>
                <div className="flex gap-1.5">
                    {(['compact', 'default', 'relaxed'] as const).map((d) => (
                        <Button
                            className="flex-1 capitalize text-xs h-8"
                            variant={density === d ? "default" : "outline"}
                            size="sm"
                            onClick={() => setDensity(d)}
                            key={d}
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
                            className="flex-1 capitalize text-xs h-8"
                            variant={iconSet === i ? "default" : "outline"}
                            size="sm"
                            onClick={() => setIconSet(i)}
                            key={i}
                        >
                            {i}
                        </Button>
                    ))}
                </div>
            </div>
        </div>
    );
}

function TreeProgrammaticActions() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
            <TreeSelectionActions />
            <TreeDirectoryActions />
        </div>
    );
}

function TreeSelectionActions() {
    const paths = useAtomValue(pathsAtom);
    const model = useAtomValue(fileTreeModelAtom);
    const addLog = useSetAtom(addLogAtom);

    function handleSelectAll() {
        if (!model) return;
        paths.forEach(path => {
            model.getItem(path)?.select();
        });
        addLog("Selected all items");
    }

    function handleClearSelection() {
        if (!model) return;
        paths.forEach(path => {
            model.getItem(path)?.deselect();
        });
        addLog("Cleared selection");
    }

    return (
        <div className="flex flex-col gap-2">
            <span className="text-xs font-medium text-muted-foreground">Selection Actions</span>
            <div className="flex gap-2">
                <Button className="flex-1 text-xs h-8" variant="outline" size="sm" onClick={handleSelectAll} disabled={!model}>
                    Select All
                </Button>
                <Button className="flex-1 text-xs h-8" variant="outline" size="sm" onClick={handleClearSelection} disabled={!model}>
                    Clear Selection
                </Button>
            </div>
        </div>
    );
}

function TreeDirectoryActions() {
    const paths = useAtomValue(pathsAtom);
    const model = useAtomValue(fileTreeModelAtom);
    const addLog = useSetAtom(addLogAtom);

    function handleExpandAll() {
        if (!model) return;
        paths.forEach(path => {
            const item = model.getItem(path);
            if (item && 'expand' in item && typeof item.expand === 'function') {
                item.expand();
            }
        });
        addLog("Expanded all directories");
    }

    function handleCollapseAll() {
        if (!model) return;
        paths.forEach(path => {
            const item = model.getItem(path);
            if (item && 'collapse' in item && typeof item.collapse === 'function') {
                item.collapse();
            }
        });
        addLog("Collapsed all directories");
    }

    return (
        <div className="flex flex-col gap-2">
            <span className="text-xs font-medium text-muted-foreground">Directory Actions</span>
            <div className="flex gap-2">
                <Button className="flex-1 text-xs h-8" variant="outline" size="sm" onClick={handleExpandAll} disabled={!model}>
                    Expand All
                </Button>
                <Button className="flex-1 text-xs h-8" variant="outline" size="sm" onClick={handleCollapseAll} disabled={!model}>
                    Collapse All
                </Button>
            </div>
        </div>
    );
}

function TreeFeatureToggles() {
    const [showGitStatus, setShowGitStatus] = useAtom(showGitStatusAtom);
    const [showDecorations, setShowDecorations] = useAtom(showDecorationsAtom);

    return (
        <div className="flex flex-wrap gap-4 border-t pt-4">
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
    );
}

function TreeSelectedItemsPanel() {
    const selectedPaths = useAtomValue(selectedPathsAtom);
    const addLog = useSetAtom(addLogAtom);

    const prevSelectedPathsRef = useRef<readonly string[]>([]);
    useEffect(
        () => {
            const prevSelected = prevSelectedPathsRef.current;
            const hasChanged = prevSelected.length !== selectedPaths.length ||
                prevSelected.some((val, i) => val !== selectedPaths[i]);

            if (hasChanged) {
                prevSelectedPathsRef.current = selectedPaths;
                if (prevSelected.length > 0 || selectedPaths.length > 0) {
                    if (selectedPaths.length > 0) {
                        addLog(`Selection changed: ${selectedPaths.length} items selected`);
                    } else {
                        addLog(`Selection cleared`);
                    }
                }
            }
        },
        [selectedPaths, addLog]);

    return (
        <div className="border rounded-lg p-4 bg-muted/5 flex flex-col gap-2 h-[180px]">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Selected Items ({selectedPaths.length})
            </h4>
            <div className="flex-1 overflow-y-auto text-xs font-mono bg-background/50 p-2 rounded border">
                {selectedPaths.length === 0
                    ? (
                        <span className="text-muted-foreground italic">No items selected. Click rows or use "Select All".</span>
                    )
                    : (
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
    );
}

function TreeEventLogPanel() {
    const logs = useAtomValue(logsAtom);

    return (
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
    );
}
