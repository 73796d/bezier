import EventListener from "./eventlistener";

export class Global {
    private static _instance_: Global = new Global();
    private static _eventListener_: EventListener = new EventListener();
    private constructor() { }

    public static getInstance(): Global {
        return Global._instance_;
    }

    public static set eventListener(v: EventListener) {
        this._eventListener_ = v;
    }

    public static get eventListener(): EventListener {
        return this._eventListener_;
    }
}
