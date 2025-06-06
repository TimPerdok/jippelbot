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
class TTS extends Command_1.default {
    get data() {
        const builder = new discord_js_1.SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addStringOption(option => option.setName("message").setDescription("Een custom bericht dat je wilt meesturen").setRequired(true))
            .addStringOption(option => option.setName("language")
            .setDescription("De taal waarin het bericht moet worden voorgelezen. Standaard is Nederlands")
            .setRequired(false)
            .setChoices(Object.entries(Constants_1.LANGUAGES).map(([key, value]) => ({ name: value, value: key })).slice(0, 25)));
        return builder;
    }
    constructor() {
        super("tts", "Verstuur een TTS bericht naar de voice channel waar je in zit.");
    }
    async onCommand(interaction) {
        const message = interaction.options.getString("message")?.substring(0, 300) ?? "";
        const language = interaction.options.getString("language") ?? "nl";
        const channels = (await interaction.guild?.channels.fetch());
        if (!channels)
            return;
        const sender = interaction.member;
        const channel = channels.find(channel => channel?.type === discord_js_1.ChannelType.GuildVoice && channel.members.has(sender.id));
        if (!channel)
            return await interaction.reply({ content: "Je moet in een voice channel zitten om dit commando te gebruiken.", ephemeral: true });
        (0, Lock_1.doWithLock)(Constants_1.Locks.VoiceLock, () => this.summon(channel, message, language));
        await interaction.reply({ content: `Je hebt de volgende TTS verstuurd: ${message}`, ephemeral: true });
    }
    async summon(channel, message, language = "nl") {
        const tts = new gtts_1.default(message, language);
        await new Promise((resolve) => {
            const vc = (0, voice_1.joinVoiceChannel)({ channelId: channel.id, guildId: channel.guild.id, adapterCreator: channel.guild.voiceAdapterCreator });
            const tmpFile = path_1.default.join(Constants_1.TEMP_FOLDER, 'gtts.mp3');
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
exports.default = TTS;
