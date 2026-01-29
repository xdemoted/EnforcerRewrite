import axios from "axios";
import { Base, Channel, TextChannel } from "discord.js";
import fs from "fs";
import { Axios } from "node_modules/axios/index.cjs";
import GeneralUtils from "src/general/utils/GeneralUtils";

class FormManager {
    public textTags = ["img", "p", "quote", "title", "description", "fields"]
    public selfClosingTags = ["img"]

    public parseFormData(formData: String) { // Throws Error on invalid image tag
        if (!formData.startsWith("<form>")) {
            throw new Error("Invalid form data");
        }

        const tagRegex = /<[^>]+>/g;
        const tags = formData.match(tagRegex) || [];

        let rootTag;
        let currentTag: BaseTag | undefined;

        console.log(tags)

        for (let i = 0; i < formData.length; i++) {
            let char = formData[i];
            if (char === "<") {
                for (let j = i; j < formData.length; j++) {
                    if (formData[j] === ">") {
                        let tagName = formData.substring(i + 1, j).trim();
                        if (tagName.startsWith("img")) {
                            const imgTag = new ImageTag(i, formData.substring(i, j + 1));
                            if (currentTag instanceof ContainerTag) {
                                imgTag.parent = currentTag;
                                currentTag.content.push(imgTag);
                            }
                        } else {
                            let isClosingTag = tagName.startsWith("/");

                            if (isClosingTag) {
                                if (currentTag instanceof TextTag) {
                                    currentTag.content = formData.substring(currentTag.index + currentTag.name.length + 2, i)
                                }

                                if (currentTag?.parent === undefined) {
                                    rootTag = currentTag;
                                }

                                currentTag = currentTag?.parent;
                            } else {
                                const lastTag = currentTag;
                                if (this.textTags.includes(tagName)) {
                                    currentTag = new TextTag(tagName, i, "");
                                } else {
                                    currentTag = new ContainerTag(tagName, i);
                                }

                                if (lastTag instanceof ContainerTag) {
                                    currentTag.parent = lastTag;
                                    lastTag.content.push(currentTag);
                                }
                            }
                        }
                        i = j;
                        break; // Prevent tag greediness
                    }
                }
            }
        }

        return rootTag;
    }


}

class Form {
    public originMessageId?: string;
    public formIds: string[] = [];

    constructor() {

    }

}

class BaseTag {
    public name: string;
    public index: number;
    public parent?: BaseTag;
    public open = true;
    constructor(name: string, index: number) {
        this.name = name;
        this.index = index;
    }

    public print(depth = 0) {
        let padding = GeneralUtils.addDepthPadding(depth);
        console.log(`${padding}{ name: ${this.name}, index: ${this.index} }`)
    }
}

class ImageTag extends BaseTag {
    public override name: string = "img";
    public src;

    constructor(index: number, innerText: string) {
        super("img", index);

        innerText.match(/src="([^"]+)"/);
        this.src = RegExp.$1;

        if (this.src === undefined) {
            throw new Error("Invalid img tag, missing src attribute");
        }
    }

    public override print(depth = 0) {
        let padding = GeneralUtils.addDepthPadding(depth);
        console.log(`${padding}{ name: ${this.name}, index: ${this.index}, src: ${this.src} }`)
    }
}

class ContainerTag extends BaseTag {
    public content: BaseTag[] = [];
    constructor(name: string, index: number, tags: BaseTag[] = []) {
        super(name, index);
        this.content = tags;
    }

    public override print(depth = 0) {
        let padding = GeneralUtils.addDepthPadding(depth);
        console.log(padding + `{ name: ${this.name}, index: ${this.index}`);
        console.log(padding + "  content: [");
        this.content.forEach(tag => tag.print(depth + 2));
        console.log(`${padding}  ]`);
        console.log(padding + "}");
    }
}

class TextTag extends BaseTag {
    public content: string
    constructor(name: string, index: number, content: string) {
        super(name, index);
        this.content = content;
    }
    public override print(depth = 0) {
        let padding = GeneralUtils.addDepthPadding(depth);
        console.log(`${padding}{ name: ${this.name}, index: ${this.index}, content: ${this.content} }`)
    }
}

console.log(new FormManager().parseFormData(fs.readFileSync("C:/Users/risin/OneDrive/Documents/GitHub/EnforcerRewrite2/src/resources/testform.html").toString())?.print());

console.log("done");