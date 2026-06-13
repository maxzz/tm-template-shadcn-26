import { TestConfirmationDialog, TestResizablePanels, TestLoginDialog, ProjectExplorer } from "./xyz-demos";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/ui/shadcn/accordion";
import { useSnapshot } from "valtio";
import { appSettings } from "@/store/1-ui-settings";

export function MainBody() {
    const settings = useSnapshot(appSettings);

    const handleValueChange = (value: string[]) => {
        appSettings.expandedSections = value;
    };

    return (
        <main className="px-2 py-3 flex flex-col gap-4">
            <Accordion 
                type="multiple" 
                value={settings.expandedSections as string[]} 
                onValueChange={handleValueChange}
                className="gap-4"
            >
                {/* Section 1: Resizable Panels */}
                <AccordionItem value="resizable-panels" className="bg-card border rounded-xl shadow-xs overflow-hidden">
                    <AccordionTrigger className="px-4 py-3 text-sm font-semibold hover:no-underline border-b">
                        Resizable Panels Demo
                    </AccordionTrigger>
                    <AccordionContent className="p-0">
                        <TestResizablePanels className="w-full h-[400px] overflow-hidden" />
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="kibo-ui-tree" className="bg-card border rounded-xl shadow-xs overflow-hidden">
                    <AccordionTrigger className="px-4 py-3 text-sm font-semibold hover:no-underline border-b">
                        Kibo UI Tree Demo
                    </AccordionTrigger>
                    <AccordionContent className="p-0">
                        <ProjectExplorer className="w-full h-[400px] overflow-hidden" />
                    </AccordionContent>
                </AccordionItem>
            </Accordion>

            {/* Dialog Buttons */}
            <div className="flex gap-2">
                <TestConfirmationDialog />
                <TestLoginDialog />
            </div>
        </main>
    );
}
