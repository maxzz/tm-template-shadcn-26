import { useState, type ComponentProps } from "react";
import { classNames } from "@/utils";
import {
    TreeExpander,
    TreeIcon,
    TreeLabel,
    TreeNode,
    TreeNodeContent,
    TreeNodeTrigger,
    TreeProvider,
    TreeView,
} from "@/ui/shadcn/kibo-ui-tree";

const KIBO_UI_TREE_URL = "https://www.kibo-ui.com/components/tree";
const SHADCNBLOCKS_DEMO_URL = "https://www.shadcnblocks.com/component/tree/tree-expanded-1";

export function TestKiboUiTree({ className, ...rest }: ComponentProps<"div">) {
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    return (
        <div className={classNames("font-condensed text-xs flex flex-col", className)} {...rest}>
            <KiboTreeHeader selectedIds={selectedIds} />

            <div className="flex-1 min-h-0 overflow-auto p-4">
                <TreeProvider
                    defaultExpandedIds={["src", "components", "ui"]}
                    selectedIds={selectedIds}
                    onSelectionChange={setSelectedIds}
                >
                    <TreeView>
                        <TreeNode nodeId="src">
                            <TreeNodeTrigger>
                                <TreeExpander hasChildren />
                                <TreeIcon hasChildren />
                                <TreeLabel>src</TreeLabel>
                            </TreeNodeTrigger>
                            <TreeNodeContent hasChildren>
                                <TreeNode nodeId="components" level={1}>
                                    <TreeNodeTrigger>
                                        <TreeExpander hasChildren />
                                        <TreeIcon hasChildren />
                                        <TreeLabel>components</TreeLabel>
                                    </TreeNodeTrigger>
                                    <TreeNodeContent hasChildren>
                                        <TreeNode nodeId="ui" level={2} isLast>
                                            <TreeNodeTrigger>
                                                <TreeExpander hasChildren />
                                                <TreeIcon hasChildren />
                                                <TreeLabel>ui</TreeLabel>
                                            </TreeNodeTrigger>
                                            <TreeNodeContent hasChildren>
                                                <TreeNode nodeId="button.tsx" level={3}>
                                                    <TreeNodeTrigger>
                                                        <TreeExpander />
                                                        <TreeIcon />
                                                        <TreeLabel>button.tsx</TreeLabel>
                                                    </TreeNodeTrigger>
                                                </TreeNode>
                                                <TreeNode nodeId="card.tsx" level={3}>
                                                    <TreeNodeTrigger>
                                                        <TreeExpander />
                                                        <TreeIcon />
                                                        <TreeLabel>card.tsx</TreeLabel>
                                                    </TreeNodeTrigger>
                                                </TreeNode>
                                                <TreeNode nodeId="dialog.tsx" level={3} isLast>
                                                    <TreeNodeTrigger>
                                                        <TreeExpander />
                                                        <TreeIcon />
                                                        <TreeLabel>dialog.tsx</TreeLabel>
                                                    </TreeNodeTrigger>
                                                </TreeNode>
                                            </TreeNodeContent>
                                        </TreeNode>
                                    </TreeNodeContent>
                                </TreeNode>
                                <TreeNode nodeId="layout" level={1} isLast>
                                    <TreeNodeTrigger>
                                        <TreeExpander />
                                        <TreeIcon />
                                        <TreeLabel>layout</TreeLabel>
                                    </TreeNodeTrigger>
                                </TreeNode>
                            </TreeNodeContent>
                        </TreeNode>

                        <TreeNode nodeId="public">
                            <TreeNodeTrigger>
                                <TreeExpander />
                                <TreeIcon />
                                <TreeLabel>public</TreeLabel>
                            </TreeNodeTrigger>
                        </TreeNode>
                        <TreeNode nodeId="package.json">
                            <TreeNodeTrigger>
                                <TreeExpander />
                                <TreeIcon />
                                <TreeLabel>package.json</TreeLabel>
                            </TreeNodeTrigger>
                        </TreeNode>
                        <TreeNode nodeId="tsconfig.json">
                            <TreeNodeTrigger>
                                <TreeExpander />
                                <TreeIcon />
                                <TreeLabel>tsconfig.json</TreeLabel>
                            </TreeNodeTrigger>
                        </TreeNode>
                        <TreeNode nodeId="README.md" isLast>
                            <TreeNodeTrigger>
                                <TreeExpander />
                                <TreeIcon />
                                <TreeLabel>README.md</TreeLabel>
                            </TreeNodeTrigger>
                        </TreeNode>
                    </TreeView>
                </TreeProvider>
            </div>
        </div>
    );
}

function KiboTreeHeader({ selectedIds }: { selectedIds: string[] }) {
    const selectionLabel = selectedIds.length > 0 ? selectedIds.join(", ") : "none";

    return (
        <div className="px-4 py-3 border-b bg-muted/20 flex items-center justify-between gap-4">
            <span className="text-sm shrink-0">Kibo UI Tree Demo</span>
            <span className="text-xs font-mono text-muted-foreground truncate">
                Selected: {selectionLabel}
            </span>
            <span className="text-xs text-muted-foreground flex gap-3 shrink-0">
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
