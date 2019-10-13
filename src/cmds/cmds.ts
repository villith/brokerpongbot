import { challengePlayer, changeNickname, commands, register } from './actions';

import { CommandListMap } from '../types';

const COMMANDS: CommandListMap = {
  register: {
    name: "register",
    description: "Registers yourself as a player",
    aliases: [],
    action: register,
    roles: ['ADMIN', 'USER'],
    arguments: [],
  },
  commands: {
    name: "commands",
    description: "Displays a list of user commands",
    aliases: ["command", "commandlist", "listcommands"],
    action: commands,
    roles: ['ADMIN', 'USER'],
    arguments: [],
  },
  changenickname: {
    name: "changeNickname",
    description: "Changes a user's nickname",
    aliases: ["nickname"],
    action: changeNickname,
    roles: ['ADMIN', 'USER'],
    arguments: ['player', 'nickname'],
  },
  challengeplayer: {
    name: 'challengePlayer',
    description: 'Challenges another player to a game',
    aliases: ['challenge', 'play'],
    action: challengePlayer,
    roles: ['ADMIN', 'USER'],
    arguments: ['player/nickname']
  },
};

export default COMMANDS;
