"use strict";
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
const fs_1 = __importDefault(require("fs"));
class DiscordBot {
    setInstance(instance) {
        DiscordBot.instance = instance;
    }
    static getInstance() {
        return DiscordBot.instance;
    }
    constructor(token, clientId, twitchToken) {
        this.setInstance(this);
        fs_1.default.mkdirSync(Constants_1.TEMP_FOLDER, { recursive: true });
        this.rest = new discord_js_1.REST({ version: '10' }).setToken(token);
        DiscordBot.client = new discord_js_1.Client({
            intents: [discord_js_1.GatewayIntentBits.Guilds,
                discord_js_1.GatewayIntentBits.GuildMessages,
                discord_js_1.GatewayIntentBits.MessageContent,
                discord_js_1.GatewayIntentBits.GuildMembers,
                discord_js_1.GatewayIntentBits.GuildVoiceStates
            ]
        });
        this.serverRESTS = [];
        this.commands = new discord_js_1.Collection();
        this.stdinListener = new StdinListener_1.default();
        this.stdinListener.start();
        this.dataHandlers = {
            serverdata: new JSONDataHandler_1.default('serverdata.json'),
            gameSubscriptions: new ListDataHandler_1.default('gameSubscriptions.json')
        };
        DiscordBot.client.on('ready', async () => {
            console.log(`Logged in as ${DiscordBot.client?.user?.tag}`);
            this.commands = Constants_1.COMMANDS.reduce((collection, command) => {
                collection.set(command.name, command);
                return collection;
            }, new discord_js_1.Collection());
            this.servers = DiscordBot.client.guilds.cache.map((guild) => {
                const serverData = this.dataHandlers.serverdata.getAllOfServer(guild.id);
                const rest = new ServerREST_1.default(this.rest, guild, clientId);
                rest.updateCommands(this.commands);
                return new Server_1.default(guild);
            });
        });
        DiscordBot.client.on(discord_js_1.Events.MessageCreate, (message) => {
            if (!message.guild)
                return console.log('Received DM');
            if (message.author.bot)
                return console.log('Received bot message');
            const voteChannel = this.dataHandlers.serverdata.getAllOfServer(message.guild?.id).voteChannel;
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
    async onInteractionCreate(interaction) {
        try {
            let command;
            switch (interaction.constructor.name) {
                case 'ChatInputCommandInteraction':
                    interaction = interaction;
                    command = this.commands.get(interaction?.commandName);
                    try {
                        command.onCommand(interaction);
                    }
                    catch (error) {
                        console.error(error);
                    }
                    break;
                case "ButtonInteraction":
                    interaction = interaction;
                    try {
                        const customId = CustomIdentifier_1.default.fromCustomId(interaction.customId);
                        command = this.commands.get(customId.command);
                        if (customId?.subcommand)
                            return command.subcommands
                                .find(subcommand => subcommand.name === customId.subcommand)
                                ?.onButtonPress(interaction);
                        command.onButtonPress(interaction);
                    }
                    catch (error) {
                        console.error(error);
                    }
                    break;
            }
        }
        catch (error) {
            console.error(error);
        }
    }
}
exports.default = DiscordBot;
