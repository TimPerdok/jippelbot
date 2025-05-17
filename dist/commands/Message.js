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
class Message extends Command_1.default {
    get data() {
        const builder = new discord_js_1.SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addUserOption(option => option.setName("user").setDescription("De persoon die je wilt berichten").setRequired(true))
            .addStringOption(option => option.setName("message").setDescription("Het bericht dat je wilt voorgelezen wilt laten worden").setRequired(true))
            .addStringOption(option => option.setName("language")
            .setDescription("De taal waarin het bericht moet worden voorgelezen. Standaard is Nederlands")
            .setRequired(false)
            .setChoices(Object.entries(Constants_1.LANGUAGES).map(([key, value]) => ({ name: value, value: key })).slice(0, 25)));
        return builder;
    }
    constructor() {
        super("message", "Stuur iemand een TTS message");
    }
    async onCommand(interaction) {
        const language = interaction.options.getString("language") ?? "nl";
        const user = interaction.options.getUser("user", true);
        if (user.bot)
            return await interaction.reply({ content: "Je kan geen bots summonen.", ephemeral: true });
        const customMessage = interaction.options.getString("message", true)?.substring(0, 300);
        const channels = (await interaction.guild?.channels.fetch());
        if (!channels)
            return;
        const channel = channels.find(channel => channel?.type === discord_js_1.ChannelType.GuildVoice && channel.members.has(user.id));
        const sender = interaction.member;
        const receiver = await interaction.guild?.members.fetch(user.id);
        if (!channel)
            return await interaction.reply({ content: `${receiver.displayName} zit niet in een kanaal momenteel.`, ephemeral: true });
        (0, Lock_1.doWithLock)(Constants_1.Locks.VoiceLock, () => this.sendCustomMessage(receiver, sender, channel, customMessage, language));
        await interaction.reply({ content: `Je hebt naar ${user.displayName} een TTS verstuurd.`, ephemeral: true });
    }
    async sendCustomMessage(receiver, sender, channel, customMessage = "", language = "nl") {
        const tts = new gtts_1.default(`Bericht van ${sender.displayName} voor ${receiver.displayName}. ${customMessage}`, language);
        await new Promise((resolve) => {
            const vc = (0, voice_1.joinVoiceChannel)({
                channelId: channel.id,
                guildId: channel.guild.id,
                adapterCreator: channel.guild.voiceAdapterCreator
            });
            const tmpFile = path_1.default.join(Constants_1.TEMP_FOLDER, 'remote-gtts.mp3');
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
exports.default = Message;
