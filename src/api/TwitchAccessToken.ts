import axios from 'axios';
import TokenHandler from '../classes/datahandlers/TokenHandler';

export type TwitchAccessTokenJSON = {
    accessToken: string
    expireTimestamp: number
}

export type TwitchAuth = {
    clientId: string
    clientSecret: string
}

export default class TwitchAccessTokenHandler {
    public clientId: string;
    public clientSecret: string;
    public grantType: string = "client_credentials";

    constructor(twitchAccessToken: TwitchAuth) {
        this.clientId = twitchAccessToken.clientId;
        this.clientSecret = twitchAccessToken.clientSecret;
    }

    public async getAccessToken(): Promise<string> {
        if (!this.isExpired()) return await this.fetch();
        return TokenHandler.getTwitchAccessToken().accessToken;
    }
    public async fetch(): Promise<string> {
        const response = await axios.post('https://id.twitch.tv/oauth2/token', null, {
            params: {
                client_id: this.clientId,
                client_secret: this.clientSecret,
                grant_type: this.grantType,
            },
        });
        TokenHandler.setTwitchAccessToken({
            accessToken: response.data.access_token,
            expireTimestamp: Date.now() + response.data.expires_in * 1000,
        } as TwitchAccessTokenJSON);
        return response.data.access_token;
    }

    isExpired(): boolean {
        const token = TokenHandler.getTwitchAccessToken();
        return token && token.expireTimestamp < Date.now();
    }
    
}

