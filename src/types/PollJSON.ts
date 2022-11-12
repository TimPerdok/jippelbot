export type PollJSON = {
    question: string
    initiatorId: string
    votes: {
        [key: string]: boolean
    }
    startTimestampUnix: number
    subcommand: string
    messageId: string
    channelId: string
};