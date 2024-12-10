import { ButtonInteraction, ChatInputCommandInteraction, Client, CacheType, Collection, Events, GatewayIntentBits, Guild, Interaction, REST, Message, } from "discord.js";
import Command from "./Command";
import JSONDataHandler, { ServerScoped } from "./datahandlers/JSONDataHandler";
import ServerREST from "./ServerREST";
import TwitchAccessTokenHandler, { TwitchAuth } from "../api/TwitchAccessToken";
import StdinListener from "./StdinListener";
import GameReleaseEmbedManager from "./schedulers/GameReleasesEmbedManager";
import { ServerConfig } from "../types/ServerdataJSON";
import { Game } from "../api/IGDB";
import ListDataHandler from "./datahandlers/ListDataHandler";
import Server from "./Server";
import { COMMANDS, TEMP_FOLDER } from "../Constants";
import CustomIdentifier from "./CustomIdentifier";
import fs from 'fs'


export default class DiscordBot {

    rest: REST;

    static client: Client;

    serverRESTS: ServerREST[]

    commands: Collection<string, Command>
    twitchAccessTokenHandler: TwitchAccessTokenHandler;

    static instance: DiscordBot;

    stdinListener: StdinListener;
    dataHandlers: {
        serverdata: JSONDataHandler<ServerConfig>
        gameSubscriptions: ListDataHandler<Game[]>
    };


    setInstance(instance: DiscordBot) {
        DiscordBot.instance = instance
    }

    static getInstance(): DiscordBot {
        return DiscordBot.instance
    }

    servers: Server[]

    constructor(token: string, clientId: string, twitchToken: TwitchAuth) {
        this.setInstance(this)

        fs.mkdirSync(TEMP_FOLDER, { recursive: true })
        
        this.rest = new REST({ version: '10' }).setToken(token);
        DiscordBot.client = new Client({
            intents: [GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent,
            GatewayIntentBits.GuildMembers,
            GatewayIntentBits.GuildVoiceStates
        ]
        });
        this.serverRESTS = []
        this.commands = new Collection<string, Command>();
        this.stdinListener = new StdinListener()
        this.stdinListener.start()
        this.dataHandlers = {
            serverdata: new JSONDataHandler<ServerConfig>('serverdata.json'),
            gameSubscriptions: new ListDataHandler<Game[]>('gameSubscriptions.json')
        }

        DiscordBot.client.on('ready', async () => {
            console.log(`Logged in as ${DiscordBot.client?.user?.tag}`);
            this.commands = COMMANDS.reduce((collection, command) => {
                    collection.set(command.name, command)
                    return collection
                }, new Collection<string, Command>())
            this.servers = DiscordBot.client.guilds.cache.map((guild: Guild) => {
                const serverData = this.dataHandlers.serverdata.getAllOfServer(guild.id)
                const rest = new ServerREST(this.rest, guild, clientId)
                rest.updateCommands(this.commands)
                return new Server(guild)
            });
        });

        DiscordBot.client.on(Events.MessageCreate, (message) => {
            if (!message.guild) return console.log('Received DM')
            if (message.author.bot) return console.log('Received bot message')
            const voteChannel = this.dataHandlers.serverdata.getAllOfServer(message.guild?.id).voteChannel
            if (message.channel.id !== voteChannel) return;
            message.delete();
            message.author.send('Je mag geen berichten sturen in het vote kanaal. Gebruik hiervoor het discussie kanaal')
        });

        DiscordBot.client.on(Events.InteractionCreate, this.onInteractionCreate.bind(this));
        DiscordBot.client.login(token);

        try {
            this.twitchAccessTokenHandler = new TwitchAccessTokenHandler(twitchToken)
        } catch (error) {
            console.error(error)
        }


    }

    getServerById(id: string) {
        return this.servers.find(server => server.guild.id === id)
    }

    async onInteractionCreate(interaction: Interaction) {
        try {
            let command: Command;
            switch (interaction.constructor.name) {
                case 'ChatInputCommandInteraction':
                    interaction = interaction as ChatInputCommandInteraction;
                    command = this.commands.get(interaction?.commandName) as Command;
                    try { command.onCommand(interaction); } catch (error) { console.error(error) }
                    break;
                case "ButtonInteraction":
                    interaction = interaction as ButtonInteraction;
                    try {
                        const customId = CustomIdentifier.fromCustomId(interaction.customId)
                        command = this.commands.get(customId.command) as Command;
                        if (customId?.subcommand) return command.subcommands
                                                            .find(subcommand => subcommand.name === customId.subcommand)
                                                            ?.onButtonPress(interaction);
                        command.onButtonPress(interaction); 
                    } catch (error) {
                        console.error(error)
                    }
                    break;
            }
        } catch (error) {
            console.error(error)
        }
    }





}
