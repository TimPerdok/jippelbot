"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ReactiveList extends Array {
    constructor(callback) {
        super();
        this.callback = callback;
    }
    push(...items) {
        super.push(...items);
        this.callback(this);
        return items.length;
    }
}
exports.default = ReactiveList;
