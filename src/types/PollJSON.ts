import { VoteAction } from "../classes/data/VoteActions";

export type PollJSON<T extends VoteAction> = {
    id: string,
    yesCount: number,
    noCount: number,
    endDate: number,
    initiator: string,
    channelId: string,
    action: T,
    question: string,
    votedUsers: string[]
};