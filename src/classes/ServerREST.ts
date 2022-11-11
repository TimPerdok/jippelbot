import { Client, Collection, Events, GatewayIntentBits, Guild, REST, Routes, SlashCommandBuilder } from "discord.js";
import Command from "./Command";




export default class ServerREST {

    server: Guild;
    rest: REST;
    clientId: string;

    constructor(rest: REST, server: Guild, clientId: string) {
        this.rest = rest
        this.server = server
        this.clientId = clientId
    }

    updateCommands(commands: Collection<string, Command>) {
        console.log(commands)
        this.rest.put(
            Routes.applicationGuildCommands(this.clientId, this.server.id),
            {
                body: [...commands.values()].map((command: Command)=>{return command.data.toJSON()})
            },
        )
    }


   


}
