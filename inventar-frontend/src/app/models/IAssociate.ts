import { AssociateBookInfo } from "./AssociateBookInfo";
import { IBook } from "./IBook";

export interface IAssociate {
    id: string;
    firstName: string;
    lastName: string;
    phoneNumber: number;
    bookInfo: AssociateBookInfo[];
}