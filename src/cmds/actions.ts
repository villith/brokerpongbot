import { ActionFunction, IChannelListApiResult, IUserInfoApiResult } from "../types";
import { ActionsBlock, Block, ChatPostMessageArguments, ContextBlock, DividerBlock, SectionBlock } from "@slack/web-api";

import COMMANDS from "./cmds";
import { IActionResponse } from "@team-scott/domain";
import axios from 'axios';
import { buildErrorMessage } from "../helpers";

const register: ActionFunction = async (
  client,
  msg,
) => {
  console.log('[register]');
  const message: ChatPostMessageArguments = {
    text: '',
    channel: msg.channel,
  };

  const { user } = await client.users.info({ user: msg.user }) as IUserInfoApiResult;

  const { data } = await axios.post<IActionResponse>('register', {
    slackId: msg.user,
    name: user.real_name,
  });

  if (data.error) {
    const errorMessage = buildErrorMessage(msg, data);
    client.chat.postMessage(errorMessage);
    return;
  }
  
  message.text = data.details;

  client.chat.postMessage(message);
};

const changeNickname: ActionFunction = async (
  client,
  msg,
  name,
  nickname,
) => {
  console.log(name, nickname);
  console.log('[changeNickname]');
  const message: ChatPostMessageArguments = {
    text: '',
    channel: msg.channel,
  };

  const invalidNameText = 'Nickname was not updated. You must provide the user\'s name and the intended nickname. `!changeNickname <name> <nickname>`';
  if (!name || !nickname) {
    message.text = invalidNameText;
    client.chat.postMessage(message);
    return;
  }

  const { data } = await axios.post<IActionResponse>('change-nickname', { name, nickname });

  if (data.error) {
    const errorMessage = buildErrorMessage(msg, data);
    client.chat.postMessage(errorMessage);
    return;
  }
  
  message.text = data.details;

  client.chat.postMessage(message);
};

// const getStandings: ActionFunction = (
//   client,
//   msg,
//   args,
// ) => {

// };

const commands: ActionFunction = (
  client,
  msg,
) => {
  const message: ChatPostMessageArguments = {
    text: '',
    mrkdwn: true,
    channel: msg.channel,
    blocks: [],
  };

  const blocks: Block[] = Object.entries(COMMANDS).reduce((acc, [key, command], index) => {
    const commandBlock: SectionBlock = {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*${command.name.charAt(0).toUpperCase()}${command.name.substr(1)}:*  \`${process.env.COMMAND_INITIATOR}${command.name}${command.arguments.map(arg => ` <${arg}>`).join('')}\``,
      },
    };
    const descriptionBlock: SectionBlock = {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*Description:*\n${command.description}`,
      },
    };

    acc.push(commandBlock, descriptionBlock);

    if (command.aliases.length > 0) {
      const aliasBlock: ContextBlock = {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: '*Aliases:*',
          },
          {
            type: 'mrkdwn',
            text: `\`${command.aliases.join(', ')}\``,
          },
        ],
      };
      acc.push(aliasBlock);
    }

    if (index !== Object.keys(COMMANDS).length - 1) {
      const dividerBlock: DividerBlock = { type: 'divider' };

      acc.push(dividerBlock);
    }
    return acc;
  }, [] as Block[]);

  const actionBlock: ActionsBlock = {
    type: 'actions',
    elements: [
      {
        type: 'button',
        text: {
          type: 'plain_text',
          emoji: true,
          text: 'Approve',
        },
        style: 'primary',
        value: 'test_button',
      },
    ],
  };

  blocks.push(actionBlock);

  message.blocks!.push(...blocks);

  console.dir(message.blocks, { depth: null });

  console.log('posting message');
  client.chat.postMessage(message);
};

const challengePlayer: ActionFunction = async (
  client,
  msg,
  name,
) => {
  console.log('[challengePlayer]');
  const message: ChatPostMessageArguments = {
    text: '',
    channel: msg.channel,
  };

  const invalidNameText = 'PLACEHOLDER TEXT';

  if (!name) {
    message.text = invalidNameText;
    client.chat.postMessage(message);
    return;
  }

  const { data } = await axios.post<IActionResponse>('challenge-player', {
    initiator: msg.user,
    target: name,
  });

  if (data.error) {
    const errorMessage = buildErrorMessage(msg, data);
    client.chat.postMessage(errorMessage);
    return;
  }

  message.text = data.details;

  const { channels } = await client.channels.list() as IChannelListApiResult;
  const challengeChannel = channels.find(channel => channel.name === process.env.CHALLENGE_CHANNEL);

  if (challengeChannel) {
    message.channel = challengeChannel.id;
    client.chat.postMessage(message);
    return;
  }

  message.text = `Could not find channel with name: ${process.env.CHALLENGE_CHANNEL}. Check your .env file.`;
  client.chat.postMessage(message);
};

// const openChallenge: ActionFunction = async (
//   client,
//   msg,
// ) => {
//   console.log('[openChallenge]');
//   const message: ChatPostMessageArguments = {
//     text: '',
//     channel: msg.channel,
//   };
// }

export {
  register,
  changeNickname,
  commands,
  challengePlayer,
};
