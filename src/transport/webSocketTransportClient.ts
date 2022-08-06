

import { log } from "missionlog";
import Sockette from "sockette";
import { EventDispatcher } from "strongly-typed-events";

export interface EventPayload {
    msg: string;
    [x: string]: unknown;
}

/**
 * A generic transport client for transports that use WebSockets to communicate with 
 * a backend.
 */
export abstract class WebSocketTransportClient {

    protected _requestId?: string;
    protected host: string;
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

    /**
     * Sends an object to the server using the current socket connection.
     * @param message The object to serialize and send.
     * @param callback A callback to run after sending.
     */
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

    /**
     * Event that is dispatched whenever a socket event occurs.
     */
    get onPublishMessage() {
        return this._onPublishMessage.asEvent();
    }

    /**
     * Returns whether the current transport is ready for messages.
     */
    public get ready(): boolean {
        // return this.webSocket?.readyState === 1;
        return true;
    }

    protected connectTo = (host?: string): Sockette | undefined => {
        host ??= WebSocketTransportClient.defaultHost;
        try {
            const onOpen = () => {
                while (this.messageQueue.length > 0) {
                    webSocket.send(this.messageQueue.pop());
                }
            };
            const onClose = (e): any => {
                if (e.code !== 4999 && e.code !== 1000) {
                    log.error('socket', 'Socket is closed.', e.code, e.reason, e.wasClean);
                    if (!this._requestId) {
                        this._onPublishMessage.dispatch(this, { msg: 'socketClosed' });
                    }
                }
            };
            const onError = function (ev) {
                log.error('socket', 'Socket encountered error: Closing socket');
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
                    log.warn('socket', 'reconnecting socket!');
                    this._onPublishMessage.dispatch(this, { msg: 'socketReconnect' });
                },
                onmaximum: (e) => log.error('socket', 'Socket reconnection failed!', e),
                onclose: onClose,
                onerror: onError
            });
            return webSocket;
        } catch (e: any) {
            log.warn('socket', "Failed to connect to WebSocket! Cannot connect to the target endpoint.", e.toString(), e);
        }
    }

    abstract processServerMessage: (arg0: any) => Promise<any>;

    /**
     * Closes the current socket transport.
     */
    close = () => {
        this.webSocket?.close(1000);
    }
}