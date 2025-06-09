import { ObjectId } from "mongodb";

export default class ImageData {
    constructor(
        public id: String,
        public tags: String[]
    ) {}
}