import Subcommand from "../classes/Subcommand";
import PollCarrier from "../interfaces/PollSubcommand";

export type PollSubcommand = (Subcommand & PollCarrier)