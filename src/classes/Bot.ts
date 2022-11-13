import { ButtonInteraction, ChatInputCommandInteraction, Client, CacheType, Collection, Events, GatewayIntentBits, Guild, Interaction, REST, Routes, SelectMenuInteraction, SlashCommandBuilder, MessageContextMenuCommandInteraction, UserContextMenuCommandInteraction, AutocompleteInteraction, ModalSubmitInteraction } from "discord.js";
import { PollJSON } from "../types/PollJSON";
import Classfinder from "./Classfinder";
import Command from "./Command";
import DataHandler from "./datahandlers/DataHandler";
import ServerREST from "./ServerREST";



export default class DiscordBot {

    rest: REST;

    static client: Client;

    serverRESTS: ServerREST[]

    commands: Collection<string, Command>

    get servers() {
        return DiscordBot.client.guilds.cache
    }

    constructor(token: string, clientId: string) {
        this.rest = new REST({ version: '10' }).setToken(token);
        DiscordBot.client = new Client({
            intents: [GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent,
            GatewayIntentBits.GuildMembers]
        });
        this.serverRESTS = []
        this.commands = new Collection<string, Command>();

        DiscordBot.client.on('ready', async () => {
            console.log(`Logged in as ${DiscordBot.client?.user?.tag}!`);

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

        DiscordBot.client.on("guildCreate", guild => {
            console.log("Joined a new guild: " + guild.name);
            DataHandler.addServerdata(guild.id)
        })

        DiscordBot.client.on(Events.InteractionCreate, this.onInteractionCreate.bind(this));
        DiscordBot.client.login(token);
    }

    async onInteractionCreate(interaction: Interaction) {
            try {
                let command: Command = null;
                
                switch (interaction.constructor.name) {
                    case 'ChatInputCommandInteraction':
                        interaction = interaction as ChatInputCommandInteraction
                        command = this.commands.get(interaction?.commandName)
                        command.onCommand(interaction);
                        break;
                    case "ButtonInteraction":
                        interaction = interaction as ButtonInteraction
                        let commandName = interaction.message.interaction?.commandName?.split(' ')[0]
                        if (!commandName) commandName = (await DataHandler.getPoll(interaction.message.id) as PollJSON).command.split('/')[0]
                        command = this.commands.get(commandName)
                        command.onButtonPress(interaction);
                        break;
                }
            } catch (error) {
                console.error(error)
            }
    }





}
