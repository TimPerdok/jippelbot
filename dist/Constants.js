"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.COMMANDS = exports.TEMP_FOLDER = exports.SRC_DIR = void 0;
const EnableDallE_1 = __importDefault(require("./commands/EnableDallE"));
const Ping_1 = __importDefault(require("./commands/Ping"));
const Summon_1 = __importDefault(require("./commands/Summon"));
const Imagine_1 = __importDefault(require("./commands/Imagine"));
const Release_1 = __importDefault(require("./commands/Release"));
const Subscribe_1 = __importDefault(require("./commands/Subscribe"));
const Releasemonth_1 = __importDefault(require("./commands/Releasemonth"));
const SubscribeId_1 = __importDefault(require("./commands/SubscribeId"));
const Unsubscribe_1 = __importDefault(require("./commands/Unsubscribe"));
const Vote_1 = __importDefault(require("./commands/Vote"));
const Wanneerbenikgejoined_1 = __importDefault(require("./commands/Wanneerbenikgejoined"));
const path_1 = __importDefault(require("path"));
const os_1 = __importDefault(require("os"));
exports.SRC_DIR = __dirname;
exports.TEMP_FOLDER = path_1.default.join(os_1.default.tmpdir(), 'jippelbot');
exports.COMMANDS = [
    new EnableDallE_1.default(),
    new Imagine_1.default(),
    new Ping_1.default(),
    new Release_1.default(),
    new Releasemonth_1.default(),
    new Subscribe_1.default(),
    new SubscribeId_1.default(),
    new Summon_1.default(),
    new Unsubscribe_1.default(),
    new Vote_1.default(),
    new Wanneerbenikgejoined_1.default(),
];
