import { challengePlayer, changeNickname, commands, printStandings, register, reportResult } from './actions';

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
    arguments: ['player/nickname/@slackId']
  },
  reportresult: {
    name: 'reportResult',
    description: 'Reports the result of a completed game',
    aliases: ['submit', 'submitresult'],
    action: reportResult,
    roles: ['ADMIN', 'USER'],
    arguments: ['win / loss']
  },
  printstandings: {
    name: 'printStandings',
    description: 'Prints the standings of the specified time interval',
    aliases: ['standings', 'leaderboard'],
    action: printStandings,
    roles: ['ADMIN', 'USER'],
    arguments: ['daily / weekly / monthly / yearly'],
  },
};

export default COMMANDS;
