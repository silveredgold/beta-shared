/**
 * The basic interface for a configuration override.
 * @remarks
 * Since clients will often have their own perferences types, this override 
 * could be backed by practically anything.
 */
export interface IOverride<T extends IPreferences> {
    /**
     * The ID of the current override.
     */
    id: string;
    /**
     * The unlock key for the current override.
     */
    key: string;
    /**
     * The allowed modes for the current override. Not all clients will implement this.
     */
    allowedModes: OperationMode[];
    /**
     * An integrity hash for the current override.
     * @remarks
     * This package does not specify an algorithm or enforcement for this, so 
     * it's up to clients.
     * Beta Protection uses a simple hash code and does enforce it.
     */
    hash?: number;
    /**
     * The preferences specified in this override to be, well, overridden.
     * @remarks
     * While clients are free to implement this themselves, the assumption 
     * is that any property *not* specified in the override is "unlocked".
     */
    preferences: Partial<T>;
    /**
     * The time this override is activated/installed.
     * @remarks
     * Clients should 100% ignore this property on incoming overrides.
     */
    activatedTime?: number;
    /**
     * The minimum amount of time (in minutes) that this override must be
     * enabled before being unlockable.
     */
    minimumTime?: number;
}

/**
 * The basic set of censoring preferences.
 * @remarks
 * As with many parts of this package, this is essentially a baseline, and
 * individual clients will likely extend this.
 */
export interface IPreferences {
    /**
     * The current operation mode.
     */
    mode: OperationMode;
    /**
     * The options used for "exposed" body part censoring.
     * @remarks
     * These are used for the `EXPOSED_*` classes from NN.
     */
    exposed: BodyCensorModes;
    /**
     * The options used for "covered" body part censoring.
     * @remarks
     * These are used for the `COVERED_*` classes from NN.
     */
    covered: BodyCensorModes;
    /**
     * Special body part censoring options.
     * @remarks
     * Not all clients or backends support this.
     */
    otherCensoring: {
        /**
         * Censoring mode used for female eyes.
         */
        femaleEyes: CensorMode;
        /**
         * Censoring mode used for female mouth.
         */
        femaleMouth: CensorMode;
        /**
         * Censoring mode used for female faces.
         */
        femaleFace: CensorMode,
        /**
         * Censoring mode used for male faces.
         */
        maleFace: CensorMode
    }
    /**
     * Level of video censoring from 1-20, with higher being more censored.
     * @remarks
     * Note that this only applies when the mode is set to "Blur".
     */
    videoCensorLevel: number;
    /**
     * The mode used to censor videos.
     */
    videoCensorMode: "Block"|"Blur"|"Allow";
    /**
     * A scale factor (with 1 being none) to be applied to images when they are censored.
     */
    rescaleLevel: number;
    /**
     * Request the backend to save a local copy of all censored images.
     * @remarks
     * Not all backends support/implement this.
     */
    saveLocalCopy: boolean;
    /**
     * Requests the backend to add a layer of obfuscation to images, designed to 
     * obfuscate the content and make reverse searching harder.
     */
    obfuscateImages: boolean;
    /**
     * Set animated images (i.e. GIFs) to be automatically animated. Behaviour of this
     * option is currently highly inconsistent.
     */
    autoAnimate: boolean;
    /**
     * A list of the currently enabled categories/stores/whatever from the backend
     * to use for stickers.
     */
    enabledStickers: string[];
    /**
     * The behaviour to use when a censoring error occurs.
     * @remarks
     * The behaviour of this option is not specified here, but is usually 
     * implemented as SFW/NSFW/no-op.
     */
    errorMode: "subtle"|"normal"|"none";
    /**
     * Whether to hide the domains on a given request from the backend.
     */
    hideDomains: boolean;
}


export enum OperationMode {
    Disabled = "disabled",
    OnDemand = "onDemand",
    Enabled = "enabled"
}

export type CensorMode = {method: CensorType, level: number};

/**
 * Holds the censoring modes for individual body parts.
 * @remarks
 * These parts are designed to correlate to the classes supported 
 * by NudeNet.
 */
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

/**
 * Gets the available censoring types.
 * @returns An array of objects with the user-friendly label and actual value of available censor types.
 */
export const getCensorTypes = () => {
    var names = Object.keys(CensorType).map(k => k.replace(/([A-Z])/g, " $1").trim());
    var values = Object.values(CensorType);
    var merged = names.map((val, idx) => {
        return {label: val, value: values[idx]}
    });
    return merged;
}