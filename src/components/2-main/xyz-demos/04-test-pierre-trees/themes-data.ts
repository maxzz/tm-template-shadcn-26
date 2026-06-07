import pierreDark from "@pierre/theme/pierre-dark";
import pierreLight from "@pierre/theme/pierre-light";
import pierreDarkSoft from "@pierre/theme/pierre-dark-soft";
import pierreLightSoft from "@pierre/theme/pierre-light-soft";
import pierreDarkVibrant from "@pierre/theme/pierre-dark-vibrant";
import pierreLightVibrant from "@pierre/theme/pierre-light-vibrant";

export interface ThemeColors {
    "sideBar.background"?: string;
    "sideBar.foreground"?: string;
    "sideBar.border"?: string;
    "list.activeSelectionBackground"?: string;
    "list.activeSelectionForeground"?: string;
    "list.hoverBackground"?: string;
    "list.focusOutline"?: string;
    "focusBorder"?: string;
    "input.background"?: string;
    "input.border"?: string;
    "scrollbarSlider.background"?: string;
    "sideBarSectionHeader.foreground"?: string;
    "gitDecoration.addedResourceForeground"?: string;
    "gitDecoration.modifiedResourceForeground"?: string;
    "gitDecoration.deletedResourceForeground"?: string;
    "terminal.ansiGreen"?: string;
    "terminal.ansiBlue"?: string;
    "terminal.ansiRed"?: string;
    "editorGutter.addedBackground"?: string;
    "editorGutter.modifiedBackground"?: string;
    "editorGutter.deletedBackground"?: string;
    [key: string]: string | undefined;
}

export interface ThemeInput {
    name: string;
    type: 'light' | 'dark';
    bg?: string;
    fg?: string;
    colors: ThemeColors;
}

export const LIGHT_THEMES: Record<string, ThemeInput> = {
    "pierre-light": pierreLight as unknown as ThemeInput,
    "pierre-light-soft": pierreLightSoft as unknown as ThemeInput,
    "pierre-light-vibrant": pierreLightVibrant as unknown as ThemeInput,
    "light-plus": {
        name: "Light Plus",
        type: "light",
        bg: "#ffffff",
        fg: "#000000",
        colors: {
            "sideBar.background": "#f3f3f3",
            "sideBar.foreground": "#616161",
            "sideBar.border": "#e4e4e6",
            "list.activeSelectionBackground": "#e4e4e6",
            "list.activeSelectionForeground": "#000000",
            "list.hoverBackground": "#eaeaea",
            "list.focusOutline": "#007acc",
            "input.background": "#ffffff",
            "input.border": "#cecece",
            "gitDecoration.addedResourceForeground": "#58d13f",
            "gitDecoration.modifiedResourceForeground": "#007acc",
            "gitDecoration.deletedResourceForeground": "#ad0707",
        }
    },
    "github-light": {
        name: "GitHub Light",
        type: "light",
        bg: "#ffffff",
        fg: "#24292f",
        colors: {
            "sideBar.background": "#f6f8fa",
            "sideBar.foreground": "#24292f",
            "sideBar.border": "#d0d7de",
            "list.activeSelectionBackground": "#e2e9fc",
            "list.activeSelectionForeground": "#0969da",
            "list.hoverBackground": "#eaeef2",
            "list.focusOutline": "#0969da",
            "input.background": "#ffffff",
            "input.border": "#d0d7de",
            "gitDecoration.addedResourceForeground": "#1a7f37",
            "gitDecoration.modifiedResourceForeground": "#0969da",
            "gitDecoration.deletedResourceForeground": "#cf222e",
        }
    },
    "catppuccin-latte": {
        name: "Catppuccin Latte",
        type: "light",
        bg: "#eff1f5",
        fg: "#4c4f69",
        colors: {
            "sideBar.background": "#e6e9ef",
            "sideBar.foreground": "#4c4f69",
            "sideBar.border": "#ccd0da",
            "list.activeSelectionBackground": "#ccd0da",
            "list.activeSelectionForeground": "#1e66f5",
            "list.hoverBackground": "#dce0e8",
            "list.focusOutline": "#1e66f5",
            "input.background": "#eff1f5",
            "input.border": "#ccd0da",
            "gitDecoration.addedResourceForeground": "#40a02b",
            "gitDecoration.modifiedResourceForeground": "#1e66f5",
            "gitDecoration.deletedResourceForeground": "#d20f39",
        }
    },
    "everforest-light": {
        name: "Everforest Light",
        type: "light",
        bg: "#fdf6e3",
        fg: "#5c6a72",
        colors: {
            "sideBar.background": "#f4f0d9",
            "sideBar.foreground": "#5c6a72",
            "sideBar.border": "#e8e3cf",
            "list.activeSelectionBackground": "#e8e3cf",
            "list.activeSelectionForeground": "#859900",
            "list.hoverBackground": "#eae4cf",
            "list.focusOutline": "#35a775",
            "input.background": "#fdf6e3",
            "input.border": "#e8e3cf",
            "gitDecoration.addedResourceForeground": "#859900",
            "gitDecoration.modifiedResourceForeground": "#35a775",
            "gitDecoration.deletedResourceForeground": "#e67e80",
        }
    },
    "gruvbox-light-medium": {
        name: "Gruvbox Light Medium",
        type: "light",
        bg: "#fbf1c7",
        fg: "#3c3836",
        colors: {
            "sideBar.background": "#f2e5bc",
            "sideBar.foreground": "#3c3836",
            "sideBar.border": "#d5c4a1",
            "list.activeSelectionBackground": "#d5c4a1",
            "list.activeSelectionForeground": "#9d0006",
            "list.hoverBackground": "#ebdbb2",
            "list.focusOutline": "#af3a03",
            "input.background": "#fbf1c7",
            "input.border": "#d5c4a1",
            "gitDecoration.addedResourceForeground": "#79740e",
            "gitDecoration.modifiedResourceForeground": "#b57614",
            "gitDecoration.deletedResourceForeground": "#9d0006",
        }
    },
    "rose-pine-dawn": {
        name: "Rosé Pine Dawn",
        type: "light",
        bg: "#faf4ed",
        fg: "#575279",
        colors: {
            "sideBar.background": "#f2e9e1",
            "sideBar.foreground": "#575279",
            "sideBar.border": "#dfdad9",
            "list.activeSelectionBackground": "#dfdad9",
            "list.activeSelectionForeground": "#907aa9",
            "list.hoverBackground": "#f4ede8",
            "list.focusOutline": "#56949f",
            "input.background": "#faf4ed",
            "input.border": "#dfdad9",
            "gitDecoration.addedResourceForeground": "#286983",
            "gitDecoration.modifiedResourceForeground": "#907aa9",
            "gitDecoration.deletedResourceForeground": "#b4637a",
        }
    },
    "vitesse-light": {
        name: "Vitesse Light",
        type: "light",
        bg: "#ffffff",
        fg: "#393a34",
        colors: {
            "sideBar.background": "#fcfcfc",
            "sideBar.foreground": "#393a34",
            "sideBar.border": "#eeeeee",
            "list.activeSelectionBackground": "#eeeeee",
            "list.activeSelectionForeground": "#1c6b48",
            "list.hoverBackground": "#f5f5f5",
            "list.focusOutline": "#1c6b48",
            "input.background": "#ffffff",
            "input.border": "#eeeeee",
            "gitDecoration.addedResourceForeground": "#1c6b48",
            "gitDecoration.modifiedResourceForeground": "#a06c00",
            "gitDecoration.deletedResourceForeground": "#b02020",
        }
    }
};

export const DARK_THEMES: Record<string, ThemeInput> = {
    "pierre-dark": pierreDark as unknown as ThemeInput,
    "pierre-dark-soft": pierreDarkSoft as unknown as ThemeInput,
    "pierre-dark-vibrant": pierreDarkVibrant as unknown as ThemeInput,
    "dark-plus": {
        name: "Dark Plus",
        type: "dark",
        bg: "#1e1e1e",
        fg: "#d4d4d4",
        colors: {
            "sideBar.background": "#252526",
            "sideBar.foreground": "#cccccc",
            "sideBar.border": "#1e1e1e",
            "list.activeSelectionBackground": "#37373d",
            "list.activeSelectionForeground": "#ffffff",
            "list.hoverBackground": "#2a2d2e",
            "list.focusOutline": "#007acc",
            "input.background": "#3c3c3c",
            "input.border": "#3c3c3c",
            "gitDecoration.addedResourceForeground": "#81b88b",
            "gitDecoration.modifiedResourceForeground": "#e2c08d",
            "gitDecoration.deletedResourceForeground": "#c74e39",
        }
    },
    "github-dark": {
        name: "GitHub Dark",
        type: "dark",
        bg: "#0d1117",
        fg: "#c9d1d9",
        colors: {
            "sideBar.background": "#161b22",
            "sideBar.foreground": "#c9d1d9",
            "sideBar.border": "#30363d",
            "list.activeSelectionBackground": "#21262d",
            "list.activeSelectionForeground": "#58a6ff",
            "list.hoverBackground": "#161b22",
            "list.focusOutline": "#1f6feb",
            "input.background": "#0d1117",
            "input.border": "#30363d",
            "gitDecoration.addedResourceForeground": "#3fb950",
            "gitDecoration.modifiedResourceForeground": "#d29922",
            "gitDecoration.deletedResourceForeground": "#f85149",
        }
    },
    "catppuccin-mocha": {
        name: "Catppuccin Mocha",
        type: "dark",
        bg: "#1e1e2e",
        fg: "#cdd6f4",
        colors: {
            "sideBar.background": "#11111b",
            "sideBar.foreground": "#cdd6f4",
            "sideBar.border": "#181825",
            "list.activeSelectionBackground": "#313244",
            "list.activeSelectionForeground": "#89b4fa",
            "list.hoverBackground": "#1e1e2e",
            "list.focusOutline": "#89b4fa",
            "input.background": "#1e1e2e",
            "input.border": "#313244",
            "gitDecoration.addedResourceForeground": "#a6e3a1",
            "gitDecoration.modifiedResourceForeground": "#f9e2af",
            "gitDecoration.deletedResourceForeground": "#f38ba8",
        }
    },
    "everforest-dark": {
        name: "Everforest Dark",
        type: "dark",
        bg: "#2d353b",
        fg: "#d3c6aa",
        colors: {
            "sideBar.background": "#232a2e",
            "sideBar.foreground": "#d3c6aa",
            "sideBar.border": "#1e2326",
            "list.activeSelectionBackground": "#323c41",
            "list.activeSelectionForeground": "#a7c080",
            "list.hoverBackground": "#2d353b",
            "list.focusOutline": "#7fbbb3",
            "input.background": "#2d353b",
            "input.border": "#323c41",
            "gitDecoration.addedResourceForeground": "#a7c080",
            "gitDecoration.modifiedResourceForeground": "#dbbc7f",
            "gitDecoration.deletedResourceForeground": "#e67e80",
        }
    },
    "gruvbox-dark-medium": {
        name: "Gruvbox Dark Medium",
        type: "dark",
        bg: "#282828",
        fg: "#ebdbb2",
        colors: {
            "sideBar.background": "#1d2021",
            "sideBar.foreground": "#ebdbb2",
            "sideBar.border": "#282828",
            "list.activeSelectionBackground": "#3c3836",
            "list.activeSelectionForeground": "#fb4934",
            "list.hoverBackground": "#282828",
            "list.focusOutline": "#fe8019",
            "input.background": "#282828",
            "input.border": "#3c3836",
            "gitDecoration.addedResourceForeground": "#b8bb26",
            "gitDecoration.modifiedResourceForeground": "#fabd2f",
            "gitDecoration.deletedResourceForeground": "#fb4934",
        }
    },
    "rose-pine": {
        name: "Rosé Pine",
        type: "dark",
        bg: "#191724",
        fg: "#e0def4",
        colors: {
            "sideBar.background": "#1f1d2e",
            "sideBar.foreground": "#e0def4",
            "sideBar.border": "#191724",
            "list.activeSelectionBackground": "#2a2837",
            "list.activeSelectionForeground": "#c4a7e7",
            "list.hoverBackground": "#232136",
            "list.focusOutline": "#9ccfd8",
            "input.background": "#191724",
            "input.border": "#2a2837",
            "gitDecoration.addedResourceForeground": "#31748f",
            "gitDecoration.modifiedResourceForeground": "#c4a7e7",
            "gitDecoration.deletedResourceForeground": "#eb6f92",
        }
    },
    "vitesse-dark": {
        name: "Vitesse Dark",
        type: "dark",
        bg: "#121212",
        fg: "#dbdbdb",
        colors: {
            "sideBar.background": "#181818",
            "sideBar.foreground": "#dbdbdb",
            "sideBar.border": "#121212",
            "list.activeSelectionBackground": "#222222",
            "list.activeSelectionForeground": "#4d9372",
            "list.hoverBackground": "#1a1a1a",
            "list.focusOutline": "#4d9372",
            "input.background": "#121212",
            "input.border": "#222222",
            "gitDecoration.addedResourceForeground": "#4d9372",
            "gitDecoration.modifiedResourceForeground": "#cb9000",
            "gitDecoration.deletedResourceForeground": "#d04040",
        }
    }
};
