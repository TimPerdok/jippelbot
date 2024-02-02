export type ServerdataJSON = {
    voteChannel: string
    voiceChannelCategory: string
    textChannelCategory: string
    isDalleEnabled: boolean
    releaseChannel: string
}

export type ServerdataJSONKey = keyof ServerdataJSON