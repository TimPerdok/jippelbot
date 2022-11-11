import { Client } from "discord.js";
import Option from "./Option"
import ExecutableCommand from "../interfaces/ExecutableCommand";


export default abstract class Subcommand implements ExecutableCommand {

    name: string
    description: string


    abstract data(subcommand: any): any

    constructor(name: string, description: string) {
        this.name = name
        this.description = description
    }

    abstract onReply(client: Client<boolean>, interaction: any): any
    abstract onButtonPress(client: Client<boolean>, interaction: any): any





}
