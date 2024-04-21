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
const JSONDataHandler_1 = __importDefault(require("./datahandlers/JSONDataHandler"));
const ServerREST_1 = __importDefault(require("./ServerREST"));
const TwitchAccessToken_1 = __importDefault(require("../api/TwitchAccessToken"));
const StdinListener_1 = __importDefault(require("./StdinListener"));
const ListDataHandler_1 = __importDefault(require("./datahandlers/ListDataHandler"));
const Server_1 = __importDefault(require("./Server"));
const Constants_1 = require("../Constants");
const CustomIdentifier_1 = __importDefault(require("./CustomIdentifier"));
class DiscordBot {
    setInstance(instance) {
        DiscordBot.instance = instance;
    }
    static getInstance() {
        return DiscordBot.instance;
    }
    constructor(token, clientId, twitchToken) {
        this.setInstance(this);
        this.rest = new discord_js_1.REST({ version: '10' }).setToken(token);
        DiscordBot.client = new discord_js_1.Client({
            intents: [discord_js_1.GatewayIntentBits.Guilds,
                discord_js_1.GatewayIntentBits.GuildMessages,
                discord_js_1.GatewayIntentBits.MessageContent,
                discord_js_1.GatewayIntentBits.GuildMembers]
        });
        this.serverRESTS = [];
        this.commands = new discord_js_1.Collection();
        this.stdinListener = new StdinListener_1.default();
        this.stdinListener.start();
        this.dataHandlers = {
            poll: new ListDataHandler_1.default('poll.json'),
            serverdata: new JSONDataHandler_1.default('serverdata.json'),
            gameSubscriptions: new ListDataHandler_1.default('gameSubscriptions.json')
        };
        DiscordBot.client.on('ready', () => __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            console.log(`Logged in as ${(_b = (_a = DiscordBot.client) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.tag}`);
            this.commands = Constants_1.COMMANDS.reduce((collection, command) => {
                collection.set(command.name, command);
                return collection;
            }, new discord_js_1.Collection());
            this.servers = DiscordBot.client.guilds.cache.map((guild) => {
                const serverData = this.dataHandlers.serverdata.getAllOfServer(guild.id);
                const rest = new ServerREST_1.default(this.rest, guild, clientId);
                rest.updateCommands(this.commands);
                return new Server_1.default(guild, serverData, rest);
            });
        }));
        DiscordBot.client.on(discord_js_1.Events.MessageCreate, (message) => {
            var _a;
            if (!message.guild)
                return console.log('Received DM');
            if (message.author.bot)
                return console.log('Received bot message');
            const voteChannel = this.dataHandlers.serverdata.getAllOfServer((_a = message.guild) === null || _a === void 0 ? void 0 : _a.id).voteChannel;
            if (message.channel.id !== voteChannel)
                return;
            message.delete();
            message.author.send('Je mag geen berichten sturen in het vote kanaal. Gebruik hiervoor het discussie kanaal');
        });
        DiscordBot.client.on(discord_js_1.Events.InteractionCreate, this.onInteractionCreate.bind(this));
        DiscordBot.client.login(token);
        try {
            this.twitchAccessTokenHandler = new TwitchAccessToken_1.default(twitchToken);
        }
        catch (error) {
            console.error(error);
        }
    }
    getServerById(id) {
        return this.servers.find(server => server.guild.id === id);
    }
    onInteractionCreate(interaction) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let command;
                switch (interaction.constructor.name) {
                    case 'ChatInputCommandInteraction':
                        interaction = interaction;
                        command = this.commands.get(interaction === null || interaction === void 0 ? void 0 : interaction.commandName);
                        command.onCommand(interaction);
                        break;
                    case "ButtonInteraction":
                        interaction = interaction;
                        const customId = CustomIdentifier_1.default.fromCustomId(interaction.customId);
                        command = this.commands.get(customId.command);
                        if (customId === null || customId === void 0 ? void 0 : customId.subcommand)
                            return (_a = command.subcommands
                                .find(subcommand => subcommand.name === customId.subcommand)) === null || _a === void 0 ? void 0 : _a.onButtonPress(interaction);
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
