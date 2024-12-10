"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.COMMANDS = exports.MONTHS = exports.TEMP_FOLDER = exports.SRC_DIR = void 0;
const Ping_1 = __importDefault(require("./commands/Ping"));
const Summon_1 = __importDefault(require("./commands/Summon"));
const Release_1 = __importDefault(require("./commands/Release"));
const Subscribe_1 = __importDefault(require("./commands/Subscribe"));
const Releasemonth_1 = __importDefault(require("./commands/Releasemonth"));
const SubscribeId_1 = __importDefault(require("./commands/SubscribeId"));
const Unsubscribe_1 = __importDefault(require("./commands/Unsubscribe"));
const Wanneerbenikgejoined_1 = __importDefault(require("./commands/Wanneerbenikgejoined"));
const path_1 = __importDefault(require("path"));
const os_1 = __importDefault(require("os"));
const TTS_1 = __importDefault(require("./commands/TTS"));
exports.SRC_DIR = __dirname;
exports.TEMP_FOLDER = path_1.default.join(os_1.default.tmpdir(), 'jippelbot');
exports.MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "Oktober", "November", "December"];
exports.COMMANDS = [
    new Ping_1.default(),
    new Release_1.default(),
    new Releasemonth_1.default(),
    new Subscribe_1.default(),
    new SubscribeId_1.default(),
    new Summon_1.default(),
    new TTS_1.default(),
    new Unsubscribe_1.default(),
    new Wanneerbenikgejoined_1.default(),
];
