import EnableDallE from "./commands/EnableDallE"
import Ping from "./commands/Ping"
import Summon from "./commands/Summon"
import Imagine from "./commands/Imagine"
import Release from "./commands/Release"
import Subscribe from "./commands/Subscribe"
import ReleaseMonth from "./commands/Releasemonth"
import SubscribeId from "./commands/SubscribeId"
import Unsubscribe from "./commands/Unsubscribe"
import Vote from "./commands/Vote"
import Wanneerbenikgejoined from "./commands/Wanneerbenikgejoined"
import path from 'path'
import os from 'os'
import TTS from "./commands/TTS"

export const SRC_DIR = __dirname

export const TEMP_FOLDER = path.join(os.tmpdir(), 'jippelbot');

export const COMMANDS = [
    new EnableDallE(),
    new Imagine(),
    new Ping(),
    new Release(),
    new ReleaseMonth(),
    new Subscribe(),
    new SubscribeId(),
    new Summon(),
    new TTS(),
    new Unsubscribe(),
    new Vote(),
    new Wanneerbenikgejoined(),
]