
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
