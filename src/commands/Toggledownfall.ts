import { AudioPlayerStatus, createAudioPlayer, createAudioResource, joinVoiceChannel, VoiceConnection } from "@discordjs/voice";
import { ChannelType, ChatInputCommandInteraction, GuildChannel, GuildMember, SlashCommandBuilder, VoiceChannel } from "discord.js";
import fs from 'fs';
import path from 'path';
import Command from "../classes/Command";
import { doWithLock } from "../classes/Lock";
import { LANGUAGES, Locks, TEMP_FOLDER } from "../Constants";

const AUDIO_FILES = {
    rain: "Rain.mp3",
    thunder: "Rain and Thunder.mp3",
    artillery: "Rain and Artillery.mp3"
};

let currentConnection: VoiceConnection | null = null;
let currentChannelId: string | null = null;

export default class Toggledownfall extends Command {
    constructor() {
        super("toggledownfall", "Speel regen-achtige achtergrondgeluiden in een voicechannel");
    }

    get data(): SlashCommandBuilder {
        const builder = new SlashCommandBuilder()
            .setName("toggledownfall")
            .setDescription("Toggle rain sounds in your voice channel")
            .addStringOption(option =>
                option.setName("type")
                    .setDescription("The type of downfall")
                    .addChoices(
                        { name: "Rain", value: "rain" },
                        { name: "Rain and Thunder", value: "thunder" },
                        { name: "Rain and Artillery", value: "artillery" }
                    )
            );
        return builder as SlashCommandBuilder;
    }

    async onCommand(interaction: ChatInputCommandInteraction) {
        const member = interaction.member as GuildMember;
        const voiceChannel = member.voice.channel as VoiceChannel;

        if (!voiceChannel) {
            return await interaction.reply({ content: "Je moet in een voicechannel zitten om dit commando te gebruiken.", ephemeral: true });
        }

        const type = interaction.options.getString("type") ?? null;

        await doWithLock(Locks.VoiceLock, async () => {
            if (!currentConnection || currentChannelId !== voiceChannel.id) {
                const soundType = type ?? "rain";
                await this.playInChannel(voiceChannel, soundType);
                await interaction.reply({ content: `Speelt: ${this.getDisplayName(soundType)}.`, ephemeral: true });
            } else if (!type) {
                currentConnection.disconnect();
                currentConnection = null;
                currentChannelId = null;
                await interaction.reply({ content: "Regen gestopt en voicechannel verlaten.", ephemeral: true });
            } else {
                await this.playSound(type);
                await interaction.reply({ content: `Gewisseld naar: ${this.getDisplayName(type)}.`, ephemeral: true });
            }
        });
    }

        private async playInChannel(channel: VoiceChannel, type: string) {
        if (currentConnection) currentConnection.destroy();

        const connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator
        });

        currentConnection = connection;
        currentChannelId = channel.id;

        await this.playSound(type);
    }

        private async playSound(type: string) {
        if (!currentConnection) return;

        const fileName = AUDIO_FILES[type as keyof typeof AUDIO_FILES];
        const filePath = path.join(__dirname, "..", "..", "sounds", fileName);

        if (!fs.existsSync(filePath)) {
            throw new Error(`Bestand niet gevonden voor type: ${type}`);
        }

        const player = createAudioPlayer();
        const resource = createAudioResource(fs.createReadStream(filePath), {inlineVolume: true});
        resource.volume?.setVolume(0.5); // Set volume to 50%
        player.play(resource);

        currentConnection.subscribe(player);

        player.on(AudioPlayerStatus.Idle, () => {
            // Loop if needed
            player.play(createAudioResource(fs.createReadStream(filePath)));
        });

        player.on('error', err => {
            console.error("Audio error:", err);
            currentConnection?.disconnect();
            currentConnection = null;
            currentChannelId = null;
        });
    }

        private getDisplayName(type: string): string {
        switch (type) {
            case "rain": return "Regen";
            case "thunder": return "Regen met onweer";
            case "artillery": return "Regen met artillerie";
            default: return type;
        }
    }
}
