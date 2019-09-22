import { addPlayer, changeNickname, commands } from './actions';

import { CommandListMap } from '../types';

const COMMANDS: CommandListMap = {
  addplayer: {
    name: "addPlayer",
    description: "Adds a player to the bot",
    aliases: ["addUser", "newPlayer", "newUser"],
    action: addPlayer,
  },
  commands: {
    name: "commands",
    description: "Displays a list of user commands",
    aliases: ["command", "commandlist", "listcommands"],
    action: commands,
  },
  changenickname: {
    name: "changeNickname",
    description: "Changes a user's nickname",
    aliases: ["nickname"],
    action: changeNickname,
  },
};

export default COMMANDS;
