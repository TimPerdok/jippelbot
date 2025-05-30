"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const voice_1 = require("@discordjs/voice");
const discord_js_1 = require("discord.js");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const Command_1 = __importDefault(require("../classes/Command"));
const Lock_1 = require("../classes/Lock");
const Constants_1 = require("../Constants");
const AUDIO_FILES = {
    rain: "Rain.mp3",
    thunder: "Rain and Thunder.mp3",
    artillery: "Rain and Artillery.mp3"
};
let currentConnection = null;
let currentChannelId = null;
class Toggledownfall extends Command_1.default {
    constructor() {
        super("toggledownfall", "Speel regen-achtige achtergrondgeluiden in een voicechannel");
    }
    get data() {
        const builder = new discord_js_1.SlashCommandBuilder()
            .setName("toggledownfall")
            .setDescription("Toggle rain sounds in your voice channel")
            .addStringOption(option => option.setName("type")
            .setDescription("The type of downfall")
            .addChoices({ name: "Rain", value: "rain" }, { name: "Rain and Thunder", value: "thunder" }, { name: "Rain and Artillery", value: "artillery" }));
        return builder;
    }
    async onCommand(interaction) {
        const member = interaction.member;
        const voiceChannel = member.voice.channel;
        if (!voiceChannel) {
            return await interaction.reply({ content: "Je moet in een voicechannel zitten om dit commando te gebruiken.", ephemeral: true });
        }
        const type = interaction.options.getString("type") ?? null;
        await (0, Lock_1.doWithLock)(Constants_1.Locks.VoiceLock, async () => {
            if (!currentConnection || currentChannelId !== voiceChannel.id) {
                const soundType = type ?? "rain";
                await this.playInChannel(voiceChannel, soundType);
                await interaction.reply({ content: `Speelt: ${this.getDisplayName(soundType)}.`, ephemeral: true });
            }
            else if (!type) {
                currentConnection.disconnect();
                currentConnection = null;
                currentChannelId = null;
                await interaction.reply({ content: "Regen gestopt en voicechannel verlaten.", ephemeral: true });
            }
            else {
                await this.playSound(type);
                await interaction.reply({ content: `Gewisseld naar: ${this.getDisplayName(type)}.`, ephemeral: true });
            }
        });
    }
    async playInChannel(channel, type) {
        if (currentConnection)
            currentConnection.destroy();
        const connection = (0, voice_1.joinVoiceChannel)({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator
        });
        currentConnection = connection;
        currentChannelId = channel.id;
        await this.playSound(type);
    }
    async playSound(type) {
        if (!currentConnection)
            return;
        const fileName = AUDIO_FILES[type];
        const filePath = path_1.default.join(__dirname, "..", "..", "sounds", fileName);
        if (!fs_1.default.existsSync(filePath)) {
            throw new Error(`Bestand niet gevonden voor type: ${type}`);
        }
        const player = (0, voice_1.createAudioPlayer)();
        const resource = (0, voice_1.createAudioResource)(fs_1.default.createReadStream(filePath), { inlineVolume: true });
        resource.volume?.setVolume(0.5); // Set volume to 50%
        player.play(resource);
        currentConnection.subscribe(player);
        player.on(voice_1.AudioPlayerStatus.Idle, () => {
            // Loop if needed
            player.play((0, voice_1.createAudioResource)(fs_1.default.createReadStream(filePath)));
        });
        player.on('error', err => {
            console.error("Audio error:", err);
            currentConnection?.disconnect();
            currentConnection = null;
            currentChannelId = null;
        });
    }
    getDisplayName(type) {
        switch (type) {
            case "rain": return "Regen";
            case "thunder": return "Regen met onweer";
            case "artillery": return "Regen met artillerie";
            default: return type;
        }
    }
}
exports.default = Toggledownfall;
