import { AudioPlayerStatus, createAudioPlayer, createAudioResource, joinVoiceChannel, VoiceConnection } from "@discordjs/voice";
import { ChannelType, ChatInputCommandInteraction, GuildMember, SlashCommandBuilder, VoiceChannel } from "discord.js";
import fs from 'fs';
import path from 'path';
import Command from "../classes/Command";
import { SRC_DIR, TEMP_FOLDER } from "../Constants";
import gTTS from "gtts"
import { doWithLock } from "../classes/Lock";

export default class Summon extends Command {

    private summonAudio = path.join(SRC_DIR, "..", 'assets', 'audio', 'summon-full.mp3');

    get data(): SlashCommandBuilder {
        const builder = new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addUserOption(option => option.setName("user").setDescription("De persoon die je wilt summonen").setRequired(true))
            .addStringOption(option => option.setName("message").setDescription("Een custom bericht dat je wilt meesturen"));
        return builder as SlashCommandBuilder;
    }

    constructor() {
        super("summon", "Summon iemand");
    }


    async onCommand(interaction: ChatInputCommandInteraction) {
        const user = interaction.options.getUser("user", true);
        if (user.bot) return await interaction.reply({ content: "Je kan geen bots summonen.", ephemeral: true });
        const customMessage = interaction.options.getString("message")?.substring(0, 300) ?? "";
        const channels = (await interaction.guild?.channels.fetch())
        if (!channels) return;
        const channel: VoiceChannel = channels.find(channel => channel?.type === ChannelType.GuildVoice && channel.members.has(user.id)) as VoiceChannel;
        const sender: GuildMember = interaction.member as GuildMember;
        const receiver: GuildMember = await interaction.guild?.members.fetch(user.id) as GuildMember;
        
        if (!channel) return await user.send(`Je wordt gesummoned door ${sender.displayName} in ${receiver.displayName}. Klik <#${interaction.channelId}> om te reageren.`);
        const vc: VoiceConnection = joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator
        });

        const tts = new gTTS(`${receiver.displayName} wordt gesumment door ${sender.displayName}. ${customMessage}`, 'nl');
        doWithLock("SummonLock", async () => {
           await new Promise<void>((resolve) => {
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
        });
        await interaction.reply({ content: `Je hebt ${user.username} gesummoned.`, ephemeral: true });
    }

}
