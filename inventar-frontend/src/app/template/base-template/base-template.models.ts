export interface MenuItem {
    icon: string,
    text: string,
    description?: string,
    link: string,
    /** Tile colour for the sidebar icon (iOS system colour). */
    color?: string
}

export type SideBarMode = "over" | "side";