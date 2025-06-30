import { Document, WithId } from "mongodb";

class DocumentMap {
    [key: string]: any;
};

export default class DocumentUtils {
    public static loadFromDocument<T extends Record<string, any>>(docObj: T, document: WithId<Document>): T {
        for (const [key, value] of Object.entries(docObj)) {
            if (value instanceof Map && document[key] instanceof DocumentMap) {
                for (const [mapKey, mapValue] of Object.entries(document[key] || {})) {
                    docObj[key].set(mapKey, mapValue);
                }
            }
        }
    }
}