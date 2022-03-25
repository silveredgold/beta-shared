// import { SocketEvent } from "./events";
import { ActionPayload, ConnectionStatus, ICensorBackend } from "..";
import type { IPreferences } from "../../preferences";
import { EventDispatcher, IEvent, SimpleEventDispatcher } from "strongly-typed-events";
import { ImageCensorRequest, ImageCensorResponse, StatisticsData, AssetType, CancelRequest } from "..";
import { toNudeNet } from "../../preferences/nudenet";
import { fetch } from "cross-fetch";

export class CensorCoreRestClient implements ICensorBackend {
    
    private _version : string = "0.0.0";
    host: string;
    public get version() : string {
        return this._version;
    }
    public set version(v : string) {
        this._version = v;
    }
    

    _onFetchPreferences = new EventDispatcher<ICensorBackend, Partial<IPreferences>>();
    _onReceiveStatistics = new EventDispatcher<ICensorBackend, StatisticsData>();
    _onImageCensored = new EventDispatcher<ICensorBackend, ImageCensorResponse>();
    _onUpdate = new SimpleEventDispatcher<ActionPayload>();

    /**
     *
     */
    constructor(requestId?: string, host?: string) {
        this.host = host ?? '//localhost:2382';
        this.requestId = requestId;
    }

    async check(host?: string): Promise<ConnectionStatus> {
        const targetHost = host ?? this.host;
        var result = await fetch(targetHost + (targetHost.endsWith('/') ? '' : '/') + "info");
        if (result.status >= 400) {
            return {available: false, name: 'CensorCore'}
        } else {
            var json = await result.json();
            return {available: true, version: json["version"], name: 'CensorCore'};
        }
    }

    async cancelRequests(request: CancelRequest): Promise<void> {
        
    }

    requestId?: string | undefined;
    async censorImage(request: ImageCensorRequest): Promise<ImageCensorResponse | undefined> {
        const targetUrl = this.host + (this.host.endsWith('/') ? '' : '/') + "censorImage?returnEncoded=true"
        if (request.url) {
            const data = request.url.startsWith('data:') 
                ? { imageDataUrl: request.url, censorOptions: toNudeNet(request.preferences)}
                : { imageUrl: request.url, censorOptions: toNudeNet(request.preferences) };

            const result = await fetch(targetUrl, {
                method: 'POST', // or 'PUT'
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
                });
            if (result.status === 200) {
                var resultJson = await result.json();
                return {
                    id: request.id,
                    srcId: request.srcId?.toString(),
                    url: resultJson.imageUrl,
                    responseData: {}
                };
            }
        }
        return undefined;
    }
    get onImageCensored(): IEvent<ICensorBackend, ImageCensorResponse> {
        return this._onImageCensored.asEvent();
    }
    getRemotePreferences(): Promise<Partial<IPreferences|undefined>> {
        return Promise.resolve({});
    }
    get onReceivePreferences(): IEvent<ICensorBackend, Partial<IPreferences>> {
        return this._onFetchPreferences.asEvent();
    }
    get onUpdate() {
        return this._onUpdate.asEvent();
    }
    async updateRemotePreferences(preferences: IPreferences): Promise<boolean> {
        return false;
    }
    getStatistics(): Promise<StatisticsData | undefined> {
        return Promise.resolve(undefined);
    }

    async resetStatistics(): Promise<boolean> {
        return false;
    }


    getAvailableAssets(assetType: AssetType): Promise<string[] | undefined> {
        return Promise.resolve(undefined);
    }

    

}