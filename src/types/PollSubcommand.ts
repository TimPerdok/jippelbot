import Subcommand from "../classes/Subcommand";
import PollCarrier from "../interfaces/PollCarrier";

export type PollSubcommand = (Subcommand & PollCarrier)