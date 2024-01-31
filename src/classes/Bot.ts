import { ButtonInteraction, ChatInputCommandInteraction, Client, CacheType, Collection, Events, GatewayIntentBits, Guild, Interaction, REST, Routes, SelectMenuInteraction, SlashCommandBuilder, MessageContextMenuCommandInteraction, UserContextMenuCommandInteraction, AutocompleteInteraction, ModalSubmitInteraction, Message, TextChannel } from "discord.js";
import { PollJSON } from "../types/PollJSON";
import Classfinder from "./Classfinder";
import Command from "./Command";
import DataHandler, { DataFile } from "./datahandlers/DataHandler";
import ServerREST from "./ServerREST";
import TwitchAccessTokenHandler, { TwitchAccessTokenJSON, TwitchAuth } from "../api/TwitchAccessToken";
import IGDBApi, { Game } from "../api/IGDBApi";
import schedule from "node-schedule"
import { all } from "axios";
import { DataJSON } from "../interfaces/MessageCarrier";
import readline from "readline";
import {exec} from 'child_process'

export default class DiscordBot {

    rest: REST;

    static client: Client;

    serverRESTS: ServerREST[]

    commands: Collection<string, Command>
    twitchAccessTokenHandler: TwitchAccessTokenHandler;
    
    static instance: DiscordBot;


    setInstance(instance: DiscordBot) {
        DiscordBot.instance = instance
    }

    static getInstance(): DiscordBot {
        return DiscordBot.instance
    }
    
    

    get servers() {
        return DiscordBot.client.guilds.cache
    }

    constructor(token: string, clientId: string, twitchToken: TwitchAuth) {
        this.rest = new REST({ version: '10' }).setToken(token);
        DiscordBot.client = new Client({
            intents: [GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent,
            GatewayIntentBits.GuildMembers]
        });
        this.serverRESTS = []
        this.commands = new Collection<string, Command>();

        console.log(`------------------------`);
        console.log(`JIPPELBOT VERSION 0.0.1`);
        console.log(`------------------------`);

        console.log(`Logging in...`);
        DiscordBot.client.on('ready', async () => {
            console.log(`Logged in as ${DiscordBot.client?.user?.tag}`);
            
            const commands: Command[] = await Classfinder.getCommands()

            commands.forEach((command: Command) => {
                this.commands.set(command.name, command)
            });


            this.serverRESTS = this.servers.map((server: Guild) => {
                return new ServerREST(this.rest, server, clientId)
            })
            this.serverRESTS.forEach((rest) => {
                rest.updateCommands(this.commands)
            })
        });

        // DiscordBot.client.on("messageCreate", async (message: Message) => {
        //     if (message.channel.id === "1012046912960077884" && message.member.id != "1039277723190825131"){//Knappe koppen
        //         if (message.attachments.size == 0){
        //             message.channel.send("HEY <@"+message.member.id+"> ALLEEN FOTO'S IN DIT KANAAL, COMMENTAAR KAN GEGEVEN WORDEN IN <#1070408486552338483>");
        //             message.delete();
        //         }
        //     }
        // });

        DiscordBot.client.on(Events.InteractionCreate, this.onInteractionCreate.bind(this));
        DiscordBot.client.login(token);
        this.listenstdin()

        try {
            this.twitchAccessTokenHandler = new TwitchAccessTokenHandler(twitchToken)
            DiscordBot.rescheduleGameReleaseAlerts()
            DiscordBot.scheduleUpdateGames()


            this.setInstance(this)
        } catch (error) {
            console.error(error)
        }
    }
    listenstdin() {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });

        rl.on('line', (line) => {
            exec(line, (error, stdout, stderr) => {
                if (error) return console.error(error);
                if (stderr) return console.error(stderr);
                console.log(`stdout: ${stdout}`);
            });
        });
    }
    static async scheduleUpdateGames() {
        this.searchGames()
        schedule.scheduleJob('0 0 * * *', this.searchGames)
    }
    static async searchGames() {
        console.log("Updating game info...")
        const allGamesServer = await DataHandler.getAllGameSubscriptions();
        const allGames = Object.values(allGamesServer);
        const ids = allGames.flatMap((games) => games.map((game) => game.id));
        if (!ids.length) return console.log("No games to update");
        const newGames = await IGDBApi.searchGames(ids);
        const newAllGamesServer = Object.fromEntries(Object.entries(allGamesServer).map(([serverId, oldGames]: [string, Game[]]) => {
            return [serverId, oldGames.map((game) => newGames.find((newGame) => newGame.id === game.id) || game)] as [string, Game[]];
        })) as DataFile<Game[]>;
        await DataHandler.updateGameSubscriptions(newAllGamesServer);
        console.log("Updating game info done!")
    }

    static async rescheduleGameReleaseAlerts() {
        console.log("Scheduling game releases...")
        await schedule.gracefulShutdown();
        await this.scheduleGameReleaseAlerts();
        console.log("Scheduling game releases done!")
    }

    static async scheduleGameReleaseAlerts() {
        const allGames = await DataHandler.getAllGameSubscriptions();
        Object.entries(allGames).forEach(([serverId, games]: [string, Game[]]) => {
            games.forEach((game) => {
                if (!game.nextReleaseDate) return;
                schedule.scheduleJob(new Date(game.nextReleaseDate * 1000), async () => {
                    const botspamChannel = (await DataHandler.getServerdata(serverId)).botspamChannel;
                    if (!botspamChannel) return;
                    const channel = DiscordBot.client.channels.cache.get(botspamChannel) as TextChannel;
                    if (!channel) return;
                    channel.send(`@everyone ${game.name} is gereleased!`);
                })
            })
        })
    }

    async onInteractionCreate(interaction: Interaction) {
            try {
                let command: Command;
                
                switch (interaction.constructor.name) {
                    case 'ChatInputCommandInteraction':
                        interaction = interaction as ChatInputCommandInteraction;
                        command = this.commands.get(interaction?.commandName) as Command; // Add type assertion here
                        command.onCommand(interaction);
                        break;
                    case "ButtonInteraction":
                        interaction = interaction as ButtonInteraction;
                        let commandName = interaction.message.interaction?.commandName?.split(' ')[0];
                        if (!commandName) commandName = (await DataHandler.getPoll(interaction.message.id) as PollJSON).command.split('/')[0];
                        command = this.commands.get(commandName) as Command; // Add type assertion here
                        command.onButtonPress(interaction);
                        break;
                }
            } catch (error) {
                console.error(error)
            }
    }





}
