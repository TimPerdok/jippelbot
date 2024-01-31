export type ServerdataJSON = {
    id: string
    voteChannel: string
    voiceChannelCategory: string
    textChannelCategory: string
    isDalleEnabled: boolean
    botspamChannel: string
}

export type ServerdataJSONKey = keyof ServerdataJSON