import { type ComponentProps } from "react";
import { classNames } from "@/utils";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/ui/shadcn/resizable";
import { ProjectTree } from "./1-project-tree";
import { SelectedFileView } from "./3-selected-file-views";

export function ProjectExplorer({ className, ...rest }: ComponentProps<"div">) {
    return (
        <div className={classNames("min-h-0 text-xs font-condensed flex flex-col", className)} {...rest}>
            <div className="min-h-0 flex-1">
                <ResizablePanelGroup
                    orientation="horizontal"
                    defaultLayout={{ tree: 30, content: 70 }}
                >
                    <ResizablePanel id="tree" minSize={15}>
                        <div className="p-4 h-full bg-muted/10 border-r overflow-auto">
                            <ProjectTree />
                        </div>
                    </ResizablePanel>

                    <ResizableHandle withHandle />

                    <ResizablePanel id="content" minSize={25}>
                        <SelectedFileView />
                    </ResizablePanel>
                </ResizablePanelGroup>
            </div>
        </div>
    );
}
