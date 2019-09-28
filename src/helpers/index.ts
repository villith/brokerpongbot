import { ChatPostMessageArguments, MessageAttachment, WebClient } from "@slack/web-api";
import { IActionResponse, Match, Player } from '@team-scott/domain';
import { ICommand, IMessageEvent } from "../types";

import COMMANDS from "../cmds/cmds";

const executeCommand = (msg: IMessageEvent, client: WebClient) => {
  const { text } = msg;
  
  // Get everything after command initiator
  const content = text.slice(1);

  // Split into args
  const [accessor] = content.split(' ');
  const firstSpaceIndex = content.indexOf(' ');
  const args = [];
  if (firstSpaceIndex !== -1) {
    args.push(...content
      .substring(firstSpaceIndex + 1)
      .split('"')
      .map(arg => arg.trim())
      .filter(arg => arg)
    );
  }
  console.log('aaa');
  console.log(accessor, args);
  if (accessor) {
    console.log('bbb');
    const command = getCommand(accessor);
    if (command) {
      console.log('ccc');
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
    if (normalizedAliases.includes(normalized)) {
      retVal = command;
      break;
    }
  }
  return retVal;
};

const buildErrorMessage = (msg: IMessageEvent, payload: IActionResponse) => {
  const message: ChatPostMessageArguments = {
    text: '',
    mrkdwn: true,
    channel: msg.channel,
  };

  const attachment: MessageAttachment = {
    // author_name: '☁️ THE CLOUD ☁️',
    text: '',
    fields: [{
      title: 'Error',
      value: payload.error!,
    }],
    color: 'danger'
  };

  message.attachments = [attachment];

  return message;
};

const buildMatchMessage = (channel: string, match: Match) => {
  const message: ChatPostMessageArguments ={
    text: '',
    mrkdwn: true,
    channel,
    blocks: [],
  };

  const { initiator, target } = match;
  // (initiator as Player).

  return message;
}

export {
  buildErrorMessage,
  buildMatchMessage,
  getCommand,
  executeCommand,
};
