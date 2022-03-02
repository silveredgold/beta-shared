

import Sockette from "sockette";
import { EventDispatcher } from "ste-events";

export interface EventPayload {
    msg: string;
    [x: string]: unknown;
}

export abstract class WebSocketTransportClient {

    protected _requestId?: string;
    private host: string;
    /**
     *
     */
    protected constructor(requestId?: string, host?: string) {
        this.host = host ?? WebSocketTransportClient.defaultHost;
        this.webSocket = this.connectTo(this.host);
        this._requestId = requestId;
    }

    private messageQueue: any[] = [];

    private webSocket?: Sockette;

    static defaultHost = "ws://localhost:8090/ws"

    sendObj = (message: object, callback?: () => any | void) => {
        this.send(JSON.stringify(message), callback);
    }

    protected send = (message: string, callback?: any) => {
        //sockette means the socket is never not ready
        // that doesn't mean it can't error out though
        try {
            this.webSocket?.send(message)
            if (typeof callback !== 'undefined') {
                callback();
            }
        } catch {
            this.messageQueue.push(message);
        }
    };

    _onPublishMessage = new EventDispatcher<WebSocketTransportClient, EventPayload>();

    get onPublishMessage() {
        return this._onPublishMessage.asEvent();
    }


    public get ready(): boolean {
        // return this.webSocket?.readyState === 1;
        return true;
    }


    private connectTo = (host?: string): Sockette | undefined => {
        host ??= WebSocketTransportClient.defaultHost;
        try {
            const onOpen = () => {
                while (this.messageQueue.length > 0) {
                    webSocket.send(this.messageQueue.pop());
                }
            };
            const onClose = (e): any => {
                if (e.code !== 4999 && e.code !== 1000) {
                    debugger;
                    console.error('Socket is closed.', e.code, e.reason, e.wasClean);
                    if (!this._requestId) {
                        this._onPublishMessage.dispatch(this, { msg: 'socketClosed' });
                    }
                }
            };
            const onError = function (ev) {
                console.error('Socket encountered error: Closing socket');
            };
            const onMessage = (event) => {
                const response = JSON.parse(event.data);
                this.processServerMessage(response)?.then(() => {
                    if (this._requestId) {
                        webSocket.close(1000);
                    }
                });
            };
            const webSocket = new Sockette(host, {
                timeout: 60,
                maxAttempts: 10,
                onopen: onOpen,
                onmessage: onMessage,
                onreconnect: (e) => {
                    console.warn('reconnecting socket!');
                    this._onPublishMessage.dispatch(this, { msg: 'socketReconnect' });
                },
                onmaximum: (e) => console.error('Socket reconnection failed!', e),
                onclose: onClose,
                onerror: onError
            });
            return webSocket;
        } catch (e: any) {
            console.warn("Failed to connect to WebSocket! Cannot connect to the target endpoint.", e.toString(), e);
        }
    }

    abstract processServerMessage: (arg0: any) => Promise<any>;

    close = () => {
        this.webSocket?.close(1000);
    }
}