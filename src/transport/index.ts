import { IPreferences } from "#/preferences";
import { IEvent, ISimpleEvent } from "strongly-typed-events";

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
    requestId?: string,
    srcId?: string
};

export interface ICensorBackend {
    requestId?: string;
    censorImage(request: ImageCensorRequest): Promise<ImageCensorResponse|undefined>;
    readonly onImageCensored: IEvent<ICensorBackend, ImageCensorResponse>;
    getRemotePreferences(): Promise<Partial<IPreferences>|undefined>;
    readonly onReceivePreferences: IEvent<ICensorBackend, Partial<IPreferences>>;
    updateRemotePreferences(preferences: IPreferences): Promise<boolean>;
    getStatistics(): Promise<StatisticsData|undefined>;
    resetStatistics(): Promise<boolean>;
    getAvailableAssets(assetType: AssetType): Promise<string[]|undefined>;
    readonly onUpdate: ISimpleEvent<ActionPayload>;
    cancelRequests(request: CancelRequest): Promise<void>;
}

export type StatisticsData = {
    [domain: string]: {safe: number, softcore: number, hardcore: number};
}

export type AssetType = 'stickers'|'error'|'other';

export interface IAssetStore {
    getImageUrl(type: AssetType, requestData: {[key: string]: any}): Promise<string>
}