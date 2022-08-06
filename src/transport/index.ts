import { IPreferences } from "../preferences";
import type { IEvent } from "strongly-typed-events";

export type ActionEntity = 'statistics'|'preferences'|'stickers';

/**
 * An internal type used to provide lightweight event data between components.
 */
export type ActionPayload = {
    msg: string,
    entityType: ActionEntity|string,
    eventData: {[key: string]: any}
};

/**
 * The request message sent to censoring backends to censor an image.
 */
export type ImageCensorRequest = {
    /**
     * A unique identifier for this image request.
     * @remarks
     * You can use this ID internally if you want, the important part is for this ID to be present in the response body.
     */
    id: string,
    /**
     * Whether this request is a "forced" or manually invoked action.
     * @remarks
     * How to interpret this is up to you but, as an example, other transports will skip caches when this is `true`.
     */
    force: boolean,
    /**
     * The URL of the image to be censored. Note that this can be a HTTP(S) URI or a Data URI.
     */
    url: string,
    /**
     * The original URL of the image as it appeared for the user (i.e. its HTTP URI for browser contexts).
     * @remarks
     * This will not always be set, but if the `url` property is a Data URI this *should* be the original HTTP URI
     * for clients that don't support/understand Data URIs.
     */
    srcUrl?: string,
    /**
     * An identifier for the source context of the current request. In browsers, this is the tab ID.
     * @remarks
     * This should **not** be used to differentiate requests (that's the `id`) but *can* be used to group requests.
     */
    srcId: string|number|undefined,
    /**
     * The current user preferences to be used with this request.
     */
    preferences: IPreferences,
    /**
     * An optional collection of additional key-value pairs for use with this request. Some clients may not specify these.
     * @remarks
     * Always check this carefully as some requests will not include any keys, and not all keys will be relevant to all
     * backends (or clients for that matter).
     */
    requestData?: {[key: string]: any},
    /**
     * Context for the current request.
     */
    context: {
        /**
         * The domain (*not* the page URL) that this request originated from.
         * @remarks
         * This may not be set, and might also be set to fake values. Trust the client.
         */
        domain?: string
    }
}

/**
 * A response object for an image censoring request.
 */
export type ImageCensorResponse = {
    /**
     * The request ID that this response "belongs" to.
     * @remarks
     * This should always match the ID of an incoming request.
     */
    id: string,
    /**
     * It's strongly recommended (though not enforced) to return the same source ID from the request.
     */
    srcId?: string,
    /**
     * The URL of the censored image. This can be a Data URI or a regular HTTP(S) URI.
     * @remarks
     * While returning a HTTP(S) URI here is supported, it's recommended to use a Data URI.
     */
    url: string,
    /**
     * Arbitrary key-value pairs for the current response.
     * @remarks
     * If you don't need this, return an empty object.
     */
    responseData: {[key: string]: any},
    /**
     * The error message for why this request failed. **Only** set this if the request failed.
     */
    error?: string
}

export type CancelRequest = {
    requestId?: string[],
    srcId?: string
};

/**
 * A simple object representing the connection status for a given backend.
 */
export type ConnectionStatus = {
    /**
     * A simple yes/no flag for this backend being both a) reachable and b) available for requests.
     */
    available: boolean,
    /**
     * The name for this backend
     * @remarks
     * This may be presented to the user, you should keep it user-friendly.
     */
    name: string,
    /**
     * An optional message to provide to the client. Even when set, not all clients will show this.
     */
    message?: string,
    /**
     * The current version of this backend. This is optional, and not all clients will show this, but still recommended.
     */
    version?: string,
    [x: string]: unknown;
}

/**
 * The interface that clients (like the browser extension) use to communicate with backends.
 * This is essentially the "bare minimum" of shared functionality that a client will use to communicate with a backend
 * @remarks
 * As a result of the multi-purpose design of the `beta-*` packages, clients can require additional functionality beyond 
 * this interface to match their environment. For example, the extension has a separate provider abstraction to bridge this 
 * interface into the browser environment.
 */
export interface ICensorBackend {
    /**
     * This property was part of legacy functionality and will be removed in a future release.
     * @deprecated
     */
    requestId?: string;
    /**
     * Censor a given image based on the given censoring request.
     * @param request The image censoring request.
     */
    censorImage(request: ImageCensorRequest): Promise<ImageCensorResponse|undefined>;
    /**
     * An event fired when the backend has completed censoring a request and the client can continue.
     */
    readonly onImageCensored: IEvent<ICensorBackend, ImageCensorResponse>;
    /**
     * Returns any user preferences stored by the backend.
     * @remarks
     * If the backend doesn't store user preferences, return `undefined` from the Promise.
     */
    getRemotePreferences(): Promise<Partial<IPreferences>|undefined>;
    /**
     * Updates/saves user preferences as stored by the backend/
     * @param preferences The new user preferences to store in the backend.
     * @remarks
     * If the backend doesn't store user preferences, just return a `Promise<false>`
     */
    updateRemotePreferences(preferences: IPreferences): Promise<boolean>;
    /**
     * Fetches censoring statistics from the backend.
     * @remarks
     * Not all backends support this. If not, just return a `Promise<undefined>`
     */
    getStatistics(): Promise<StatisticsData|undefined>;
    /**
     * Requests that a backend should reset any stored censoring statistics.
     * @remarks
     * Not all backends support this, nor do they have to honour this.
     * If the backend doesn't support this, it will return a `Promise<false>` regardless.
     */
    resetStatistics(): Promise<boolean>;
    /**
     * Requests any assets of the specified type stored by the backend.
     * @param assetType The asset type to fetch from the backend.
     * @remarks
     * This is mostly used by clients to determine what backend-side assets are available for 
     * selection by the user (like stickers)
     */
    getAvailableAssets(assetType: AssetType): Promise<string[]|undefined>;
    /**
     * Request cancellation of a previously sent censoring request.
     * @param request Details of the censoring request to cancel.
     * @remarks
     * Some backends may not support this, but should handle the cancellation request regardless.
     */
    cancelRequests(request: CancelRequest): Promise<void>;
    /**
     * Checks the current backend's availability and readiness for requests.
     * @param host The host address to check for availability. When not specified, should use the backend's default address.
     */
    check(host?: string): Promise<ConnectionStatus>;
}

/**
 * A simple container type for per-domain censoring statistics returned from a backend.
 */
export type StatisticsData = {
    [domain: string]: DomainStatistics
}

/**
 * Censoring statistics for a single domain.
 */
export type DomainStatistics = {
    /**
     * The number of safe (i.e. not censored) images.
     */
    safe: number, 
    /**
     * The total number of censored images.
     */
    censored: number, 
    /**
     * Optionally provide additional categories of censored images for more granular statistics.
     */
    categories: {[key: string]: number}
}

export type AssetType = 'stickers'|'error'|'other';

export interface IAssetStore {
    getImageUrl(type: AssetType, requestData: {[key: string]: any}): Promise<string>
}