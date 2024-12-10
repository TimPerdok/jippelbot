import Ping from "./commands/Ping"
import Summon from "./commands/Summon"
import Release from "./commands/Release"
import Subscribe from "./commands/Subscribe"
import ReleaseMonth from "./commands/Releasemonth"
import SubscribeId from "./commands/SubscribeId"
import Unsubscribe from "./commands/Unsubscribe"
import Wanneerbenikgejoined from "./commands/Wanneerbenikgejoined"
import path from 'path'
import os from 'os'
import TTS from "./commands/TTS"

export const SRC_DIR = __dirname

export const TEMP_FOLDER = path.join(os.tmpdir(), 'jippelbot');

export const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "Oktober", "November", "December"];


export const COMMANDS = [
    new Ping(),
    new Release(),
    new ReleaseMonth(),
    new Subscribe(),
    new SubscribeId(),
    new Summon(),
    new TTS(),
    new Unsubscribe(),
    new Wanneerbenikgejoined(),
]