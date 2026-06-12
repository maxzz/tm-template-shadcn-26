import { memo, type ReactNode } from "react";
import { useAtomValue, useSetAtom } from "jotai";
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
import {
    isNodeSelectedAtom,
    setTreeSelectionAtom,
    treeDataAtom,
    treeExpandedIdsAtom,
    type TreeNodeWithId,
} from "./8-kibo-ui-tree-atoms";

export function ProjectTree() {
    return (
        <ProjectTreeProvider>
            <ProjectTreeView />
        </ProjectTreeProvider>
    );
}

function ProjectTreeProvider({ children }: { children: ReactNode }) {
    const defaultExpandedIds = useAtomValue(treeExpandedIdsAtom);
    const setSelection = useSetAtom(setTreeSelectionAtom);

    return (
        <TreeProvider
            defaultExpandedIds={defaultExpandedIds}
            onSelectionChange={setSelection}
        >
            {children}
        </TreeProvider>
    );
}

const ProjectTreeView = memo(function ProjectTreeView() {
    const nodes = useAtomValue(treeDataAtom);

    return (
        <TreeView>
            {nodes.map((node, index) => (
                <ProjectTreeNode
                    key={node.id}
                    node={node}
                    level={0}
                    isLast={index === nodes.length - 1}
                />
            ))}
        </TreeView>
    );
});

const ProjectTreeNode = memo(function ProjectTreeNode({
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
            <ProjectTreeNodeTrigger
                nodeId={node.id}
                hasChildren={hasChildren}
                label={node.label}
            />

            {hasChildren && (
                <TreeNodeContent hasChildren>
                    {node.children!.map((child, index) => (
                        <ProjectTreeNode
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

const ProjectTreeNodeTrigger = memo(function ProjectTreeNodeTrigger({
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
        <TreeNodeTrigger isSelected={isSelected} hasChildren={hasChildren}>
            <TreeExpander hasChildren={hasChildren} />
            <TreeIcon hasChildren={hasChildren} />
            <TreeLabel>{label}</TreeLabel>
        </TreeNodeTrigger>
    );
});
