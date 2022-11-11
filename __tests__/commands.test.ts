import { describe, expect, test } from '@jest/globals';
import { Client } from 'discord.js';
import Renamechannel from '../src/commands/vote/Renamechannel';


describe('commands', () => {


    test('Vote', () => {
        const vote = new Renamechannel();
        expect(vote).toBeInstanceOf(Renamechannel);
    });


});