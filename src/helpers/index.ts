import { ICommand, IMessageEvent } from "../types";

import COMMANDS from "../cmds/cmds";
import { WebClient } from "@slack/web-api";

const executeCommand = (msg: IMessageEvent, client: WebClient) => {
  const { text } = msg;
  
  // Get everything after command initiator
  const content = text.slice(1);

  // Split into args
  const [accessor, ...args] = content.split(' ');

  if (accessor) {
    const command = getCommand(accessor);
    if (command) {
      command.action(client, msg, ...args);
    }
    else {
      // msg.channel.send(`\`!${command}\` is not a command. Type \`!commands\` for a list of commands.`);
      console.log('cmd doesnt exist u idiot');
    }
  }
};

const getCommand = (accessor: string) => {
  let retVal = {} as ICommand;
  const normalized = accessor.toLowerCase().trim();
  if ({}.hasOwnProperty.call(COMMANDS, normalized)) {
    retVal = COMMANDS[normalized];
    return retVal;
  }
  const values = Object.values(COMMANDS);
  for (const command of values) {
    const normalizedAliases = command.aliases.map(alias => alias.toLowerCase());
    if (normalizedAliases.includes[normalized]) {
      retVal = command;
      break;
    }
  }
  return retVal;
};

export {
  getCommand,
  executeCommand,
};
