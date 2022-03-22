import { CensorType, IPreferences, OperationMode } from "./types";
import { toTitleCase } from "../util";


export const defaultPrefs: IPreferences = {
    exposed: {
        Pits: {method: CensorType.None, level: 5},
        Breasts: {method: CensorType.Pixels, level: 10},
        Belly: {method: CensorType.None, level: 4},
        Ass: {method: CensorType.Pixels, level: 10},
        Cock: {method: CensorType.None, level: 1.0},
        Feet: {method: CensorType.Blur, level: 10},
        Pussy: {method: CensorType.Sticker, level: 12}
    },
    covered: {
        Pits: {method: CensorType.None, level: 5},
        Breasts: {method: CensorType.Blur, level: 10},
        Belly: {method: CensorType.None, level: 2},
        Ass: {method: CensorType.Blur, level: 10},
        Cock: {method: CensorType.None, level: 2},
        Feet: {method: CensorType.None, level: 2},
        Pussy: {method: CensorType.Pixels, level: 8}
    },
    otherCensoring: {
        femaleEyes: {method: CensorType.BlackBox, level: 10},
        femaleFace: {method: CensorType.None, level: 5},
        maleFace: {method: CensorType.None, level: 5},
        femaleMouth: {method: CensorType.None, level: 5}
    },
    mode: OperationMode.OnDemand,
    videoCensorLevel: 2,
    videoCensorMode: "Block",
    rescaleLevel: 3,
    saveLocalCopy: false,
    obfuscateImages: false,
    autoAnimate: false,
    // enabledPlaceholders: [],
    enabledStickers: [],
    // subliminal: {
    //     enabled: false,
    //     delay: 4000,
    //     duration: 250
    // },
    // allowList: [],
    // forceList: [],
    // errorMode: 'normal',
    hideDomains: true
}
