import axios from "axios";
import { Base, Channel, TextChannel } from "discord.js";
import fs from "fs";
import { Axios } from "node_modules/axios/index.cjs";
import GeneralUtils from "src/general/utils/GeneralUtils";
import HTMLUtils from "src/general/utils/HTMLUtils";

class FormManager {
    public textTags = ["p", "quote", "title", "description"]
    public selfClosingTags = ["img"]

    public parseFormData(formData: string): BaseTag { // Throws Error on invalid image tag
        if (!formData.startsWith("<form>")) {
            throw new Error("Invalid form data");
        }

        const tagRegex = /<[^>]+>/g;
        const tags = formData.match(tagRegex) || [];

        let rootTag: BaseTag | undefined;
        let currentTag: BaseTag | undefined;

        console.log(tags)

        for (let i = 0; i < formData.length; i++) {
            let char = formData[i];
            if (char === "<") {
                for (let j = i; j < formData.length; j++) {
                    if (formData[j] === ">") {
                        const rawTagName = formData.substring(i + 1, j).trim();
                        const isClosingTag = rawTagName.startsWith("/");
                        const normalizedTagName = (isClosingTag ? rawTagName.substring(1) : rawTagName).split(/\s+/)[0];

                        if (normalizedTagName === "img") {
                            const imgTag = new ImageTag(i, formData.substring(i, j + 1), j + 1);
                            if (currentTag instanceof ContainerTag) {
                                imgTag.parent = currentTag;
                                currentTag.content.push(imgTag);
                            }
                        } else {
                            if (isClosingTag) {
                                if (currentTag instanceof TextTag) {
                                    currentTag.content = formData.substring(currentTag.openingTagEndIndex, i)
                                } else if (currentTag instanceof FieldTag) {
                                    currentTag.value = formData.substring(currentTag.openingTagEndIndex, i);
                                }

                                if (currentTag?.parent === undefined) {
                                    rootTag = currentTag;
                                }

                                currentTag = currentTag?.parent;
                            } else {
                                const lastTag = currentTag;
                                if (this.textTags.includes(normalizedTagName)) {
                                    currentTag = new TextTag(normalizedTagName, i, "", j + 1);
                                } else if (normalizedTagName === "field") {
                                    currentTag = new FieldTag(i, formData.substring(i, j + 1), j + 1);
                                } else {
                                    currentTag = new ContainerTag(normalizedTagName, i, [], j + 1);
                                }

                                if (rootTag === undefined) {
                                    rootTag = currentTag;
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

        if (rootTag === undefined) {
            throw new Error("Unable to parse root tag from form data");
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
    public openingTagEndIndex: number = 0;
    public parent?: BaseTag;
    public open = true;
    constructor(name: string, index: number, openingTagEndIndex: number = 0) {
        this.name = name;
        this.index = index;
        this.openingTagEndIndex = openingTagEndIndex;
    }

    public print(depth = 0) {
        let padding = GeneralUtils.addDepthPadding(depth);
        console.log(`${padding}BaseTag { name: ${this.name}, index: ${this.index} }`)
    }
}

class ImageTag extends BaseTag {
    public override name: string = "img";
    public src;

    constructor(index: number, innerText: string, openingTagEndIndex: number) {
        super("img", index, openingTagEndIndex);
        console.log("Parsing image tag with inner text:", innerText);

        innerText.match(/src="([^"]+)"/);
        this.src = RegExp.$1;

        if (this.src === undefined) {
            throw new Error("Invalid img tag, missing src attribute");
        }
    }

    public override print(depth = 0) {
        let padding = GeneralUtils.addDepthPadding(depth);
        console.log(`${padding}ImageTag { name: ${this.name}, index: ${this.index}, src: ${this.src} }`)
    }
}

class FieldTag extends BaseTag {
    public value: string = "";
    public inline: boolean = false;
    constructor(index: number, openingTagText: string, openingTagEndIndex: number) {
        super("field", index, openingTagEndIndex);
        
        const properties = HTMLUtils.getProperties(openingTagText);
        this.name = properties["name"] || "unknown";
        this.inline = properties["inline"] === "true";
    }

    public override print(depth = 0) {
        let padding = GeneralUtils.addDepthPadding(depth);
        console.log(`${padding}FieldTag { name: ${this.name}, index: ${this.index}, value: ${this.value}, inline: ${this.inline} }`)
    }
}

class ContainerTag extends BaseTag {
    public content: BaseTag[] = [];
    constructor(name: string, index: number, tags: BaseTag[] = [], openingTagEndIndex: number = 0) {
        super(name, index, openingTagEndIndex);
        this.content = tags;
    }

    public override print(depth = 0) {
        let padding = GeneralUtils.addDepthPadding(depth);
        console.log(padding + `ContainerTag { name: ${this.name}, index: ${this.index}`);
        console.log(padding + "  content: [");
        this.content.forEach(tag => tag.print(depth + 2));
        console.log(`${padding}  ]`);
        console.log(padding + "}");
    }
}

class TextTag extends BaseTag {
    public content: string
    constructor(name: string, index: number, content: string, openingTagEndIndex: number = 0) {
        super(name, index, openingTagEndIndex);
        this.content = content;
    }
    public override print(depth = 0) {
        let padding = GeneralUtils.addDepthPadding(depth);
        console.log(`${padding}TextTag { name: ${this.name}, index: ${this.index}, content: ${this.content} }`)
    }
}

new FormManager().parseFormData(fs.readFileSync("src/resources/testform.html", "utf8")).print();