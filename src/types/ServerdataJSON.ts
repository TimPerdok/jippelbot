export type ServerConfig = {
    name: string
    voteChannel: string
    voiceChannelCategory: string
    textChannelCategory: string
    isDalleEnabled: boolean
    releaseChannel: string
}

export type Serverdatas = {
    [serverId: string]: ServerConfig
}

export type ServerdataJSONKey = keyof ServerConfig