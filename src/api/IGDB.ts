

export type Game = {
    id: number
    name: string
    url: string
    currentReleaseStatus: number
    release_dates?: number[]
    nextReleaseDate?: number
    nextReleaseStatus?: number
    cover: number
    userDescription?: string
    websites: number[]
}

export type ReleaseDate = {
    id: number
    game: number
    status: number
    date: number
}



class IGDB {

    static gameFields = [
        'id',
        'name',
        'url',
        'release_dates',
        'cover',
        'websites'
    ].join(',');

    static baseUrl = 'https://api.igdb.com/v4';

    static statusToString(status: number): string {
        return ["Onbekend", "Alpha", "Beta", "Early Access", "Offline", "Cancelled", "Full Release"][status]
    }

}

export default IGDB;
