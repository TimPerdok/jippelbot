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
const readline_1 = __importDefault(require("readline"));
const child_process_1 = require("child_process");
const util_1 = require("../util/util");
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
        console.log(`------------------------`);
        console.log(`JIPPELBOT VERSION 0.0.1`);
        console.log(`------------------------`);
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
        DiscordBot.client.on(discord_js_1.Events.InteractionCreate, this.onInteractionCreate.bind(this));
        DiscordBot.client.login(token);
        this.listenstdin();
        try {
            this.twitchAccessTokenHandler = new TwitchAccessToken_1.default(twitchToken);
            DiscordBot.rescheduleGameReleaseAlerts();
            DiscordBot.scheduleUpdateGames();
            this.setInstance(this);
        }
        catch (error) {
            console.error(error);
        }
    }
    listenstdin() {
        const rl = readline_1.default.createInterface({
            input: process.stdin,
            output: process.stdout,
        });
        rl.on('line', (line) => {
            (0, child_process_1.exec)(line, (error, stdout, stderr) => {
                if (error)
                    return console.error(error);
                if (stderr)
                    return console.error(stderr);
                console.log(`stdout: ${stdout}`);
            });
        });
    }
    static scheduleUpdateGames() {
        return __awaiter(this, void 0, void 0, function* () {
            this.updateGameSubscriptions();
            node_schedule_1.default.scheduleJob('0 0 * * *', this.updateGameSubscriptions);
        });
    }
    static updateGameSubscriptions() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("Updating game info...");
            const allGamesServer = yield DataHandler_1.default.getAllGameSubscriptions();
            const allGames = Object.values(allGamesServer);
            const ids = allGames.flatMap((games) => games.map((game) => game.id));
            if (!ids.length)
                return console.log("No games to update");
            const newGames = yield IGDBApi_1.default.searchGames(ids);
            const newAllGamesServer = Object.fromEntries(Object.entries(allGamesServer).map(([serverId, oldGames]) => {
                const games = oldGames.map((game) => {
                    const newGame = newGames.find((newGame) => newGame.id === game.id) || game;
                    return Object.assign(Object.assign({}, game), newGame);
                });
                return [serverId, games];
            }));
            yield DataHandler_1.default.updateGameSubscriptions(newAllGamesServer);
            yield this.removeOldGames(newAllGamesServer);
            yield this.updateMessages();
            console.log("Updating game info done!");
        });
    }
    static removeOldGames(newAllGamesServer) {
        const newGames = Object.entries(newAllGamesServer).map(([serverId, games]) => ([serverId, games.filter((game) => !(game === null || game === void 0 ? void 0 : game.nextReleaseDate) || game.nextReleaseDate > Math.floor(Date.now() / 1000))]));
        return DataHandler_1.default.updateGameSubscriptions(Object.fromEntries(newGames));
    }
    static updateMessages() {
        return __awaiter(this, void 0, void 0, function* () {
            let allGames = yield DataHandler_1.default.getAllGameSubscriptions();
            Object.entries(allGames).forEach(([serverId, games]) => __awaiter(this, void 0, void 0, function* () {
                try {
                    const serverdata = yield DataHandler_1.default.getServerdata(serverId);
                    const embed = yield (0, util_1.createEmbed)(games);
                    const channel = DiscordBot.client.channels.cache.get(serverdata.releaseChannel);
                    if (!channel)
                        return;
                    const messages = yield channel.messages.fetch({ limit: 25 });
                    const message = messages.find((message) => message.author.id === DiscordBot.client.user.id && message.embeds.length > 0);
                    message
                        ? message.edit({ embeds: [embed] })
                        : channel.send({ embeds: [embed] });
                }
                catch (error) {
                    console.error(error);
                }
            }));
        });
    }
    static rescheduleGameReleaseAlerts() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("Rescheduling game releases...");
            yield node_schedule_1.default.gracefulShutdown();
            yield this.scheduleGameReleaseAlerts();
            console.log("Rescheduling game releases done!");
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
                        const releaseChannel = (yield DataHandler_1.default.getServerdata(serverId)).releaseChannel;
                        if (!releaseChannel)
                            return;
                        const channel = DiscordBot.client.channels.cache.get(releaseChannel);
                        if (!channel)
                            return;
                        const messages = yield channel.messages.fetch({ limit: 25 });
                        const message = messages.find((message) => message.author.id === DiscordBot.client.user.id && message.embeds.length == 0);
                        message.delete();
                        channel.send({ content: `**${game.name} is gereleased!**` });
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
