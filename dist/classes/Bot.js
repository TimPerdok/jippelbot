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
const TwitchAccessToken_1 = __importDefault(require("../api/TwitchAccessToken"));
const IGDBApi_1 = __importDefault(require("../api/IGDBApi"));
const node_schedule_1 = __importDefault(require("node-schedule"));
class DiscordBot {
    setInstance(instance) {
        DiscordBot.instance = instance;
    }
    static getInstance() {
        return DiscordBot.instance;
    }
    get servers() {
        return DiscordBot.client.guilds.cache;
    }
    constructor(token, clientId, twitchToken) {
        this.rest = new discord_js_1.REST({ version: '10' }).setToken(token);
        DiscordBot.client = new discord_js_1.Client({
            intents: [discord_js_1.GatewayIntentBits.Guilds,
                discord_js_1.GatewayIntentBits.GuildMessages,
                discord_js_1.GatewayIntentBits.MessageContent,
                discord_js_1.GatewayIntentBits.GuildMembers]
        });
        this.serverRESTS = [];
        this.commands = new discord_js_1.Collection();
        console.log(`Logging in...`);
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
        // DiscordBot.client.on("messageCreate", async (message: Message) => {
        //     if (message.channel.id === "1012046912960077884" && message.member.id != "1039277723190825131"){//Knappe koppen
        //         if (message.attachments.size == 0){
        //             message.channel.send("HEY <@"+message.member.id+"> ALLEEN FOTO'S IN DIT KANAAL, COMMENTAAR KAN GEGEVEN WORDEN IN <#1070408486552338483>");
        //             message.delete();
        //         }
        //     }
        // });
        DiscordBot.client.on("guildCreate", guild => {
            console.log("Joined a new guild: " + guild.name);
            DataHandler_1.default.addServerdata(guild.id);
        });
        DiscordBot.client.on(discord_js_1.Events.InteractionCreate, this.onInteractionCreate.bind(this));
        DiscordBot.client.login(token);
        this.twitchAccessTokenHandler = new TwitchAccessToken_1.default(twitchToken);
        DiscordBot.rescheduleGameReleaseAlerts();
        DiscordBot.scheduleUpdateGames();
        this.setInstance(this);
    }
    static scheduleUpdateGames() {
        return __awaiter(this, void 0, void 0, function* () {
            this.searchGames();
            node_schedule_1.default.scheduleJob('0 0 * * *', this.searchGames);
        });
    }
    static searchGames() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("Updating game info...");
            const allGamesServer = yield DataHandler_1.default.getAllGameSubscriptions();
            const allGames = Object.values(allGamesServer);
            const ids = allGames.flatMap((games) => games.map((game) => game.id));
            const newGames = yield IGDBApi_1.default.searchGames(ids);
            const newAllGamesServer = Object.fromEntries(Object.entries(allGamesServer).map(([serverId, oldGames]) => {
                return [serverId, oldGames.map((game) => newGames.find((newGame) => newGame.id === game.id) || game)];
            }));
            yield DataHandler_1.default.updateGameSubscriptions(newAllGamesServer);
            console.log("Updating game info done!");
        });
    }
    static rescheduleGameReleaseAlerts() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("Scheduling game releases...");
            yield node_schedule_1.default.gracefulShutdown();
            yield this.scheduleGameReleaseAlerts();
            console.log("Scheduling game releases done!");
        });
    }
    static scheduleGameReleaseAlerts() {
        return __awaiter(this, void 0, void 0, function* () {
            const allGames = yield DataHandler_1.default.getAllGameSubscriptions();
            Object.entries(allGames).forEach(([serverId, games]) => {
                games.forEach((game) => {
                    if (!game.nextReleaseDate)
                        return;
                    node_schedule_1.default.scheduleJob(new Date(game.nextReleaseDate * 1000), () => __awaiter(this, void 0, void 0, function* () {
                        const botspamChannel = (yield DataHandler_1.default.getServerdata(serverId)).botspamChannel;
                        if (!botspamChannel)
                            return;
                        const channel = DiscordBot.client.channels.cache.get(botspamChannel);
                        if (!channel)
                            return;
                        channel.send(`@everyone ${game.name} is gereleased!`);
                    }));
                });
            });
        });
    }
    onInteractionCreate(interaction) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let command;
                switch (interaction.constructor.name) {
                    case 'ChatInputCommandInteraction':
                        interaction = interaction;
                        command = this.commands.get(interaction === null || interaction === void 0 ? void 0 : interaction.commandName); // Add type assertion here
                        command.onCommand(interaction);
                        break;
                    case "ButtonInteraction":
                        interaction = interaction;
                        let commandName = (_b = (_a = interaction.message.interaction) === null || _a === void 0 ? void 0 : _a.commandName) === null || _b === void 0 ? void 0 : _b.split(' ')[0];
                        if (!commandName)
                            commandName = (yield DataHandler_1.default.getPoll(interaction.message.id)).command.split('/')[0];
                        command = this.commands.get(commandName); // Add type assertion here
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
