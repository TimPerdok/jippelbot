import { describe, expect, test } from '@jest/globals';
import { Client } from 'discord.js';
import Vote from '../commands/vote';
import Renamechannel from '../commands/vote/Renamechannel';

describe('commands', () => {


    test('Vote', () => {
        const vote = new Renamechannel();
        expect(vote).toBeInstanceOf(Renamechannel);
    });


});