import fs from "fs";

let html = fs.readFileSync("./src/enforcer/web/index.html", 'utf8')

let lines = html.split('\n')

let waifuRow = lines.findIndex(line => line.includes("waifurow"))
let start = lines.slice(0, waifuRow+1)
let end = lines.slice(waifuRow+1,lines.length)

start.push(`<div class="waifucard"><img src="imageURL" style="width:100%;height:200px" alt="Waifu Image"><div class="waifuDetails"><h2>waifuName</h2><p>Rating: rating</p><p>Tags: tags</p><p>Source: sourceURL</p><p>Artist: artistName</p></div></div>`)

let newHtml = start.join('\n') + end.join('\n')

console.log(newHtml);