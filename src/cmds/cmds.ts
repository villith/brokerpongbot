import { addPlayer, commands } from './actions';

import { CommandListMap } from '../types';

const COMMANDS: CommandListMap = {
  addPlayer: {
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
  }
};

export default COMMANDS;
