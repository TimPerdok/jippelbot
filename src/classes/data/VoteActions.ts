
import { ChannelType, TextChannel, VoiceChannel } from "discord.js"
import Sobject from "./Sobject"
import { PollChannelType } from "../../interfaces/PollSubcommand"

export enum VoteActions {
    ADDCHANNEL = "addchannel",
    REMOVECHANNEL = "removechannel",
    RENAMECHANNEL = "renamechannel",
    KICKUSER = "kickuser",
}

export type VoteEvent = {
    isYes: boolean,
}

export abstract class VoteAction {
    constructor(public action: VoteActions, public params: object, public question: string = "") {
    }


}

export class AddChannelAction extends VoteAction {

    constructor(public params: { channelType: PollChannelType, name: string }) {
        super(VoteActions.ADDCHANNEL, {
            channelType: params.channelType,
            name: params.name
        },
        `het ${params.channelType === "GUILD_TEXT" ? "tekstkanaal" : "spraakkanaal"} "${params.name}" toevoegen`)
    }
}




