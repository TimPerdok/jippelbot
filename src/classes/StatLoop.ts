import { Client, Interaction, PermissionOverwriteManager, ClientVoiceManager, Collection, ChannelType, TextChannel } from "discord.js";
import { entersState, createAudioResource,createAudioPlayer,StreamType,joinVoiceChannel, EndBehavior, VoiceConnectionStatus, EndBehaviorType, VoiceReceiver } from "@discordjs/voice";	
import Command from "../classes/Command";
import { OuterExpressionKinds, parseIsolatedEntityName } from "typescript";
import { createWriteStream } from "fs";
import { pipeline } from "stream";
import prism from "prism-media";
import fs from "fs";


//Create class for StatLoop
export default class StatLoop {

    //Create function for StatLoop
    static start(client: Client) {

        //Gets all text channels
        const textChannels = client.channels.cache.filter(channel => channel.type === ChannelType.GuildText)
        
        const hoi = [...textChannels.values()].forEach((channel) => {
            channel = channel as TextChannel;
        });

        client.on('messageCreate', (message) => {

                console.log(message.author.username + ": " + message.content);

                const banaan = message.channel as TextChannel;
                console.log(banaan.name);
        });
    }
}
