import { Document, WithId } from "mongodb";
import { Rating } from "../Rating";

export default class Waifu {
    id: number = 0;
    url: string = "";
    rating: Rating = Rating.SAFE;
    color_dominant: number[] = [];
    color_palette: number[][] = [];
    artist_name: string | null = null;
    tags: string[] = [];
    source: string | null = null;

    constructor() {
    }

    static fromDocument(document: WithId<Document>): Waifu {
        return Object.assign(new Waifu(), document)
    }
}