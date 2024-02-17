"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class IGDB {
    static statusToString(status) {
        return ["Onbekend", "Alpha", "Beta", "Early Access", "Offline", "Cancelled", "Full Release"][status];
    }
}
IGDB.gameFields = [
    'id',
    'name',
    'url',
    'release_dates',
    'cover',
    'websites'
].join(',');
IGDB.baseUrl = 'https://api.igdb.com/v4';
exports.default = IGDB;
