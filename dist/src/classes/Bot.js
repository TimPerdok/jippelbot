"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const Classfinder_1 = __importDefault(require("./Classfinder"));
const DataHandler_1 = __importDefault(require("./datahandlers/DataHandler"));
const ServerREST_1 = __importDefault(require("./ServerREST"));
class DiscordBot {
    constructor(token, clientId) {
        this.rest = new discord_js_1.REST({ version: '10' }).setToken(token);
        DiscordBot.client = new discord_js_1.Client({
            intents: [discord_js_1.GatewayIntentBits.Guilds,
                discord_js_1.GatewayIntentBits.GuildMessages,
                discord_js_1.GatewayIntentBits.MessageContent,
                discord_js_1.GatewayIntentBits.GuildMembers]
        });
        this.serverRESTS = [];
        this.commands = new discord_js_1.Collection();
        DiscordBot.client.on('ready', () => __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            console.log(`Logged in as ${(_b = (_a = DiscordBot.client) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.tag}`);
            const commands = yield Classfinder_1.default.getCommands();
            commands.forEach((command) => {
                this.commands.set(command.name, command);
            });
            this.serverRESTS = this.servers.map((server) => {
                return new ServerREST_1.default(this.rest, server, clientId);
            });
            this.serverRESTS.forEach((rest) => {
                rest.updateCommands(this.commands);
            });
        }));
        DiscordBot.client.on("messageCreate", (message) => __awaiter(this, void 0, void 0, function* () {
            if (message.channel.id === "1012046912960077884" && message.member.id != "1039277723190825131") { //Knappe koppen
                if (message.attachments.size == 0) {
                    message.channel.send("HEY <@" + message.member.id + "> ALLEEN FOTO'S IN DIT KANAAL, COMMENTAAR KAN GEGEVEN WORDEN IN <#1070408486552338483>");
                    message.delete();
                }
            }
        }));
        DiscordBot.client.on("guildCreate", guild => {
            console.log("Joined a new guild: " + guild.name);
            DataHandler_1.default.addServerdata(guild.id);
        });
        DiscordBot.client.on(discord_js_1.Events.InteractionCreate, this.onInteractionCreate.bind(this));
        DiscordBot.client.login(token);
    }
    get servers() {
        return DiscordBot.client.guilds.cache;
    }
    onInteractionCreate(interaction) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let command = null;
                switch (interaction.constructor.name) {
                    case 'ChatInputCommandInteraction':
                        interaction = interaction;
                        command = this.commands.get(interaction === null || interaction === void 0 ? void 0 : interaction.commandName);
                        command.onCommand(interaction);
                        break;
                    case "ButtonInteraction":
                        interaction = interaction;
                        let commandName = (_b = (_a = interaction.message.interaction) === null || _a === void 0 ? void 0 : _a.commandName) === null || _b === void 0 ? void 0 : _b.split(' ')[0];
                        if (!commandName)
                            commandName = (yield DataHandler_1.default.getPoll(interaction.message.id)).command.split('/')[0];
                        command = this.commands.get(commandName);
                        command.onButtonPress(interaction);
                        break;
                }
            }
            catch (error) {
                console.error(error);
            }
        });
    }
}
exports.default = DiscordBot;
