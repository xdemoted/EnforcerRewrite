export default interface WaifuRandom {
    id: number;
    url: string;
    rating: string;
    color_dominant: number[];
    color_palette: number[][];
    artist_name: string | null;
    tags: string[];
    source: string | null;
}