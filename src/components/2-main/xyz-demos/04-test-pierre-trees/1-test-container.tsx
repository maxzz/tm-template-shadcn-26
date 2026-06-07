import { Button } from "@/ui/shadcn/button";
import { FolderOpenIcon, RefreshCwIcon } from "lucide-react";
import { notice } from "@/ui/local-ui/7-toaster";
import { useAtomValue, useSetAtom } from "jotai";
import { PierreTreesExplorer } from "./2-demo-tree";
import { PierreTreesOptions } from "./3-option-controls";
import { pathsAtom, fileTreeModelAtom, addLogAtom, INITIAL_DEMO_PATHS } from "./4-atoms";

export function TestPierreTrees() {
    return (
        <div className="p-4 bg-card text-card-foreground border rounded-xl shadow-sm flex flex-col gap-4">
            <PierreTreesHeader />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column: Explorer */}
                <div className="lg:col-span-5 flex flex-col gap-3">
                    <PierreTreesExplorer />
                </div>

                {/* Right Column: Controls & Info */}
                <div className="lg:col-span-7 flex flex-col gap-4">
                    <PierreTreesOptions />
                </div>
            </div>
        </div>
    );
}

function PierreTreesHeader() {
    const setPaths = useSetAtom(pathsAtom);
    const model = useAtomValue(fileTreeModelAtom);
    const addLog = useSetAtom(addLogAtom);

    function handleResetPaths() {
        setPaths(INITIAL_DEMO_PATHS);
        if (model) {
            model.resetPaths(INITIAL_DEMO_PATHS);
        }
        
        addLog("Reset tree paths to initial state");
        notice.info("Reset tree paths");
    }

    return (
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
    );
}
