import fetch from 'node-fetch';
import fs from 'fs';
import {createRequire} from 'node:module'

const require = createRequire(import.meta.url);

const Downloader = require("nodejs-file-downloader");


const readFile = (fileName) => {
    const path = `./m3u-files/${fileName}`
    return fs.readFileSync(path, 'utf8');
}

const parseFile = (fileName) => {
    const file = readFile(fileName);
    const strs = file.split('\n')
    let title = '';
    return strs.slice(1).reduce((acc, str, index) => {
        if (str.includes('EXTINF')) {
            title = str.split('#EXTINF:')[1];
        }
        if (str.includes('http') && title) {
            acc.push({title, url: str});
            title = '';
        }
        return acc;
    }, []);
};

const http = require('http'); // or 'https' for https:// URLs

const downloadMp3 = async (item, dir, outOf) => {
    const downloader = new Downloader({
        url: item.url,
        directory: dir,
        fileName: `${item.title}.mp3`,
        onProgress: function (percentage, chunk, remainingSize) {
            //Gets called with each chunk.
            console.log(`${outOf}`, `${item.title}`, `${percentage}%`);
            // console.log("% ", percentage);
            // console.log("Current chunk of data: ", chunk);
            // console.log("Remaining bytes: ", remainingSize);
        },
    });

    try {
        await downloader.download();
    } catch (error) {
        console.log(error);
    }
}

const downloadAll = async (fileName, targetDirname) => {
    const items = parseFile(fileName);
    let index = 0;
    for (const item of items) {
        index++;
        console.log('item: ',index, item);
        await downloadMp3(item, targetDirname, `${index}/${items.length}`);
    }
}

const createDir = (m3uFileName) => {
    const name = m3uFileName.split('.')[0];
    const dirname = `mp3-files/${name}`
    return dirname
}

const magic = async () => {
    const fileName = fs.readdirSync('./m3u-files')[0];
    console.log('fileName: ', fileName);
    const targetDirname = createDir(fileName);
    console.log('targetDirname: ', targetDirname);
    try {
        await downloadAll(fileName, targetDirname)
        fs.unlink(`./m3u-files/${fileName}`, (err) => {
            if (err) {
                console.error(err)
                return
            }
            console.log('Deleted: ', fileName);
        })
    } catch (e) {
        console.log(e);
    }

}
magic()
