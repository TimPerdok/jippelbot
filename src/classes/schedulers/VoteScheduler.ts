import DiscordBot from "../Bot";
import { Guild } from "discord.js";
import ScheduledAction from "./messageupdaters/ScheduledActionWrapper";
import Poll from "../data/Poll";
import { VoteAction } from "../data/VoteActions";
import { PollJSON } from "../../types/PollJSON";


export default class VoteScheduler  {

    scheduledActions: ScheduledAction[];

    constructor(private guild: Guild) {
        this.scheduledActions = this.createScheduledActions()
    }

    createScheduledActions() {
        const polls = DiscordBot.getInstance().dataHandlers.poll.getAllOfServer(this.guild.id).map((poll) => Poll.fromItem(poll))
        return polls.map((poll) => new ScheduledAction({
            callback: async () => {
                const newPoll = await DiscordBot.getInstance().dataHandlers.poll.getItem(this.guild.id, poll.id) as PollJSON<VoteAction>
                if (!newPoll) return
                Poll.fromItem(newPoll).finish()
            },
            at: poll.hasPassed ? new Date() : new Date((poll.endDate * 1000))
        }))
    }

    addPoll(poll: Poll<VoteAction>) {
        this.scheduledActions.push(new ScheduledAction({
            callback: async () => {
                const newPoll = await DiscordBot.getInstance().dataHandlers.poll.getItem(this.guild.id, poll.id) as PollJSON<VoteAction>
                if (!newPoll) return
                Poll.fromItem(newPoll).finish()
            },
            at: poll.hasPassed ? new Date() : new Date((poll.endDate * 1000))
        }))
    }

    async reschedule() {
        await Promise.all(this.scheduledActions.map((action) => action.stop()))
        this.scheduledActions = this.createScheduledActions()
    }



}


