"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
    getAccessToken() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isExpired())
                return yield this.fetch();
            return TokenHandler_1.default.getTwitchAccessToken().accessToken;
        });
    }
    fetch() {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield axios_1.default.post('https://id.twitch.tv/oauth2/token', null, {
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
        });
    }
    isExpired() {
        const token = TokenHandler_1.default.getTwitchAccessToken();
        return token && token.expireTimestamp < Date.now();
    }
}
exports.default = TwitchAccessTokenHandler;
