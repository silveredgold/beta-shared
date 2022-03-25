

import { IPreferences } from "./types";
import { CensorMode } from "./types";

export type NudeNetPreferences = {
    EXPOSED_ANUS: CensorMode;
    EXPOSED_ARMPITS: CensorMode;
    COVERED_BELLY: CensorMode;
    EXPOSED_BELLY: CensorMode;
    COVERED_BUTTOCKS: CensorMode;
    EXPOSED_BUTTOCKS: CensorMode;
    FACE_F: CensorMode;
    FACE_M: CensorMode;
    COVERED_FEET: CensorMode;
    EXPOSED_FEET: CensorMode;
    COVERED_BREAST_F: CensorMode;
    EXPOSED_BREAST_F: CensorMode;
    COVERED_GENITALIA_F: CensorMode;
    EXPOSED_GENITALIA_F: CensorMode;
    EXPOSED_BREAST_M: CensorMode;
    EXPOSED_GENITALIA_M: CensorMode;
}

export const toNudeNet = (prefs: IPreferences): Partial<NudeNetPreferences> => {
    return {
        COVERED_BELLY: prefs.covered.Belly,
        COVERED_BREAST_F: prefs.covered.Breasts,
        COVERED_BUTTOCKS: prefs.covered.Ass,
        COVERED_FEET: prefs.covered.Feet,
        COVERED_GENITALIA_F: prefs.covered.Pussy,
        EXPOSED_ANUS: prefs.exposed.Ass,
        EXPOSED_ARMPITS: prefs.exposed.Pits,
        EXPOSED_BELLY: prefs.exposed.Belly,
        EXPOSED_BREAST_F: prefs.exposed.Breasts,
        EXPOSED_BUTTOCKS: prefs.exposed.Ass,
        EXPOSED_FEET: prefs.exposed.Feet,
        EXPOSED_GENITALIA_F: prefs.exposed.Pussy,
        EXPOSED_GENITALIA_M: prefs.exposed.Cock,
        FACE_F: prefs.otherCensoring.femaleFace,
        FACE_M: prefs.otherCensoring.maleFace
    };
}