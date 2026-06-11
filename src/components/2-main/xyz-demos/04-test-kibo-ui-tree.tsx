import { memo, type ComponentProps, type ReactNode } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { classNames } from "@/utils";
import { TreeExpander, TreeIcon, TreeLabel, TreeNode, TreeNodeContent, TreeNodeTrigger, TreeProvider, TreeView } from "@/ui/shadcn/kibo-ui-tree";
import {
    isNodeSelectedAtom,
    treeDataAtom,
    treeExpandedIdsAtom,
    treeSelectedIdsAtom,
    treeSelectedLabelsAtom,
    type TreeNodeWithId,
} from "./04-kibo-ui-tree-atoms";

export function TestKiboUiTree({ className, ...rest }: ComponentProps<"div">) {
    return (
        <div className={classNames("font-condensed text-xs flex flex-col", className)} {...rest}>
            <KiboTreeHeader />

            <div className="flex-1 min-h-0 overflow-auto p-4">
                <KiboTreeProvider>
                    <KiboTreeView />
                </KiboTreeProvider>
            </div>
        </div>
    );
}

function KiboTreeProvider({ children }: { children: ReactNode }) {
    const defaultExpandedIds = useAtomValue(treeExpandedIdsAtom);
    const setSelectedIds = useSetAtom(treeSelectedIdsAtom);

    return (
        <TreeProvider
            defaultExpandedIds={defaultExpandedIds}
            onSelectionChange={setSelectedIds}
        >
            {children}
        </TreeProvider>
    );
}

const KiboTreeView = memo(function KiboTreeView() {
    const nodes = useAtomValue(treeDataAtom);

    return (
        <TreeView>
            {nodes.map((node, index) => (
                <DemoTreeNode
                    key={node.id}
                    node={node}
                    level={0}
                    isLast={index === nodes.length - 1}
                />
            ))}
        </TreeView>
    );
});

const DemoTreeNode = memo(function DemoTreeNode({
    node,
    level,
    isLast,
}: {
    node: TreeNodeWithId;
    level: number;
    isLast: boolean;
}) {
    const hasChildren = Boolean(node.children?.length);

    return (
        <TreeNode nodeId={node.id} level={level} isLast={isLast}>
            <DemoTreeNodeTrigger
                nodeId={node.id}
                hasChildren={hasChildren}
                label={node.label}
            />

            {hasChildren && (
                <TreeNodeContent hasChildren>
                    {node.children!.map((child, index) => (
                        <DemoTreeNode
                            key={child.id}
                            node={child}
                            level={level + 1}
                            isLast={index === node.children!.length - 1}
                        />
                    ))}
                </TreeNodeContent>
            )}
        </TreeNode>
    );
});

function DemoTreeNodeTrigger({
    nodeId,
    hasChildren,
    label,
}: {
    nodeId: string;
    hasChildren: boolean;
    label: string;
}) {
    const isSelected = useAtomValue(isNodeSelectedAtom(nodeId));

    return (
        <TreeNodeTrigger isSelected={isSelected}>
            <TreeExpander hasChildren={hasChildren} />
            <TreeIcon hasChildren={hasChildren} />
            <TreeLabel>{label}</TreeLabel>
        </TreeNodeTrigger>
    );
}

function KiboTreeHeader() {
    const selectedLabels = useAtomValue(treeSelectedLabelsAtom);
    const selectionLabel = selectedLabels.length > 0 ? selectedLabels.join(", ") : "none";

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

const KIBO_UI_TREE_URL = "https://www.kibo-ui.com/components/tree";
const SHADCNBLOCKS_DEMO_URL = "https://www.shadcnblocks.com/component/tree/tree-expanded-1";
