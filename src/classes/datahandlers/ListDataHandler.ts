import path from 'path';
import {  DataJSON, IdentifiableItem } from "../../interfaces/MessageCarrier";
import { SRC_DIR } from "../../Constants";
import JSONDataHandler from "./JSONDataHandler";
import type { Game } from "../../api/IGDB";
import Poll from '../Poll';

export type ServerScoped<JSONData> = {
    [guildId: string]: JSONData
}

export default class ListDataHandler<T extends IdentifiableItem[]> extends JSONDataHandler<T> {
    
    async set(serverId: string, item: IdentifiableItem) {
        const list = this.getOfServer(serverId)
        const foundItem = list.find((i: IdentifiableItem) => i.id === item.id)
        if (foundItem) {
            list[list.indexOf(foundItem)] = item
            this.overwrite(serverId, list)
        }
        else this.add(serverId, item)
    }
   
    async remove(serverId: string, id: string | number): Promise<void> {
        let list = await this.getOfServer(serverId)
        list = list.filter((item: IdentifiableItem) => item.id !== id) as T
        await this.overwrite(serverId, list)
    }

    async add(serverId: string, item: IdentifiableItem): Promise<void> {
        let list = await this.getOfServer(serverId)
        list.push(item)
        await this.overwrite(serverId, list)
    }

    async getItem(serverId: string, id: string | number): Promise<IdentifiableItem | undefined> {
        const list = await this.getOfServer(serverId)
        return list.find((item: IdentifiableItem) => item.id === id)
    }

    getOfServer(serverId: string): T {
        const file = this.read(this.file) as ServerScoped<T>
        return file[serverId] ?? []
    }


}
