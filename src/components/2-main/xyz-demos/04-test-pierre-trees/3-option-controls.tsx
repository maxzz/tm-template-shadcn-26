import { useEffect, useRef } from "react";
import { Button } from "@/ui/shadcn/button";
import { CheckIcon, GitBranchIcon, SettingsIcon } from "lucide-react";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import {
    pathsAtom,
    densityAtom,
    iconSetAtom,
    showGitStatusAtom,
    showDecorationsAtom,
    logsAtom,
    addLogAtom,
    fileTreeModelAtom,
    selectedPathsAtom
} from "./4-atoms";

export function PierreTreesOptions() {
    const [density, setDensity] = useAtom(densityAtom);
    const [iconSet, setIconSet] = useAtom(iconSetAtom);
    const [showGitStatus, setShowGitStatus] = useAtom(showGitStatusAtom);
    const [showDecorations, setShowDecorations] = useAtom(showDecorationsAtom);

    const paths = useAtomValue(pathsAtom);
    const selectedPaths = useAtomValue(selectedPathsAtom);
    const logs = useAtomValue(logsAtom);
    const model = useAtomValue(fileTreeModelAtom);
    const addLog = useSetAtom(addLogAtom);

    // Handle selection notifications safely to prevent infinite render loops
    const prevSelectedPathsRef = useRef<readonly string[]>([]);
    useEffect(() => {
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
    }, [selectedPaths, addLog]);

    const handleSelectAll = () => {
        if (!model) return;
        paths.forEach(path => {
            model.getItem(path)?.select();
        });
        addLog("Selected all items");
    };

    const handleClearSelection = () => {
        if (!model) return;
        paths.forEach(path => {
            model.getItem(path)?.deselect();
        });
        addLog("Cleared selection");
    };

    const handleExpandAll = () => {
        if (!model) return;
        paths.forEach(path => {
            const item = model.getItem(path);
            if (item && 'expand' in item && typeof item.expand === 'function') {
                item.expand();
            }
        });
        addLog("Expanded all directories");
    };

    const handleCollapseAll = () => {
        if (!model) return;
        paths.forEach(path => {
            const item = model.getItem(path);
            if (item && 'collapse' in item && typeof item.collapse === 'function') {
                item.collapse();
            }
        });
        addLog("Collapsed all directories");
    };

    return (
        <div className="flex flex-col gap-4">
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
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleSelectAll}
                                className="flex-1 text-xs h-8"
                                disabled={!model}
                            >
                                Select All
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleClearSelection}
                                className="flex-1 text-xs h-8"
                                disabled={!model}
                            >
                                Clear Selection
                            </Button>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <span className="text-xs font-medium text-muted-foreground">Directory Actions</span>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleExpandAll}
                                className="flex-1 text-xs h-8"
                                disabled={!model}
                            >
                                Expand All
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleCollapseAll}
                                className="flex-1 text-xs h-8"
                                disabled={!model}
                            >
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
    );
}
