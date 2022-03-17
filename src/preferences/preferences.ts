import { CensorType, IPreferences, OperationMode } from "./types";
import { toTitleCase } from "../util";


export const defaultPrefs: IPreferences = {
    exposed: {
        Pits: {method: CensorType.None, level: 1.0},
        Breasts: {method: CensorType.Caption, level: 5},
        Belly: {method: CensorType.None, level: 1.9},
        Ass: {method: CensorType.Pixels, level: 5},
        Cock: {method: CensorType.None, level: 1.0},
        Feet: {method: CensorType.None, level: 1.9},
        Pussy: {method: CensorType.Sticker, level: 7.4}
    },
    covered: {
        Pits: {method: CensorType.None, level: 1.1},
        Breasts: {method: CensorType.Caption, level: 5},
        Belly: {method: CensorType.None, level: 1.9},
        Ass: {method: CensorType.Pixels, level: 5},
        Cock: {method: CensorType.None, level: 1.0},
        Feet: {method: CensorType.None, level: 1.9},
        Pussy: {method: CensorType.Sticker, level: 7.4}
    },
    otherCensoring: {
        femaleEyes: 'None',
        femaleFace: {method: CensorType.Pixels, level: 1.0},
        maleFace: {method: CensorType.None, level: 1.0},
        femaleMouth: 'None'
    },
    mode: OperationMode.OnDemand,
    videoCensorLevel: 2,
    videoCensorMode: "Block",
    rescaleLevel: 3,
    saveLocalCopy: false,
    obfuscateImages: false,
    autoAnimate: false,
    enabledPlaceholders: ["Loser"],
    enabledStickers: ["Loser"],
    subliminal: {
        enabled: false,
        delay: 4000,
        duration: 250
    },
    allowList: [],
    forceList: [],
    errorMode: 'normal',
    hideDomains: true
}
