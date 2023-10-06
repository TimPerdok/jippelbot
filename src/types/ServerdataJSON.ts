export type ServerdataJSON = {
    id: string
    voteChannel: string
    voiceChannelCategory: string
    textChannelCategory: string
    isDalleEnabled: boolean
}

export type ServerdataJSONKey = keyof ServerdataJSON