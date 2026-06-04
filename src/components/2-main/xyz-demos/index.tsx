import { Button } from "@/ui/shadcn/button";
import { doAsyncExecuteConfirmDialogAtom } from "../../4-dialogs/8-1-confirmation/9-types-confirmation";
import { useSetAtom } from "jotai";

export function TestConfirmationDialog() {
    const doAsyncExecuteConfirmDialog = useSetAtom(doAsyncExecuteConfirmDialogAtom);
    return (
        <div>
            <Button
                onClick={
                    async () => {
                        doAsyncExecuteConfirmDialog({
                            title: "Test Confirmation Dialog",
                            message: "This is a test confirmation dialog",
                            buttonOk: "OK",
                            buttonCancel: "Cancel",
                        });
                    }
                }
            >
            Test Confirmation Dialog
        </Button>
        </div >
    );
}
