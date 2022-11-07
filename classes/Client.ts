import { Client, Collection } from "discord.js";
import Command from "./Command";




export interface ClientI extends Client {

    commands: Collection<string, Command>;
   


}
