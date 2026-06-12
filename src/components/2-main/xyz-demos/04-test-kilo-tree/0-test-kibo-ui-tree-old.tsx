import { type ComponentProps } from "react";
import { useAtomValue } from "jotai";
import { classNames } from "@/utils";
import { treeSelectedLabelsAtom } from "./8-kibo-ui-tree-atoms";
import { ProjectExplorer } from "./0-test-explorer";

export function TestKiboUiTree({ className, ...rest }: ComponentProps<"div">) {
    return (
        <div className={classNames("text-xs font-condensed flex flex-col", className)} {...rest}>
            <KiboTreeHeader />
            <ProjectExplorer className="flex-1" />
        </div>
    );
}

function KiboTreeHeader() {
    const selectedLabels = useAtomValue(treeSelectedLabelsAtom);
    const selectionLabel = selectedLabels.length > 0 ? selectedLabels.join(", ") : "none";

    return (
        <div className="px-4 py-3 bg-muted/20 border-b flex items-center justify-between gap-4">
            <span className="shrink-0 text-sm">Kibo UI Tree Demo</span>
            <span className="truncate text-xs font-mono text-muted-foreground">
                Selected: {selectionLabel}
            </span>
            <span className="shrink-0 text-xs text-muted-foreground flex gap-3">
                <a
                    className="underline-offset-2 hover:underline"
                    href={KIBO_UI_TREE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    kibo-ui.com
                </a>
                <a
                    className="underline-offset-2 hover:underline"
                    href={SHADCNBLOCKS_DEMO_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    shadcnblocks demo
                </a>
            </span>
        </div>
    );
}

const KIBO_UI_TREE_URL = "https://www.kibo-ui.com/components/tree";
const SHADCNBLOCKS_DEMO_URL = "https://www.shadcnblocks.com/component/tree/tree-expanded-1";
