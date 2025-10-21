import axios from "axios";
import { Base, Channel, TextChannel } from "discord.js";
import fs from "fs";
import { Axios } from "node_modules/axios/index.cjs";

class FormManager {
    public textTags = ["img", "p", "quote", "title", "description", "fields"]
    public selfClosingTags = ["img"]

    public parseFormData(formData: String) {
        if (!formData.startsWith("<form>")) {
            throw new Error("Invalid form data");
        }

        const tagRegex = /<[^>]+>/g;
        const tags = formData.match(tagRegex) || [];

        let rootTag;
        let currentTag: BaseTag | undefined;

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
                                    currentTag.content = formData.substring(currentTag.index + currentTag.name.length + 2, i);
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
                            i = j;
                            break;
                        }
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
        let padding = "";
        for (let i = 0; i < depth; i++) {
            padding += "  ";
        }
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
}

class ContainerTag extends BaseTag {
    public content: BaseTag[] = [];
    constructor(name: string, index: number, tags: BaseTag[] = []) {
        super(name, index);
        this.content = tags;
    }

    public override print(depth = 0) {
        let padding = "";
        for (let i = 0; i < depth; i++) {
            padding += "  ";
        }
        console.log(padding + `{ name: ${this.name}, index: ${this.index}`);
        console.log(padding + "  content: [");
        this.content.forEach(tag => tag.print(depth + 1));
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
        let padding = "";
        for (let i = 0; i < depth; i++) {
            padding += "  ";
        }
        console.log(`${padding}{ name: ${this.name}, index: ${this.index}, content: ${this.content} }`)
    }
}

console.log(new FormManager().parseFormData(fs.readFileSync("C:/Users/risin/OneDrive/Documents/GitHub/EnforcerRewrite2/src/resources/testform.html").toString())?.print());

/*
try {
    axios.get("https://media.disordapp.net/attachments/1088999109387620493/1421216058550780045/image.png?ex=68d83a19&is=68d6e899&hm=0dcd4b6f6ca2ba8ecaf89c179a9fbb8c5185d55f59cd50c123c20a3bcd3038df&=&format=webp&quality=lossless&width=1872&height=393", { responseType: 'arraybuffer' }).then(
        (response) => {
            let buffer = Buffer.from(response.data, "utf-8");
            fs.writeFileSync("C:/Users/risin/OneDrive/Documents/GitHub/EnforcerRewrite2/src/resources/testimage.png", buffer);
        }
    )
}
catch (e) {
    console.log(e);
}
*/
console.log("done");