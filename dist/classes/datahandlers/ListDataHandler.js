"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const JSONDataHandler_1 = __importDefault(require("./JSONDataHandler"));
class ListDataHandler extends JSONDataHandler_1.default {
    async set(serverId, item) {
        const list = this.getAllOfServer(serverId);
        const foundItem = list.find((i) => i.id === item.id);
        if (foundItem) {
            list[list.indexOf(foundItem)] = item;
            this.overwrite(serverId, list);
        }
        else
            this.add(serverId, item);
    }
    async remove(serverId, id) {
        let list = await this.getAllOfServer(serverId);
        list = list.filter((item) => item.id !== id);
        await this.overwrite(serverId, list);
    }
    async add(serverId, item) {
        let list = await this.getAllOfServer(serverId);
        list.push(item);
        await this.overwrite(serverId, list);
    }
    async getItem(serverId, id) {
        const list = this.getAllOfServer(serverId);
        return list.find((item) => item.id === id);
    }
    getAllOfServer(serverId) {
        const file = this.read(this.file);
        return file[serverId] ?? [];
    }
}
exports.default = ListDataHandler;
