export interface IOverride {
    id: string;
    key: string;
    allowedModes: OperationMode[];
    hash?: number;
    preferences: Partial<IPreferences>;
    activatedTime?: number;
    minimumTime?: number;
}

export interface IPreferences {
    mode: OperationMode;
    exposed: BodyCensorModes;
    covered: BodyCensorModes;
    otherCensoring: {
        femaleEyes: CensorMode;
        femaleMouth: CensorMode;
        femaleFace: CensorMode,
        maleFace: CensorMode
    }
    videoCensorLevel: number;
    videoCensorMode: "Block"|"Blur"|"Allow";
    rescaleLevel: number;
    saveLocalCopy: boolean;
    obfuscateImages: boolean;
    autoAnimate: boolean;
    // enabledPlaceholders: string[];
    enabledStickers: string[];
    // subliminal: SubliminalOptions;
    // allowList: string[];
    // forceList: string[];
    // errorMode: "subtle"|"normal";
    hideDomains: boolean;
}


export enum OperationMode {
    Disabled = "disabled",
    OnDemand = "onDemand",
    Enabled = "enabled"
}

export type SubliminalOptions = {
    enabled: boolean;
    delay: number;
    duration: number;
}

export type CensorMode = {method: CensorType, level: number};

export type BodyCensorModes = {
    Pits: CensorMode,
    Breasts: CensorMode,
    Belly: CensorMode,
    Ass: CensorMode,
    Cock: CensorMode,
    Feet: CensorMode,
    Pussy: CensorMode
}

export enum CensorType {
    None = "none",
    Pixels = "pixels",
    Caption = "caption",
    Sticker = "sticker",
    Blur = "blur",
    BlackBox = "blackbox"
}

export const getCensorTypes = () => {
    var names = Object.keys(CensorType).map(k => k.replace(/([A-Z])/g, " $1").trim());
    var values = Object.values(CensorType);
    var merged = names.map((val, idx) => {
        return {label: val, value: values[idx]}
    });
    return merged;
}