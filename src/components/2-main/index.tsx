import { TestConfirmationDialog, TestResizablePanels, TestLoginDialog, TestPierreTrees } from "./xyz-demos";

export function MainBody() {
    return (
        <main className="px-2 py-3 flex flex-col gap-2">
            <TestResizablePanels className="w-full h-[400px] border rounded-xl bg-card text-card-foreground shadow-xs overflow-hidden" />

            <div className="flex gap-2">
                <TestConfirmationDialog />
                <TestLoginDialog />
            </div>

            <TestPierreTrees />
        </main>
    );
}
