import fs from "fs";

let html = fs.readFileSync("./src/enforcer/web/test.txt", 'utf8')

console.log(html);
let str = "./assets/data"

let regex = /\.\/assets\//g
str = str.replaceAll(regex, "/")

console.log(str);