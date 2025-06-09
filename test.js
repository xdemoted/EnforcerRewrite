const fs = require('fs');
const https = require('https');
const path = require('path');
/*
data.forEach(url => {
    let imageUrl = "https://pbs.twimg.com/media/" + url + "?format=jpg&name=4096x4096";
    const fileName = path.basename(url + ".jpg");
    const file = fs.createWriteStream(fileName);
    https.get(imageUrl, response => {
        response.pipe(file);
        file.on('finish', () => {
            file.close();
        });
    }).on('error', err => {
        fs.unlink(fileName);
        console.error('Error downloading:', imageUrl, err.message);
    });
});
*/
const readline = require('readline');

const fileStream = fs.createReadStream('data.json');

const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
});

let i = 0
rl.on('line', (line) => {
    const matches = line.match(/"([^"]*)"/);
    if (matches) {
        let url = matches[1];
        let imageUrl = "https://pbs.twimg.com/media/" + url + "?format=jpg&name=4096x4096";
        const fileName = path.basename("images/" + url + ".jpg");
        const file = fs.createWriteStream(fileName);
        https.get(imageUrl, response => {
            response.pipe(file);
            file.on('finish', () => {
                file.close();
            });
        }).on('error', err => {
            fs.unlink(fileName, (err) => {
                if (err) throw err;
                console.log('path/file.txt was deleted');
              });
            console.error('Error downloading:', imageUrl, err.message);
        });
    }
});

rl.on('close', () => {
    console.log('File reading completed.' + i);
});