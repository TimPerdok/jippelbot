import lzString from "lz-string";
import MessageUpdater from "../schedulers/messageupdaters/MessageUpdater";

export default class ReactiveList<T> extends Array {
    callback: (list: ReactiveList<T>) => void;

    constructor(callback: (list: ReactiveList<T>) => void) {
        super();
        this.callback = callback;
    }
    
    push(...items: T[]) {
        super.push(...items);
        this.callback(this);
        return items.length;
    }
}
