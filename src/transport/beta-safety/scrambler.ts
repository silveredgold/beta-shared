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
    var crop = img.crop({x: 1, y: 1})
    var result = crop.toDataURL(destType);
    return result;
}