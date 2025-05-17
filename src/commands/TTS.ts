import { AudioPlayerStatus, createAudioPlayer, createAudioResource, joinVoiceChannel, VoiceConnection } from "@discordjs/voice";
import { ChannelType, ChatInputCommandInteraction, GuildChannel, GuildMember, SlashCommandBuilder, VoiceChannel } from "discord.js";
import fs from 'fs';
import gTTS from "gtts";
import path from 'path';
import Command from "../classes/Command";
import { doWithLock } from "../classes/Lock";
import { Locks, TEMP_FOLDER } from "../Constants";

const languages = {
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

export default class TTS extends Command {

    get data(): SlashCommandBuilder {
        const builder = new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addStringOption(option => option.setName("message").setDescription("Een custom bericht dat je wilt meesturen").setRequired(true))
            .addStringOption(option => option.setName("language")
                .setDescription("De taal waarin het bericht moet worden voorgelezen. Standaard is Nederlands")
                .setRequired(false)
                .setChoices(Object.entries(languages).map(([key, value]) => ({ name: value, value: key })).slice(0, 25))
            );
        return builder as SlashCommandBuilder;
    }

    constructor() {
        super("tts", "Verstuur een TTS bericht naar de voice channel waar je in zit.");
    }

    async onCommand(interaction: ChatInputCommandInteraction) {
        const message = interaction.options.getString("message")?.substring(0, 300) ?? "";
        const language = interaction.options.getString("language") ?? "nl";
        const channels = (await interaction.guild?.channels.fetch())
        if (!channels) return;
        const sender = interaction.member as GuildMember;
        const channel: VoiceChannel = channels.find(channel => channel?.type === ChannelType.GuildVoice && channel.members.has(sender.id)) as VoiceChannel;
        if (!channel) return await interaction.reply({ content: "Je moet in een voice channel zitten om dit commando te gebruiken.", ephemeral: true });
        doWithLock(Locks.VoiceLock, () => this.summon(channel, message, language));
        await interaction.reply({ content: `Je hebt de volgende TTS verstuurd: ${message}`, ephemeral: true });
    }

    async summon(channel: GuildChannel, message: string, language: string = "nl") {
        const tts = new gTTS(message, language);
        await new Promise<void>((resolve) => {
            const vc: VoiceConnection = joinVoiceChannel({ channelId: channel.id, guildId: channel.guild.id, adapterCreator: channel.guild.voiceAdapterCreator });
            const tmpFile = path.join(TEMP_FOLDER, 'gtts.mp3');
            if (fs.existsSync(tmpFile)) fs.rmSync(tmpFile);
            tts.save(tmpFile, (err) => {
                if (err) return resolve();
                const player = createAudioPlayer();
                const resource = createAudioResource(fs.createReadStream(tmpFile));
                player.play(resource);
                vc.subscribe(player);

                player.on(AudioPlayerStatus.Idle, () => {
                    vc.disconnect();
                    resolve();
                });

                player.on('error', error => {
                    console.error('Error:', error);
                    vc.disconnect();
                    resolve();
                });
            });
        });

    }


}
