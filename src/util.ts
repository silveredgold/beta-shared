import { IPreferences, OperationMode } from "./preferences";

export function hashCode(str: string) {
    let hash = 0, i, chr;
    if (str.length === 0) return hash;
    for (i = 0; i < str.length; i++) {
        chr   = str.charCodeAt(i);
        hash  = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
  }
  
  /**
   * Format bytes as human-readable text.
   * 
   * @param bytes Number of bytes.
   * @param si True to use metric (SI) units, aka powers of 1000. False to use 
   *           binary (IEC), aka powers of 1024.
   * @param dp Number of decimal places to display.
   * 
   * @remarks Taken from https://stackoverflow.com/questions/10420352/converting-file-size-in-bytes-to-human-readable-string/10420404
   * 
   * @return Formatted string.
   */
  export function humanFileSize(bytes: number, si:boolean=false, dp:number=1) {
    const thresh = si ? 1000 : 1024;
  
    if (Math.abs(bytes) < thresh) {
      return bytes + ' B';
    }
  
    const units = si 
      ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'] 
      : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
    let u = -1;
    const r = 10**dp;
  
    do {
      bytes /= thresh;
      ++u;
    } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);
  
  
    return bytes.toFixed(dp) + ' ' + units[u];
  }
  
  export function getRandom<Type>(src: Type[]): Type {
    return src[Math.floor(Math.random()*src.length)]
  }
  
  export function generateUUID() { // Public Domain/MIT
    let d = new Date().getTime();//Timestamp
    let d2 = new Date().getMilliseconds() || 0;//Time in microseconds since page-load or 0 if unsupported
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        let r = Math.random() * 16;//random number between 0 and 16
        if(d > 0){//Use timestamp until depleted
            r = (d + r)%16 | 0;
            d = Math.floor(d/16);
        } else {//Use microseconds since page-load if supported
            r = (d2 + r)%16 | 0;
            d2 = Math.floor(d2/16);
        }
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  }
  
  export const shouldCensor = (prefs: IPreferences, url: string): boolean => {
    if (prefs?.mode) {
          // let prefs = confPrefs["preferences"] as IPreferences;
          const mode = prefs.mode;
          const whitelist = prefs.allowList?.length ? prefs.allowList : [];
          const blacklist = prefs.forceList?.length ? prefs.forceList : [];
          const siteAllowed = whitelist.map(l => l.replace(/^(?:https?:\/\/)?(?:www\.)?/i, "").toLowerCase()).some(wle => url.includes(wle));
          if (siteAllowed || mode == OperationMode.Disabled) {
              return false;
          } else if (mode == OperationMode.OnDemand) {
              const siteForced = blacklist.map(l => l.replace(/^(?:https?:\/\/)?(?:www\.)?/i, "").toLowerCase()).some(wle => url.includes(wle));
              return siteForced;
          } else {
              return true;
          }
      } else {
          return false;
      }
  }
  
  export const getDomain = (location: string, prefs?: IPreferences|boolean) => {
    return (typeof prefs === 'boolean' && prefs) || (prefs && prefs.hideDomains)
      ? "unknown.tld"
      : location.replace(/^(?:https?:\/\/)?(?:www\.)?/i, "")
  }

  
export function isValidUrl(url: string) {
    const http = (url.includes("http://") || url.includes("https://") || url.includes("data:image/") || url.includes("file://"));
    return http;
}

export function toTitleCase(str: string) {
    return str.replace(
      /\w\S*/g,
      function(txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
      }
    );
  }



  /*
MIT LICENSE
Copyright 2011 Jon Leighton
Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

export function base64ArrayBuffer(arrayBuffer: ArrayBuffer, mimeType?: string|null) {
  let base64    = ''
  const encodings = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
  const bytes         = new Uint8Array(arrayBuffer);
  const byteLength    = bytes.byteLength
  const byteRemainder = byteLength % 3
  const mainLength    = byteLength - byteRemainder

  let a, b, c, d
  let chunk

  // Main loop deals with bytes in chunks of 3
  for (let i = 0; i < mainLength; i = i + 3) {
    // Combine the three bytes into a single integer
    chunk = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2]

    // Use bitmasks to extract 6-bit segments from the triplet
    a = (chunk & 16515072) >> 18 // 16515072 = (2^6 - 1) << 18
    b = (chunk & 258048)   >> 12 // 258048   = (2^6 - 1) << 12
    c = (chunk & 4032)     >>  6 // 4032     = (2^6 - 1) << 6
    d = chunk & 63               // 63       = 2^6 - 1

    // Convert the raw binary segments to the appropriate ASCII encoding
    base64 += encodings[a] + encodings[b] + encodings[c] + encodings[d]
  }

  // Deal with the remaining bytes and padding
  if (byteRemainder == 1) {
    chunk = bytes[mainLength]

    a = (chunk & 252) >> 2 // 252 = (2^6 - 1) << 2

    // Set the 4 least significant bits to zero
    b = (chunk & 3)   << 4 // 3   = 2^2 - 1

    base64 += encodings[a] + encodings[b] + '=='
  } else if (byteRemainder == 2) {
    chunk = (bytes[mainLength] << 8) | bytes[mainLength + 1]

    a = (chunk & 64512) >> 10 // 64512 = (2^6 - 1) << 10
    b = (chunk & 1008)  >>  4 // 1008  = (2^6 - 1) << 4

    // Set the 2 least significant bits to zero
    c = (chunk & 15)    <<  2 // 15    = 2^4 - 1

    base64 += encodings[a] + encodings[b] + encodings[c] + '='
  }
  if (mimeType) {
      return `data:${mimeType};base64,${base64}`;
  }
  return base64
}