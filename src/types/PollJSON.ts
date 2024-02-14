export class PollJSON {
    question: string
    initiatorId: string
    votes: {
        [key: string]: boolean
    }
    startTimestampUnix: number
    command: string
    messageId: string
    channelId: string
    params: {
        [key: string]: string
    }

    get id() {
        return this.messageId
    }

};