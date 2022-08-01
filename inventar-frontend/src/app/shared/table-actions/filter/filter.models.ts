export interface FilterOptions {
    field: string;
    label: string;
    type: InputType;
    matSelectOptions?: SelectOptions;
}

export interface SelectOptions {
    options: any[];
    displayBy: string;
    valueBy: string;
}

export type InputType = "text" | "number" | "select";