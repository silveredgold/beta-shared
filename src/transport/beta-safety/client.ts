import { ActionPayload, ConnectionStatus, ICensorBackend } from "..";
import { IPreferences } from "../../preferences";
import { toBetaSafety } from "../../preferences/beta-safety";
import { EventDispatcher } from "@silveredgold/ste-events";
import type {IEvent} from "@silveredgold/ste-events";
import { SimpleEventDispatcher } from "@silveredgold/ste-simple-events";
import { ImageCensorRequest, ImageCensorResponse, StatisticsData, AssetType, CancelRequest } from "..";
import { WebSocketTransportClient } from "../webSocketTransportClient";
import { log } from "missionlog";
import Sockette from "sockette";

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

    async check(host?: string): Promise<ConnectionStatus> {
        const targetHost = host ?? this.host;
        try {
            var result = await new Promise<ConnectionStatus>((resolve, reject) => {
                var status: ConnectionStatus = { available: false, name: 'Beta Safety' };
                try {
                    const onOpen = () => {
                        status.available = true;
                        resolve(status);
                    };
                    const onClose = (e): any => {
                        if (e.code !== 4999 && e.code !== 1000) {
                            log.warn('socket', 'Connection check socket is closed.', e.code, e.reason, e.wasClean);
                        }
                    };
                    const onMax = (e) => {
                        log.error('socket', 'Socket reconnection failed!', e)
                        reject();
                    }
                    const onError = function (ev) {
                        log.error('socket', 'Connection check socket errored out!', ev);
                    };
                    const webSocket = new Sockette(targetHost, {
                        timeout: 10,
                        maxAttempts: 3,
                        onopen: onOpen,
                        onreconnect: (e) => {
                            log.warn('socket', 'reconnecting socket!');
                            this._onPublishMessage.dispatch(this, { msg: 'socketReconnect' });
                        },
                        onmaximum: onMax,
                        onclose: onClose,
                        onerror: onError
                    });
                } catch (e: any) {
                    log.warn('socket', "Failed to check status via WebSocket! Cannot connect to the target endpoint.", e.toString(), e);
                    reject(e);
                }
            });
            return result;
        } catch {
            return {available: false, name: 'Beta Safety'}
        }
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
            // if (request.url.startsWith('data:')) {
            //     try {
            //     const orig = request.url;
            //     const dataType = request.url.split(';')[0].split(':')[1];
            //     request.url = await scrambleImage(request.url, dataType);
            //     console.log('scrambled encoded data URI', orig.slice(24,74), request.url.slice(24,74));
            //     } catch {}
            // }
            // this is just too unreliable: you really need to fuck with the image to make the encoded data
            // different enough not to trip up the server.
            const url = request.url.startsWith('data:') && request.srcUrl !== undefined
                ? request.srcUrl
                : request.url;
            this.sendObj({
                version: this._version,
                msg: request.force ? "redoCensor" : "censorImage",
                url: url,
                tabid: +request.srcId!,
                id: request.id,
                priority: request.requestData["priority"] ?? 1,
                preferences: toBetaSafety(request.preferences),
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
            const timeout = setTimeout(() => {
                reject('timeout!');
            }, 5000)
            const unsub = this._onFetchPreferences.subscribe((sender, payload) => {
                if (payload) {
                    unsub();
                    clearTimeout(timeout);
                    resolve(payload);
                } else {
                    reject('no preferences received!');
                }
            });
            this.sendObj({msg: 'getUserPreferences', version: this._version});
        });
    }
    // get onUpdate() {
    //     return this._onUpdate.asEvent();
    // }
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
            const timeout = setTimeout(() => {
                reject('timeout!');
            }, 5000);
            this._onReceiveStatistics.one((sender, args) => {
                if (args) {
                    clearTimeout(timeout);
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

export type SocketEvent<Type> = {
    event: string;
    handler: (message: any, sender: BetaSafetyBackendClient) => Promise<Type>
}