"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_fetch_1 = __importDefault(require("node-fetch"));
class ImageURLVerify {
    static verify(url) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield (0, node_fetch_1.default)(url);
            if (!response.ok) {
                return "Invalid URL";
            }
            const contentType = response.headers.get('content-type');
            if (!contentType || !this.contentTypes.includes(contentType)) {
                return "Invalid Content Type";
            }
            return true;
        });
    }
}
ImageURLVerify.contentTypes = ["image/png", "image/jpeg", "image/gif", "image/webp", "video/mp4"];
exports.default = ImageURLVerify;
