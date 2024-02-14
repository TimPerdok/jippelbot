import { ButtonInteraction, ChatInputCommandInteraction, Client, CacheType, Collection, Events, GatewayIntentBits, Guild, Interaction, REST, Routes, SelectMenuInteraction, SlashCommandBuilder, MessageContextMenuCommandInteraction, UserContextMenuCommandInteraction, AutocompleteInteraction, ModalSubmitInteraction, Message, TextChannel, Embed, EmbedField } from "discord.js";
import { PollJSON } from "../types/PollJSON";
import Classfinder from "./Classfinder";
import Command from "./Command";
import JSONDataHandler, { ServerScoped } from "./datahandlers/JSONDataHandler";
import ServerREST from "./ServerREST";
import TwitchAccessTokenHandler, { TwitchAuth } from "../api/TwitchAccessToken";
import StdinListener from "./StdinListener";
import GameReleasesEmbedUpdater from "./gamereleases/GameReleaseUpdater";
import { ServerConfig } from "../types/ServerdataJSON";
import { Game } from "../api/IGDB";
import { DataJSON } from "../interfaces/MessageCarrier";
import ListDataHandler from "./datahandlers/ListDataHandler";
import Server from "./Server";

export default class DiscordBot {

    rest: REST;

    static client: Client;

    serverRESTS: ServerREST[]

    commands: Collection<string, Command>
    twitchAccessTokenHandler: TwitchAccessTokenHandler;

    static instance: DiscordBot;

    stdinListener: StdinListener;
    dataHandlers: {
        poll: ListDataHandler<PollJSON[]>
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
        this.rest = new REST({ version: '10' }).setToken(token);
        DiscordBot.client = new Client({
            intents: [GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent,
            GatewayIntentBits.GuildMembers]
        });
        this.serverRESTS = []
        this.commands = new Collection<string, Command>();
        this.stdinListener = new StdinListener()
        this.stdinListener.start()
        this.dataHandlers = {
            poll: new ListDataHandler<PollJSON[]>('poll.json'),
            serverdata: new JSONDataHandler<ServerConfig>('serverdata.json'),
            gameSubscriptions: new ListDataHandler<Game[]>('gameSubscriptions.json')

        }

        DiscordBot.client.on('ready', async () => {
            console.log(`Logged in as ${DiscordBot.client?.user?.tag}`);
            this.commands = (await Classfinder.getCommands())
                .reduce((collection, command) => {
                    collection.set(command.name, command)
                    return collection
                }, new Collection<string, Command>())
            this.servers = DiscordBot.client.guilds.cache.map((guild: Guild) => {
                const serverData = this.dataHandlers.serverdata.getOfServer(guild.id)
                const rest = new ServerREST(this.rest, guild, clientId)
                rest.updateCommands(this.commands)
                return new Server(guild, serverData, rest)
            });
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
                    command.onCommand(interaction);
                    break;
                case "ButtonInteraction":
                    interaction = interaction as ButtonInteraction;
                    const message = interaction.message as Message
                    const commandName = message.interaction?.commandName
                    if (!commandName) return;
                    command = this.commands.get(commandName) as Command;
                    command.onButtonPress(interaction);
                    break;
            }
        } catch (error) {
            console.error(error)
        }
    }





}
