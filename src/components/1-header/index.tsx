import { ButtonThemeToggle } from "./8-btn-theme-toggle";

export function Header() {
    return (
        <header className="px-3 py-2 bg-background border-b border-border flex items-center justify-between">
            <div>
                tm-template-shadcn-26
            </div>
            <div className="flex items-center gap-2">
                <ButtonThemeToggle />
            </div>
        </header>
    );
}
