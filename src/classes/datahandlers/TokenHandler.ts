import path from 'path';
import fs from 'fs';
import { SRC_DIR } from "../../Constants";
import { TwitchAccessTokenJSON } from "../../api/TwitchAccessToken";
import { DataJSON } from './JSONDataHandler';


const dataFolder = require('path').resolve(SRC_DIR, '..')

export default class TokenHandler {

    static files = {twitchaccesstoken: "twitchaccesstoken.json"}

    static init() {
        const folder = path.join(dataFolder, `/shareddata`)
        if (!fs.existsSync(folder)) fs.mkdirSync(folder)
        Object.entries(TokenHandler.files).forEach(([key, value])=>{
            const file = path.join(dataFolder, `/shareddata/${value}`)
            if (fs.existsSync(file)) return;
            fs.writeFileSync(file, JSON.stringify({}))
        })
    }

    static write(file: string, data: DataJSON) {
        if (!fs.existsSync(file)) TokenHandler.init()
        fs.writeFileSync(path.join(dataFolder, `/shareddata/${file}`), JSON.stringify(data))
    }

    static read(file: string): DataJSON {
        file = path.join(dataFolder, `/shareddata/${file}`)
        if (!fs.existsSync(file)) TokenHandler.init()
        return JSON.parse(fs.readFileSync(file, 'utf8'))
    }
    
    static getTwitchAccessToken(): TwitchAccessTokenJSON {
        const file = path.join(dataFolder, `/shareddata/${TokenHandler.files.twitchaccesstoken}`)
        if (!fs.existsSync(file)) return {accessToken: "", expireTimestamp: 0}
        return JSON.parse(fs.readFileSync(file, 'utf8'))
    }

    static setTwitchAccessToken(token: TwitchAccessTokenJSON) {
        TokenHandler.write(TokenHandler.files.twitchaccesstoken, token)
    }

}
