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
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const Constants_1 = require("../../Constants");
class JSONDataHandler {
    constructor(file) {
        this.file = file;
        this.dataFolder = path_1.default.join(Constants_1.SRC_DIR, "..", 'data');
        this.init();
    }
    init() {
        if (!fs_1.default.existsSync(this.dataFolder))
            fs_1.default.mkdirSync(this.dataFolder);
        const fullPath = path_1.default.join(this.dataFolder, this.file);
        if (fs_1.default.existsSync(fullPath))
            return;
        fs_1.default.writeFileSync(fullPath, JSON.stringify({}));
    }
    write(file, data) {
        return __awaiter(this, void 0, void 0, function* () {
            fs_1.default.writeFileSync(path_1.default.join(this.dataFolder, file), JSON.stringify(data));
        });
    }
    read(file) {
        file = path_1.default.join(this.dataFolder, file);
        return JSON.parse(fs_1.default.readFileSync(file, 'utf8'));
    }
    overwrite(serverId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const file = yield this.read(this.file);
            file[serverId] = data;
            yield this.write(this.file, file);
        });
    }
    getAllOfServer(serverId) {
        var _a;
        const file = this.read(this.file);
        return (_a = file[serverId]) !== null && _a !== void 0 ? _a : {};
    }
    getAll() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.read(this.file);
        });
    }
    overwriteAll(data) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.write(this.file, data);
        });
    }
}
exports.default = JSONDataHandler;
