import { ChartType } from "chart.js";

export interface ChartOptions {
    type?: ChartType;
    labels?: string[];
    data?: number[];
    colors?: string[];
    datasets?: any[];
    showGridLines?: boolean;
}