"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.COMMANDS = exports.SRC_DIR = void 0;
const EnableDallE_1 = __importDefault(require("./commands/EnableDallE"));
const EnableDallE_2 = __importDefault(require("./commands/EnableDallE"));
const Imagine_1 = __importDefault(require("./commands/Imagine"));
const Imagine_2 = __importDefault(require("./commands/Imagine"));
const Release_1 = __importDefault(require("./commands/Release"));
const Release_2 = __importDefault(require("./commands/Release"));
const Releasemonth_1 = __importDefault(require("./commands/Releasemonth"));
const SubscribeId_1 = __importDefault(require("./commands/SubscribeId"));
const Unsubscribe_1 = __importDefault(require("./commands/Unsubscribe"));
const Vote_1 = __importDefault(require("./commands/Vote"));
const Wanneerbenikgejoined_1 = __importDefault(require("./commands/Wanneerbenikgejoined"));
exports.SRC_DIR = __dirname;
exports.COMMANDS = [
    new EnableDallE_1.default(),
    new Imagine_2.default(),
    new EnableDallE_2.default(),
    new Release_1.default(),
    new Releasemonth_1.default(),
    new Release_2.default(),
    new SubscribeId_1.default(),
    new Imagine_1.default(),
    new Unsubscribe_1.default(),
    new Vote_1.default(),
    new Wanneerbenikgejoined_1.default(),
];
