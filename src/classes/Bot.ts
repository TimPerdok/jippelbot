import { Client, Collection, Events, GatewayIntentBits, Guild, Interaction, REST, Routes, SlashCommandBuilder } from "discord.js";
import Classfinder from "./Classfinder";
import Command from "./Command";
import ServerREST from "./ServerRest";



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
        DiscordBot.client = new Client({ intents: [GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent,
            GatewayIntentBits.GuildMembers] });
        this.serverRESTS = []
        this.commands = new Collection<string, Command>();



        DiscordBot.client.on('ready', async () => {
            console.log(`Logged in as ${DiscordBot.client?.user?.tag}!`);


            const commands = await Classfinder.getClasses("commands")
            
            commands.forEach(({ value }: any) => {
                if (!value) return console.error("Command error")
                const command = new value.default()
                this.commands.set(command.name, command)
            });

            this.serverRESTS = this.servers.map((server: Guild) => {
                return new ServerREST(this.rest, server, clientId)
            })
            this.serverRESTS.forEach((rest) => {
                rest.updateCommands(this.commands)
            })
        });




        DiscordBot.client.on(Events.InteractionCreate, async (interaction: any) => {
            try {
                const commandName = interaction.commandName ?? interaction.message.interaction.commandName.split(' ')[0]
                const command = this.commands.get(commandName)
                if (!command) return;
                switch (interaction.constructor.name) {
                    case 'ChatInputCommandInteraction':
                        command.onReply(DiscordBot.client, interaction);
                        break;
                    case "ButtonInteraction":
                        command.onButtonPress(DiscordBot.client, interaction);
                        break;
                }
            } catch (error) {
                console.error(error)
            }
        });


        DiscordBot.client.login(token);
    }





}
