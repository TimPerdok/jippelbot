
import { Message, MessageCreateOptions, MessageEditOptions, MessagePayload } from "discord.js";

export default abstract class MessageUpdater {
   

    constructor() {
    }

    async update() {
        (await this.getMessage())?.edit(await this.getContent());
    }

    abstract getMessage(): Promise<Message | undefined>

    abstract getContent(): Promise<MessageEditOptions | MessagePayload | string>


}
