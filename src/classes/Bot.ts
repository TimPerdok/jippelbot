import { ButtonInteraction, ChatInputCommandInteraction, Client, CacheType, Collection, Events, GatewayIntentBits, Guild, Interaction, REST, Routes, SelectMenuInteraction, SlashCommandBuilder, MessageContextMenuCommandInteraction, UserContextMenuCommandInteraction, AutocompleteInteraction, ModalSubmitInteraction, Message, TextChannel, Embed, EmbedField } from "discord.js";
import { PollJSON } from "../types/PollJSON";
import Classfinder from "./Classfinder";
import Command from "./Command";
import JSONDataHandler, { ServerScoped } from "./datahandlers/JSONDataHandler";
import ServerREST from "./ServerREST";
import TwitchAccessTokenHandler, { TwitchAuth } from "../api/TwitchAccessToken";
import StdinListener from "./StdinListener";
import GameReleaseUpdater from "./gamereleases/GameReleaseUpdater";
import { ServerdataJSON } from "../types/ServerdataJSON";
import { Game } from "../api/IGDB";
import { DataJSON } from "../interfaces/MessageCarrier";
import ListDataHandler from "./datahandlers/ListDataHandler";

export default class DiscordBot {

    rest: REST;

    static client: Client;

    serverRESTS: ServerREST[]

    commands: Collection<string, Command>
    twitchAccessTokenHandler: TwitchAccessTokenHandler;
    
    static instance: DiscordBot;

    stdinListener: StdinListener;
    gameReleaseUpdater: GameReleaseUpdater;
    dataHandlers: {
        poll: ListDataHandler<PollJSON[]>
        serverdata: JSONDataHandler<ServerdataJSON>
        gameSubscriptions: ListDataHandler<Game[]>
    };


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
            serverdata: new JSONDataHandler<ServerdataJSON>('serverdata.json'),
            gameSubscriptions: new ListDataHandler<Game[]>('gameSubscriptions.json')

        }

       

        DiscordBot.client.on('ready', async () => {
            console.log(`Logged in as ${DiscordBot.client?.user?.tag}`);
            const commands: Command[] = await Classfinder.getCommands()
            commands.forEach((command: Command) => this.commands.set(command.name, command) );
            this.serverRESTS = this.servers.map((server: Guild) => {
                return new ServerREST(this.rest, server, clientId)
            })
            this.serverRESTS.forEach((rest) => {
                rest.updateCommands(this.commands)
            })
        });

        DiscordBot.client.on(Events.InteractionCreate, this.onInteractionCreate.bind(this));
        DiscordBot.client.login(token);

        try {
            this.twitchAccessTokenHandler = new TwitchAccessTokenHandler(twitchToken)
        } catch (error) {
            console.error(error)
        }
        this.gameReleaseUpdater = new GameReleaseUpdater()
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
                        const message = interaction.message as Message
                        let commandName = message.interaction?.commandName?.split(' ')[0];
                        const serverPolls = (await this.dataHandlers.poll.get(interaction.guildId ?? "")) as PollJSON[]
                        const poll = serverPolls.find(poll => poll.messageId === message.id)
                        if (!commandName) commandName = poll?.command.split(' ')[0] as string
                        command = this.commands.get(commandName) as Command; // Add type assertion here
                        command.onButtonPress(interaction);
                        break;
                }
            } catch (error) {
                console.error(error)
            }
    }





}
