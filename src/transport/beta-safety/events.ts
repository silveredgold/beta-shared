import { createPreferencesFromBackend, IPreferences, rawPreferences } from "#/preferences";
import { StatisticsData } from "..";
import { BetaSafetyBackendClient } from "./client";

export type SocketEvent<Type> = {
    event: string;
    handler: (message: any, sender: BetaSafetyBackendClient) => Promise<Type>
}

export const placeholderStickerEvent: SocketEvent<void> = {
    event: 'detectPlaceholdersAndStickers',
    handler: async (response, sender) => {
        if (parseInt(response.status) === 200 && response['stickers']) {
            sender._onUpdate.dispatch({ msg: 'updateStickers', entityType: 'stickers', eventData: { categories: response['stickers'] ?? [] } });
            //TODO: we don't actually need to do this anymore, we don't use the backend placeholders anywhere
        }
    }
}

export const censoredImageEvent: SocketEvent<void> = {
    event: 'censorImage',
    handler: async (response, ctx) => {
        let errorMsg: string | undefined;
        let url: string;
        if (parseInt(response.status) === 200 || parseInt(response.status) === 304) {
            url = response.url;
        } else {
            console.log(`error image response`, response);
            errorMsg = response.url;
            url = '';
            // we don't have an NSFW error screen yet
            // ignore that, we do now
        }
        ctx._onImageCensored.dispatch(ctx, {
            id: response.id,
            srcId: response.tabid,
            url,
            error: errorMsg,
            responseData: {
                type: response.type
            }
        });
    }
}

export const preferencesEvent: SocketEvent<Partial<IPreferences>> = {
    event: 'getUserPreferences',
    handler: async (response, ctx) => {
        const log = (...data: any[]) => {
            // console.debug(...data);
            //this is just here to make debugging things easier
            // this is so chatty, even using dbg would be annoying
        }

        if (parseInt(response.status) === 200) {
            const rawPrefs = response["preferences"] as rawPreferences;
            log('raw prefs', rawPrefs);
            const backendPrefs = createPreferencesFromBackend(rawPrefs);
            log('backend prefs', backendPrefs);
            ctx._onFetchPreferences.dispatch(ctx, backendPrefs);
            return backendPrefs;
        }
        return {};
    }
}

export const statisticsEvent: SocketEvent<void> = {
    event: 'getStatistics',
    handler: async (response, ctx) => {
        if (parseInt(response.status) === 200) {
            const rawLogs = response["logs"] as string;
            const stats = parseRawStatistics(rawLogs);
            ctx._onReceiveStatistics.dispatch(ctx, stats);
        }
    }
}

export const resetStatisticsEvent: SocketEvent<void> = {
    event: 'resetStatistics',
    handler: async (response, ctx) => {
        const success = parseInt(response.status) === 200;
        ctx._onUpdate.dispatch({ msg: 'resetStatistics', entityType: 'statistics', eventData: { success } });
    }
}

export const updatePreferencesEvent: SocketEvent<void> = {
    event: 'updatePreferences',
    handler: async (response, ctx) => {
        const success = parseInt(response.status) === 200;
        ctx._onUpdate.dispatch({ msg: 'updatePreferences', entityType: 'preferences', eventData: { success } });
    }
}

const parseRawStatistics = (rawObj: string) => {
    const out: StatisticsData = {};
    const input = rawObj.replace(/^{/, "").replace(/}$/, "");
    const siteObjs = (input ?? "").split(',').map(i => i.trim());
    for (const site of siteObjs.filter(v => !!v)) {
        const siteName = site.split('=')[0];
        const [safe, hardcore, softcore] = site.split('=')[1].split(';');
        out[siteName] = { safe: +safe, hardcore: +hardcore, softcore: +softcore };
    }
    return out;
}