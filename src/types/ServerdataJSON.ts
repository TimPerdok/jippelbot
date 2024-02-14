export type ServerdataJSON = {
    voteChannel: string
    voiceChannelCategory: string
    textChannelCategory: string
    isDalleEnabled: boolean
    releaseChannel: string
}

export type Serverdatas = {
    [serverId: string]: ServerdataJSON
}

export type ServerdataJSONKey = keyof ServerdataJSON