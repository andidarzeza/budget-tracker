export interface Income {
    id: string;
    createdTime: Date;
    lastModifiedDate: Date;
    incoming: number;
    name: string;
    description: string;
    categoryID: string;
}