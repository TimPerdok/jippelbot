import { Client, Interaction, PermissionOverwriteManager, ClientVoiceManager, Collection } from "discord.js";
import { entersState, createAudioResource,createAudioPlayer,StreamType,joinVoiceChannel, EndBehavior, VoiceConnectionStatus, EndBehaviorType, VoiceReceiver } from "@discordjs/voice";	
import Command from "../classes/Command";
import { OuterExpressionKinds, parseIsolatedEntityName } from "typescript";
import { createWriteStream } from "fs";
import { pipeline } from "stream";
import prism from "prism-media";
import fs from "fs";

function calcrms_lin(buffer){

    var rms = 0;

    for(var bufferIndex = 0; bufferIndex < buffer.length; bufferIndex++){
        rms+= buffer[bufferIndex]*buffer[bufferIndex];
    }

    rms /= buffer.length;
    rms = Math.sqrt(rms);

    return rms;

}

//Calculate RMS of block db
function calcrms_db(buffer){
    return 20*Math.log10(calcrms_lin(buffer));
}


export default class Start extends Command {
    

    constructor() {
        super("start", "gaat je niks aan")	
    }

    

    async onReply(client: Client, interaction: any) {
        
        
        const connection = await joinVoiceChannel({
            channelId: interaction.member.voice.channelId,
            guildId: interaction.guildId,
            adapterCreator: interaction.guild.voiceAdapterCreator,
            selfDeaf: false,
        });
        

        connection.receiver.speaking.on('start', userId => {
            if (!connection.receiver.subscriptions.has(userId)){
                const opusStream = connection.receiver.subscribe(userId, {
                    end: {
                        behavior: EndBehaviorType.Manual,
                    },
                });

                //decode opus stream to pcm
                const decoder = new prism.opus.Decoder({
                    rate: 48000,
                    channels: 2,
                    frameSize: 960,
                });

                const pcmStream = opusStream.pipe(decoder);

                pcmStream.on('data', (chunk) => {
                    console.log(calcrms_db(chunk));
                });


            }
        });





        connection.receiver.speaking.on('end', userId => {
            connection.receiver.subscriptions.delete(userId);
        });
	}
}