"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.COMMANDS = exports.LANGUAGES = exports.Locks = exports.MONTHS = exports.TEMP_FOLDER = exports.SRC_DIR = void 0;
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
const Message_1 = __importDefault(require("./commands/Message"));
const Toggledownfall_1 = __importDefault(require("./commands/Toggledownfall"));
exports.SRC_DIR = __dirname;
exports.TEMP_FOLDER = path_1.default.join(os_1.default.tmpdir(), 'jippelbot');
exports.MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "Oktober", "November", "December"];
var Locks;
(function (Locks) {
    Locks["VoiceLock"] = "VoiceLock";
})(Locks || (exports.Locks = Locks = {}));
exports.LANGUAGES = {
    'af': 'Afrikaans',
    'ar': 'Arabic',
    'zh': 'Chinese',
    'da': 'Danish',
    'nl': 'Dutch',
    'en': 'English',
    'fi': 'Finnish',
    'fr': 'French',
    'de': 'German',
    'el': 'Greek',
    'hi': 'Hindi',
    'is': 'Icelandic',
    'it': 'Italian',
    'ja': 'Japanese',
    'ko': 'Korean',
    'no': 'Norwegian',
    'pl': 'Polish',
    'pt': 'Portuguese',
    'ru': 'Russian',
    'es': 'Spanish',
    'sv': 'Swedish',
    'th': 'Thai',
    'tr': 'Turkish',
    'vi': 'Vietnamese',
    'cy': 'Welsh'
};
exports.COMMANDS = [
    new Ping_1.default(),
    new Release_1.default(),
    new Releasemonth_1.default(),
    new Subscribe_1.default(),
    new SubscribeId_1.default(),
    new Summon_1.default(),
    new Message_1.default(),
    new TTS_1.default(),
    new Unsubscribe_1.default(),
    new Wanneerbenikgejoined_1.default(),
    new Toggledownfall_1.default(),
];
