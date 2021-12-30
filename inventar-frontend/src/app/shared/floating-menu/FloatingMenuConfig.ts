export interface FloatingMenuButton {
    tooltip: string;
    icon: string;
    action: Function;
}

export interface FloatingMenuConfig {
    position: string;
    buttons: FloatingMenuButton[];
}
