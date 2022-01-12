export interface EntityOperation<T> {
    query(): void;
    delete(id: string): void;
    openAddEditForm(entity?: T): void;
    openDeleteConfirmDialog(id: string): void;
}