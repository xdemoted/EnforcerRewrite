import { Rating } from "../Rating";

export default interface Waifu {
    id: number;
    url: string;
    rating: Rating;
    color_dominant: number[];
    color_palette: number[][];
    artist_name: string | null;
    tags: string[];
    source: string | null;
}