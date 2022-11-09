import { Client, Collection, Events, GatewayIntentBits, Guild, Interaction, REST, Routes, SlashCommandBuilder } from "discord.js";
import { ClientI } from "./Client";
import Command from "./Command";
import ServerREST from "./ServerRest";




export default class DiscordBot {

    rest: REST;

    client: Client;

    serverRESTS: ServerREST[]

    commands: Collection<string, Command>

    get servers() {
        return this.client.guilds.cache
    }

    constructor(token: string, clientId: string, commands: Collection<string, Command>) {
        this.rest = new REST({ version: '10' }).setToken(token);
        this.client = new Client({ intents: [GatewayIntentBits.Guilds] });
        this.commands = commands
        this.serverRESTS = []




        this.client.on('ready', () => {
            console.log(`Logged in as ${this.client?.user?.tag}!`);
            this.serverRESTS = this.servers.map((server: Guild) => {
                return new ServerREST(this.rest, server, clientId)
            })
            this.serverRESTS.forEach((rest) => {
                rest.updateCommands(commands)
            })
        });




        this.client.on(Events.InteractionCreate, async (interaction: any) => {
            try {
                const commandName = interaction.commandName ?? interaction.message.interaction.commandName.split(' ')[0]
                const command = this.commands.get(commandName)
                if (!command) return;
                switch (interaction.constructor.name) {
                    case 'ChatInputCommandInteraction':
                        command.onReply(this.client, interaction);
                        break;
                    case "ButtonInteraction":
                        command.onButtonPress(this.client, interaction);
                        break;
                }
            } catch (error) {
                console.error(error)
            }
        });


        this.client.login(token);
    }





}
