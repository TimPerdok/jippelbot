"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const JSONDataHandler_1 = __importDefault(require("./JSONDataHandler"));
class ListDataHandler extends JSONDataHandler_1.default {
    set(serverId, item) {
        return __awaiter(this, void 0, void 0, function* () {
            const list = this.getAllOfServer(serverId);
            const foundItem = list.find((i) => i.id === item.id);
            if (foundItem) {
                list[list.indexOf(foundItem)] = item;
                this.overwrite(serverId, list);
            }
            else
                this.add(serverId, item);
        });
    }
    remove(serverId, id) {
        return __awaiter(this, void 0, void 0, function* () {
            let list = yield this.getAllOfServer(serverId);
            list = list.filter((item) => item.id !== id);
            yield this.overwrite(serverId, list);
        });
    }
    add(serverId, item) {
        return __awaiter(this, void 0, void 0, function* () {
            let list = yield this.getAllOfServer(serverId);
            list.push(item);
            yield this.overwrite(serverId, list);
        });
    }
    getItem(serverId, id) {
        return __awaiter(this, void 0, void 0, function* () {
            const list = this.getAllOfServer(serverId);
            return list.find((item) => item.id === (id + ""));
        });
    }
    getAllOfServer(serverId) {
        var _a;
        const file = this.read(this.file);
        return (_a = file[serverId]) !== null && _a !== void 0 ? _a : [];
    }
}
exports.default = ListDataHandler;
