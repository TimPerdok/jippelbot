import EnableDallE from "./commands/EnableDallE"
import Ping from "./commands/EnableDallE"
import Summon from "./commands/Imagine"
import Imagine from "./commands/Imagine"
import Release from "./commands/Release"
import Subscribe from "./commands/Release"
import ReleaseMonth from "./commands/Releasemonth"
import SubscribeId from "./commands/SubscribeId"
import Unsubscribe from "./commands/Unsubscribe"
import Vote from "./commands/Vote"
import Wanneerbenikgejoined from "./commands/Wanneerbenikgejoined"

export const SRC_DIR = __dirname

export const COMMANDS = [
    new EnableDallE(),
    new Imagine(),
    new Ping(),
    new Release(),
    new ReleaseMonth(),
    new Subscribe(),
    new SubscribeId(),
    new Summon(),
    new Unsubscribe(),
    new Vote(),
    new Wanneerbenikgejoined(),
]