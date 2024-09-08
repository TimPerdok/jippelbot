"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const TokenHandler_1 = __importDefault(require("../classes/datahandlers/TokenHandler"));
class TwitchAccessTokenHandler {
    constructor(twitchAccessToken) {
        this.grantType = "client_credentials";
        this.clientId = twitchAccessToken.clientId;
        this.clientSecret = twitchAccessToken.clientSecret;
    }
    async getAccessToken() {
        if (this.isExpired())
            return await this.fetch();
        return TokenHandler_1.default.getTwitchAccessToken().accessToken;
    }
    async fetch() {
        const response = await axios_1.default.post('https://id.twitch.tv/oauth2/token', null, {
            params: {
                client_id: this.clientId,
                client_secret: this.clientSecret,
                grant_type: this.grantType,
            },
        });
        TokenHandler_1.default.setTwitchAccessToken({
            accessToken: response.data.access_token,
            expireTimestamp: Date.now() + response.data.expires_in * 1000,
        });
        return response.data.access_token;
    }
    isExpired() {
        const token = TokenHandler_1.default.getTwitchAccessToken();
        return token && token.expireTimestamp < Date.now();
    }
}
exports.default = TwitchAccessTokenHandler;
