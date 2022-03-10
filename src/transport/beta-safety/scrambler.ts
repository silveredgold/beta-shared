import {Image} from "image-js";

export class ImageScrambler {
    private _uri: string;
    /**
     *
     */
    constructor(dataUri: string) {
        this._uri = dataUri;
    }

    dataUrlToBlob = (base64: string) => fetch(`${base64}`).then(res => res.blob());

    async scramble(destType: string) {
        var img = await Image.load(this._uri);
        var crop = img.crop({x: 1, y: 1})
        var result = crop.toDataURL(destType);
        return result;
    }
}

export const scrambleImage = async (url: string, destType: string) => {
    var img = await Image.load(url);
    var crop = img.crop({x: getRandomInt(0,4), y: getRandomInt(0,4)})
    var result = crop.toDataURL(destType);
    return result;
}

function getRandomInt (min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}