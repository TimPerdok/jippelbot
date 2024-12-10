"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
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
        fs_1.default.writeFileSync(path_1.default.join(this.dataFolder, file), JSON.stringify(data));
    }
    read(file) {
        file = path_1.default.join(this.dataFolder, file);
        return JSON.parse(fs_1.default.readFileSync(file, 'utf8'));
    }
    overwrite(serverId, data) {
        const file = this.read(this.file);
        file[serverId] = data;
        this.write(this.file, file);
    }
    getAllOfServer(serverId) {
        const file = this.read(this.file);
        return file[serverId] ?? {};
    }
    getAll() {
        return this.read(this.file);
    }
    overwriteAll(data) {
        this.write(this.file, data);
    }
}
exports.default = JSONDataHandler;
