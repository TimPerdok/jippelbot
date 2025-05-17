import { AudioPlayerStatus, createAudioPlayer, createAudioResource, joinVoiceChannel, VoiceConnection } from "@discordjs/voice";
import { ChannelType, ChatInputCommandInteraction, GuildChannel, GuildMember, SlashCommandBuilder, VoiceChannel } from "discord.js";
import fs from 'fs';
import gTTS from "gtts";
import path from 'path';
import Command from "../classes/Command";
import { doWithLock } from "../classes/Lock";
import { LANGUAGES, Locks, TEMP_FOLDER } from "../Constants";

export default class Message extends Command {

    get data(): SlashCommandBuilder {
        const builder = new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addUserOption(option => option.setName("user").setDescription("De persoon die je wilt berichten").setRequired(true))
            .addStringOption(option => option.setName("message").setDescription("Het bericht dat je wilt voorgelezen wilt laten worden").setRequired(true))
            .addStringOption(option => option.setName("language")
                    .setDescription("De taal waarin het bericht moet worden voorgelezen. Standaard is Nederlands")
                    .setRequired(false)
                    .setChoices(Object.entries(LANGUAGES).map(([key, value]) => ({ name: value, value: key })).slice(0, 25))
                );
        return builder as SlashCommandBuilder;
    }

    constructor() {
        super("message", "Stuur iemand een TTS message");
    }

    async onCommand(interaction: ChatInputCommandInteraction) {
        const language = interaction.options.getString("language") ?? "nl";
        const user = interaction.options.getUser("user", true);
        if (user.bot) return await interaction.reply({ content: "Je kan geen bots summonen.", ephemeral: true });
        const customMessage = interaction.options.getString("message", true)?.substring(0, 300);
        const channels = (await interaction.guild?.channels.fetch())
        if (!channels) return;
        const channel: VoiceChannel = channels.find(channel => channel?.type === ChannelType.GuildVoice && channel.members.has(user.id)) as VoiceChannel;
        const sender: GuildMember = interaction.member as GuildMember;
        const receiver: GuildMember = await interaction.guild?.members.fetch(user.id) as GuildMember;

        if (!channel) return await interaction.reply({ content: `${receiver.displayName} zit niet in een kanaal momenteel.`, ephemeral: true });
        
        doWithLock(Locks.VoiceLock, () => this.sendCustomMessage(receiver, sender, channel, customMessage, language));
        await interaction.reply({ content: `Je hebt naar ${user.displayName} een TTS verstuurd.`, ephemeral: true });
    }

    async sendCustomMessage(receiver: GuildMember, sender: GuildMember, channel: GuildChannel, customMessage: string = "", language = "nl") {
        const tts = new gTTS(`Bericht van ${sender.displayName} voor ${receiver.displayName}. ${customMessage}`, language);
        await new Promise<void>((resolve) => {
            const vc: VoiceConnection = joinVoiceChannel({
                channelId: channel.id,
                guildId: channel.guild.id,
                adapterCreator: channel.guild.voiceAdapterCreator
            });
            const tmpFile = path.join(TEMP_FOLDER, 'remote-gtts.mp3');
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
