import { SocketEvent } from "./events";
import { ActionPayload, ICensorBackend } from "..";
import { IPreferences, toRaw } from "#/preferences";
import { EventDispatcher, IEvent, SimpleEventDispatcher } from "strongly-typed-events";
import { ImageCensorRequest, ImageCensorResponse, StatisticsData, AssetType, CancelRequest } from "..";
import { WebSocketTransportClient } from "../webSocketTransportClient";
import { log } from "missionlog";

export class BetaSafetyBackendClient extends WebSocketTransportClient implements ICensorBackend {
    
    
    private _version : string = "0.0.0";
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
    constructor(socketEvents: SocketEvent<any>[], requestId?: string, host?: string) {
        super(requestId, host);
        this.messageEvents.push(...socketEvents);
    }

    async cancelRequests(request: CancelRequest): Promise<void> {
        if (request.srcId) {
            this.sendObj({
                version: this.version,
                msg: "cancelRequests",
                tabid: +request.srcId
            });
        }
    }

    processServerMessage = async (response: any) => {
        const event = this.messageEvents.find(evt => evt.event === response['requestType']);
        if (event?.handler !== undefined) {
            // dbg('running handler for server message', response.requestType, response);
            return await event.handler(response, this);
        } else {
            log.warn('socket', 'received unmatched server message!', response);
        }
    }

    
    private _messageEvents : SocketEvent<any>[] = [];
    public get messageEvents() : SocketEvent<any>[] {
        return this._messageEvents;
    }

    registerEvent(event: SocketEvent<any>) {
        this._messageEvents.push(event);
    }

    requestId?: string | undefined;
    async censorImage(request: ImageCensorRequest): Promise<ImageCensorResponse | undefined> {
        if (request.requestData) {
            this.sendObj({
                version: this._version,
                msg: request.force ? "redoCensor" : "censorImage",
                url: request.url,
                tabid: +request.srcId!,
                id: request.id,
                priority: request.requestData["priority"] ?? 1,
                preferences: toRaw(request.preferences),
                type: "normal", // I don't understand why this would be needed
                domain: request.context.domain
            });
        }
        return undefined;
    }
    get onImageCensored(): IEvent<ICensorBackend, ImageCensorResponse> {
        return this._onImageCensored.asEvent();
    }
    getRemotePreferences(): Promise<Partial<IPreferences|undefined>> {
        return new Promise<Partial<IPreferences|undefined>>((resolve, reject) => {
            const unsub = this._onFetchPreferences.subscribe((sender, payload) => {
                if (payload) {
                    unsub();
                    resolve(payload);
                } else {
                    reject('no preferences received!');
                }
            });
            this.sendObj({msg: 'getUserPreferences', version: this._version});
        });
    }
    get onReceivePreferences(): IEvent<ICensorBackend, Partial<IPreferences>> {
        return this._onFetchPreferences.asEvent();
    }
    get onUpdate() {
        return this._onUpdate.asEvent();
    }
    async updateRemotePreferences(preferences: IPreferences): Promise<boolean> {
        this.sendObj({
            version: this._version,
            msg: "updatePreferences",
            preferences
        });
        return true;
    }
    getStatistics(): Promise<StatisticsData | undefined> {
        return new Promise<StatisticsData>((resolve, reject) => {
            this._onReceiveStatistics.one((sender, args) => {
                if (args) {
                    resolve(args)
                } else {
                    reject('but how');
                }
            });
            this.sendObj({msg: 'getStatistics', version: this._version});
        });
    }

    async resetStatistics(): Promise<boolean> {
        this.sendObj({
            version: this._version,
            msg: "resetStatistics"
        });
        return true;
    }


    getAvailableAssets(assetType: AssetType): Promise<string[] | undefined> {
        switch (assetType) {
            case 'stickers':
                return new Promise<string[]>((resolve, reject) => {
                    const unsub = this._onUpdate.subscribe(payload => {
                        if (payload && payload.entityType == 'stickers' && payload.eventData) {
                            unsub();
                            resolve(payload.eventData['categories']);
                        } else {
                            reject('but how');
                        }
                    })
                    this.sendObj({msg: 'getStatistics', version: this._version});
                });
            default:
                return Promise.resolve(undefined);
        }
    }

    

}