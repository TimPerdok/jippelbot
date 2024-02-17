import { Item } from "../datahandlers/JSONDataHandler"



export default abstract class Sobject {

    static fromItem(item: Item): Sobject {
        throw new Error("Method not implemented.")
    }

    static fromJSON(json: string): Sobject {
        throw new Error("Method not implemented.")
    }

    static toJSON(): string {
        return JSON.stringify(this)
    }

}