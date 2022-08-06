
import { toTitleCase } from "..";
import { defaultPrefs } from "./preferences";
import { CensorType, IPreferences, OperationMode } from "./types";

/**
 * The preferences as Beta Safety uses/stores them.
 */
export type BetaSafetyPreferences = {
    video: string;
    modus: string;
    fface: string;
    feyes: string;
    mface: string;
    cpits: string;
    epits: string;
    cbreasts: string;
    ebreasts: string;
    cbelly: string;
    ebelly: string;
    cass: string;
    eass: string;
    cpussy: string;
    epussy: string;
    ccock: string;
    ecock: string;
    cfeet: string;
    efeet: string;
    rescalinglevel: string;
    videolevel: string;
    ffacelevel: string;
    mfacelevel: string;
    cpitslevel: string;
    epitslevel: string;
    cbreastslevel: string;
    ebreastslevel: string;
    cbellylevel: string;
    ebellylevel: string;
    casslevel: string;
    easslevel: string;
    cpussylevel: string;
    epussylevel: string;
    ccocklevel: string;
    ecocklevel: string;
    cfeetlevel: string;
    efeetlevel: string;
    localCopy: string;
    obfuscate: string;
    animate: string;
    selectedPlaceholders: string[];
    selectedStickers: string[];
}

/**
 * Converts preferences as received from Beta Safety into the format used in this package.
 * @param raw The preferences to convert in Beta Safety format.
 * @returns The preferences in beta-shared format.
 */
export function createPreferencesFromBackend(raw: BetaSafetyPreferences): IPreferences {

    return {
        ...defaultPrefs,
        // allowList: raw["whitelist"] as string[] ?? [],
        autoAnimate: raw.animate === 'true',
        covered: {
            Ass: getCensorObj(raw, "cass"),
            Belly: getCensorObj(raw, "cbelly"),
            Breasts: getCensorObj(raw, "cbreasts"),
            Cock: getCensorObj(raw, "ccock"),
            Feet: getCensorObj(raw, "cfeet"),
            Pits: getCensorObj(raw, "cpits"),
            Pussy: getCensorObj(raw, "cpussy")
        },
        exposed: {
            Ass: getCensorObj(raw, "eass"),
            Belly: getCensorObj(raw, "ebelly"),
            Breasts: getCensorObj(raw, "ebreasts"),
            Cock: getCensorObj(raw, "ecock"),
            Feet: getCensorObj(raw, "efeet"),
            Pits: getCensorObj(raw, "epits"),
            Pussy: getCensorObj(raw, "epussy")
        },
        // enabledPlaceholders: raw.selectedPlaceholders,
        enabledStickers: raw.selectedStickers,
        // forceList: raw["blacklist"] ?? [],
        // mode: parseModus(raw.modus),
        obfuscateImages: raw.obfuscate === "true",
        otherCensoring: {
            femaleEyes: (() => {
                const rawEyes = raw.feyes.replace("feyes", "");
                const method = rawEyes === 'bb' 
                    ? CensorType.BlackBox
                    : rawEyes === 'sticker'
                        ? CensorType.Caption
                        : CensorType.None;
                return {method, level: 5};
              })(),
            femaleFace: getCensorObj(raw, "fface"),
            maleFace: getCensorObj(raw, "mface"),
            femaleMouth: {method: CensorType.None, level: 5}
        },
        rescaleLevel: +raw.rescalinglevel,
        saveLocalCopy: raw.localCopy === 'true',
        videoCensorLevel: +raw.videolevel,
        videoCensorMode: toTitleCase(raw.video.replace("video", "")) as "Block"|"Blur"|"Allow"
    }
}

/**
 * Converts a set of user censoring preferences to the format Beta Safety expects.
 * @param prefs The user censoring preferences.
 * @returns The equivalent Beta Safety-compatible representation of those preferences.
 */
export const toBetaSafety = (prefs: IPreferences): Partial<BetaSafetyPreferences> => {
    return {
        animate: prefs.autoAnimate.toString(),
        cass: `cass${parseType(prefs.covered.Ass.method)}`,
        casslevel: prefs.covered.Ass.level.toFixed(1),
        cbelly: `cbelly${parseType(prefs.covered.Belly.method)}`,
        cbellylevel: prefs.covered.Belly.level.toFixed(1),
        cbreasts: `cbreasts${parseType(prefs.covered.Breasts.method)}`,
        cbreastslevel: prefs.covered.Breasts.level.toFixed(1),
        ccock: `ccock${parseType(prefs.covered.Cock.method)}`,
        ccocklevel: prefs.covered.Cock.level.toFixed(1),
        cfeet: `cfeet${parseType(prefs.covered.Feet.method)}`,
        cfeetlevel: prefs.covered.Feet.level.toFixed(1),
        cpits: `cpits${parseType(prefs.covered.Pits.method)}`,
        cpitslevel: prefs.covered.Pits.level.toFixed(1),
        cpussy: `cpussy${parseType(prefs.covered.Pussy.method)}`,
        cpussylevel: prefs.covered.Pussy.level.toFixed(1),
        eass: `eass${parseType(prefs.exposed.Ass.method)}`,
        easslevel: prefs.exposed.Ass.level.toFixed(1),
        ebelly: `ebelly${parseType(prefs.exposed.Belly.method)}`,
        ebellylevel: prefs.exposed.Belly.level.toFixed(1),
        ebreasts: `ebreasts${parseType(prefs.exposed.Breasts.method)}`,
        ebreastslevel: prefs.exposed.Breasts.level.toFixed(1),
        ecock: `ecock${parseType(prefs.exposed.Cock.method)}`,
        ecocklevel: prefs.exposed.Cock.level.toFixed(1),
        efeet: `efeet${parseType(prefs.exposed.Feet.method)}`,
        efeetlevel: prefs.exposed.Feet.level.toFixed(1),
        epits: `epits${parseType(prefs.exposed.Pits.method)}`,
        epitslevel: prefs.exposed.Pits.level.toFixed(1),
        epussy: `epussy${parseType(prefs.exposed.Pussy.method)}`,
        epussylevel: prefs.exposed.Pussy.level.toFixed(1),
        feyes: `feyes${toSupportedEyeType(prefs.otherCensoring.femaleEyes.method)}`,
        fface: `fface${parseType(prefs.otherCensoring.femaleFace.method)}`,
        ffacelevel: prefs.otherCensoring.femaleFace.level.toFixed(1),
        localCopy: prefs.saveLocalCopy.toString(),
        mface: `mface${parseType(prefs.otherCensoring.maleFace.method)}`,
        mfacelevel: prefs.otherCensoring.maleFace.level.toFixed(1),
        modus: parseMode(prefs.mode),
        obfuscate: prefs.obfuscateImages.toString(),
        rescalinglevel: prefs.rescaleLevel.toFixed(0),
        video: `video${prefs.videoCensorMode}`,
        videolevel: prefs.videoCensorLevel.toFixed(0),
        selectedStickers: prefs.enabledStickers.length ? prefs.enabledStickers : Object.values(prefs.enabledStickers as any)
    }
}

function toSupportedEyeType(type: CensorType): string {
    switch (type) {
        case CensorType.BlackBox:
            return 'bb';
        case CensorType.Caption:
            return 'sticker';
        default:
            return 'nothing';
            
    }
}

/**
 * Extracts a censoring mode for a specific key from a Beta Safety configuration object.
 * @param rawPrefs Beta Safety preferences
 * @param key The preferences key to extract.
 * @returns The censor mode.
 * @internal
 */
function getCensorObj(rawPrefs: BetaSafetyPreferences, key: string): {method: CensorType, level: number} {
    return {method: parseBackendType(rawPrefs[key].replace(key, "")), level: +rawPrefs[key + "level"]};
}

// function parseModus(rawType: string): OperationMode {
//     switch (rawType) {
//         case "standardmodus":
//             return OperationMode.Enabled;
//         case "demandmous":
//             return OperationMode.OnDemand;
//         case "disablemodus":
//         default:
//             return OperationMode.Disabled;
//     }
// }

/**
 * Converts an operation mode into the raw "modus" used by Beta Safety.
 * @param mode The operation mode.
 * @returns The Beta Safety-equivalent operation mode.
 */
function parseMode(mode: OperationMode): string {
    switch (mode) {
        case OperationMode.Disabled:
            return "disablemodus";
        case OperationMode.OnDemand:
            return "demandmodus";
        case OperationMode.Enabled:
            return "standardmodus"
    }
}

/**
 * Converts a censor method into the magic string equivalent for Beta Safety.
 * @param type The censoring method.
 * @returns The Beta Safety equivalent method string.
 */
function parseType(type: CensorType): string {
    switch (type) {
        case CensorType.BlackBox:
            return "bb";
        case CensorType.Pixels:
            return "pix";
        case CensorType.None:
            return "nothing";
        case CensorType.Caption:
            return "pixplus";
        default:
            return type.toLowerCase();
    }
}

/**
 * Parses Beta Safety's magic string censoring mode to its equivalent object.
 * @param type The Beta Safety censoring mode.
 * @returns The equivalent censoring method object.
 */
function parseBackendType(type: string): CensorType {
    switch (type) {
        case "bb":
            return CensorType.BlackBox;
        case "pix":
            return CensorType.Pixels;
        case "nothing":
            return CensorType.None;
        case "pixplus":
            return CensorType.Caption;
        default:
            return toTitleCase(type) as CensorType;
    }
}