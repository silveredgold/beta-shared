import { IPreferences } from "#/preferences";
import type { IEvent, ISimpleEvent } from "strongly-typed-events";

export type ActionEntity = 'statistics'|'preferences'|'stickers';

export type ActionPayload = {
    msg: string,
    entityType: ActionEntity|string,
    eventData: {[key: string]: any}
};

export type ImageCensorRequest = {
    id: string,
    force: boolean,
    url: string,
    srcUrl?: string,
    srcId: string|number|undefined,
    preferences: IPreferences,
    requestData?: {[key: string]: any},
    context: {
        domain: string
    }
}

export type ImageCensorResponse = {
    id: string,
    srcId?: string,
    url: string,
    responseData: {[key: string]: any},
    error?: string
}

export type CancelRequest = {
    requestId?: string[],
    srcId?: string
};

export type ConnectionStatus = {
    available: boolean,
    name: string,
    message?: string,
    version?: string,
    [x: string]: unknown;
}

export interface ICensorBackend {
    requestId?: string;
    censorImage(request: ImageCensorRequest): Promise<ImageCensorResponse|undefined>;
    readonly onImageCensored: IEvent<ICensorBackend, ImageCensorResponse>;
    getRemotePreferences(): Promise<Partial<IPreferences>|undefined>;
    updateRemotePreferences(preferences: IPreferences): Promise<boolean>;
    getStatistics(): Promise<StatisticsData|undefined>;
    resetStatistics(): Promise<boolean>;
    getAvailableAssets(assetType: AssetType): Promise<string[]|undefined>;
    // readonly onUpdate: ISimpleEvent<ActionPayload>;
    cancelRequests(request: CancelRequest): Promise<void>;
    check(host?: string): Promise<ConnectionStatus>;
}

export type StatisticsData = {
    [domain: string]: DomainStatistics
}

export type DomainStatistics = {
    safe: number, 
    censored: number, 
    categories: {[key: string]: number}
}

export type AssetType = 'stickers'|'error'|'other';

export interface IAssetStore {
    getImageUrl(type: AssetType, requestData: {[key: string]: any}): Promise<string>
}