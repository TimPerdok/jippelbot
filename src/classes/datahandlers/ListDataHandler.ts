import path from 'path';
import {  IdentifiableItem } from "../../interfaces/MessageCarrier";
import { SRC_DIR } from "../../Constants";
import JSONDataHandler from "./JSONDataHandler";
import type { Game } from "../../api/IGDB";

export type ServerScoped<JSONData> = {
    [guildId: string]: JSONData
}

export default class ListDataHandler<T extends IdentifiableItem[]> extends JSONDataHandler<T> {
   
    async remove(serverId: string, id: string | number): Promise<void> {
        let list = await this.getOfServer(serverId)
        list = list.filter((item: IdentifiableItem) => item.id !== id) as T
        await this.overwrite(serverId, list)
    }

    async add(serverId: string, data: IdentifiableItem): Promise<void> {
        let list = await this.getOfServer(serverId)
        list.push(data)
        await this.overwrite(serverId, list)
    }

    async getItem(serverId: string, id: string | number): Promise<IdentifiableItem | undefined> {
        const list = await this.getOfServer(serverId)
        return list.find((item: IdentifiableItem) => item.id === id)
    }


}
