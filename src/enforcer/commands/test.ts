import nodeHtmlToImage from 'node-html-to-image';
import fs from 'fs';
import GeneralUtils from '../utils/GeneralUtils';

/*
nodeHtmlToImage({
  output: './image.png',
  html: fs.readFileSync('./level.html', 'utf8'),
  selector: 'body > div',
})
  .then(() => console.log('The image was created successfully!'))
  .catch(err => console.error('Error creating image:', err));
*/

for (let i = 0; i < 100; i++) {
    console.log(GeneralUtils.getXPForLevel(i));
}