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
import Message from "./commands/Message"
import Toggledownfall from "./commands/Toggledownfall"

export const SRC_DIR = __dirname

export const TEMP_FOLDER = path.join(os.tmpdir(), 'jippelbot');

export const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "Oktober", "November", "December"];

export enum Locks {
    VoiceLock = "VoiceLock"
}


export const LANGUAGES = {
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
  }

export const COMMANDS = [
    new Ping(),
    new Release(),
    new ReleaseMonth(),
    new Subscribe(),
    new SubscribeId(),
    new Summon(),
    new Message(),
    new TTS(),
    new Unsubscribe(),
    new Wanneerbenikgejoined(),
    new Toggledownfall(),
]
