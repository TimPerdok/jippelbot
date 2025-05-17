"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const voice_1 = require("@discordjs/voice");
const discord_js_1 = require("discord.js");
const fs_1 = __importDefault(require("fs"));
const gtts_1 = __importDefault(require("gtts"));
const path_1 = __importDefault(require("path"));
const Command_1 = __importDefault(require("../classes/Command"));
const Lock_1 = require("../classes/Lock");
const Constants_1 = require("../Constants");
class Summon extends Command_1.default {
    get data() {
        const builder = new discord_js_1.SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addUserOption(option => option.setName("user").setDescription("De persoon die je wilt summonen").setRequired(true))
            .addStringOption(option => option.setName("message").setDescription("Een custom bericht dat je wilt meesturen").setRequired(false))
            .addStringOption(option => option.setName("language")
            .setDescription("De taal waarin het bericht moet worden voorgelezen. Standaard is Nederlands")
            .setRequired(false)
            .setChoices(Object.entries(Constants_1.LANGUAGES).map(([key, value]) => ({ name: value, value: key })).slice(0, 25)));
        return builder;
    }
    constructor() {
        super("summon", "Summon iemand");
    }
    async onCommand(interaction) {
        const language = interaction.options.getString("language") ?? "nl";
        const user = interaction.options.getUser("user", true);
        if (user.bot)
            return await interaction.reply({ content: "Je kan geen bots summonen.", ephemeral: true });
        const customMessage = interaction.options.getString("message")?.substring(0, 300) ?? "";
        const channels = (await interaction.guild?.channels.fetch());
        if (!channels)
            return;
        const channel = channels.find(channel => channel?.type === discord_js_1.ChannelType.GuildVoice && channel.members.has(user.id));
        const sender = interaction.member;
        const receiver = await interaction.guild?.members.fetch(user.id);
        if (!channel) {
            await user.send(`Je wordt gesummoned door ${sender.displayName} in ${receiver.displayName}. Klik <#${interaction.channelId}> om te reageren.`);
            await interaction.reply({ content: `${receiver.displayName} heeft een PM ontvangen.`, ephemeral: true });
        }
        (0, Lock_1.doWithLock)(Constants_1.Locks.VoiceLock, () => this.summon(receiver, sender, channel, customMessage, language));
        await interaction.reply({ content: `Je hebt ${user.username} gesummoned.`, ephemeral: true });
    }
    async summon(receiver, sender, channel, customMessage = "", language = "nl") {
        const channelMessage = sender.voice.channel ? ` om naar ${sender.voice.channel.name} te gaan` : "";
        const tts = new gtts_1.default(`${receiver.displayName} wordt gesumment door ${sender.displayName}${channelMessage}. ${customMessage ? `Hier volgt een bericht: ${customMessage}` : ""}`, language);
        await new Promise((resolve) => {
            const vc = (0, voice_1.joinVoiceChannel)({
                channelId: channel.id,
                guildId: channel.guild.id,
                adapterCreator: channel.guild.voiceAdapterCreator
            });
            const tmpFile = path_1.default.join(Constants_1.TEMP_FOLDER, 'summon-gtts.mp3');
            if (fs_1.default.existsSync(tmpFile))
                fs_1.default.rmSync(tmpFile);
            tts.save(tmpFile, (err) => {
                if (err)
                    return resolve();
                const player = (0, voice_1.createAudioPlayer)();
                const resource = (0, voice_1.createAudioResource)(fs_1.default.createReadStream(tmpFile));
                player.play(resource);
                vc.subscribe(player);
                player.on(voice_1.AudioPlayerStatus.Idle, () => {
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
exports.default = Summon;
