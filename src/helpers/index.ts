import { ChatPostMessageArguments, DividerBlock, MessageAttachment, SectionBlock } from "@slack/web-api";
import { IActionResponse, MATCH_STATUS_LABELS, Match, Player } from '@team-scott/domain';
import { IChannelListApiResult, ICommand, IMessageEvent, IResponseAction, IUserProfileApiResult, ResponseActions } from "../types";
import { client, userClient } from './slackClients';

import COMMANDS from "../cmds/cmds";
import RESPONSES from "../cmds/responses";
import axios from 'axios';

const executeCommand = async (msg: IMessageEvent) => {
  const { text } = msg;

  // Get everything after command initiator
  const content = text.slice(1);

  // Split into args
  const regex = new RegExp(/(?:"(.+?)" |'(.+?)' |(.+?) )/);
  const [accessor] = content.split(' ');
  const firstSpaceIndex = content.indexOf(' ');
  const parsedArgs = [];
  if (firstSpaceIndex !== -1) {
    let args = `${content.substring(firstSpaceIndex + 1)} `;
    while (true) {
      const match = regex.exec(args);
  
      if (!match) {
        break;
      }
  
      parsedArgs.push(match[3] || match[1] || match[2]);
  
      args = args.substr(match[0].length);
    }
  }
  console.log(parsedArgs);
  if (accessor) {
    const command = getCommand(accessor);
    if (command) {
      await command.action(client, msg, parsedArgs);
      await refreshCurrentMatches();
    }
    else {
      // msg.channel.send(`\`!${command}\` is not a command. Type \`!commands\` for a list of commands.`);
      console.log('cmd doesnt exist u idiot');
    }
  }
};

const getCommand = (accessor: string) => {
  let retVal = {} as ICommand<unknown>;
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

const buildErrorMessage = (channel: string, payload: IActionResponse<unknown>) => {
  const message: ChatPostMessageArguments = {
    text: '',
    mrkdwn: true,
    channel,
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

const buildPlayerName = (player: Player, mrkdwn = false) => {
  let playerName = '';
  const { nickname, emojiFlair } = player;
  let { name } = player;
  if (nickname) {
    playerName = `${nickname}`;
    if (mrkdwn) {
      name = `*(${name})*`;
    } else {
      name = `(${name})`;
    }
    playerName = `${playerName} ${name}`;
  } else {
    playerName = name;
  }
  if (emojiFlair) {
    playerName = `${playerName} ${emojiFlair}`;
  }
  return playerName; 
}

const buildMatchMessage = async (channel: string, match: Match) => {
  console.log('[buildMatchMessage]');
  const message: ChatPostMessageArguments = {
    text: '',
    mrkdwn: true,
    channel,
    blocks: [],
  };

  const { initiator, target } = match;

  const playerOne = initiator as Player;
  const playerTwo = target as Player;

  const slackPlayerOne = await userClient.users.profile.get({ user: playerOne.slackId }) as IUserProfileApiResult;
  const slackPlayerTwo = await userClient.users.profile.get({ user: playerTwo.slackId }) as IUserProfileApiResult;
  
  const statusBlock: SectionBlock = {
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: `🏓🏓 *MATCH ${MATCH_STATUS_LABELS[match.status].toUpperCase()}* 🏓🏓 ${match.acceptedAt ? ` - Started at *${match.acceptedAt}*` : ''}`,
    }
  };

  const dividerBlock: DividerBlock = {
    type: 'divider'
  };

  const playerBlocks = (player: Player, slackPlayer: IUserProfileApiResult) => {
    const playerName = buildPlayerName(player, true);
    return [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: playerName,
        },
        fields: [
          {
            type: "mrkdwn",
            text: "*Elo*\n1650"
          },
          {
            type: "mrkdwn",
            text: "*Record*\n100-5"
          }
        ],
        accessory: {
          type: "image",
          image_url: slackPlayer.profile.image_192,
          alt_text: player.name,
        }
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "*Recent Matches*"
        },
        fields: [
          {
            type: "mrkdwn",
            text: "vs. Raymond"
          },
          {
            type: "mrkdwn",
            text: "*VICTORY*"
          },
          {
            type: "mrkdwn",
            text: "vs. Raymond"
          },
          {
            type: "mrkdwn",
            text: "*VICTORY*"
          },
          {
            type: "mrkdwn",
            text: "vs. Raymond"
          },
          {
            type: "mrkdwn",
            text: "*VICTORY*"
          },
          {
            type: "mrkdwn",
            text: "vs. Raymond"
          },
          {
            type: "mrkdwn",
            text: "*VICTORY*"
          },
          {
            type: "mrkdwn",
            text: "vs. Raymond"
          },
          {
            type: "mrkdwn",
            text: "*VICTORY*"
          }
        ]
      }
    ]
  };

  message.blocks = [
    statusBlock,
    dividerBlock,
    ...playerBlocks(playerOne, slackPlayerOne),
    dividerBlock,
    ...playerBlocks(playerTwo, slackPlayerTwo),
    dividerBlock,
  ];

  return message;
};

const refreshCurrentMatches = async () => {
  const { channels } = await client.channels.list() as IChannelListApiResult;
  const matchStatusChannel = channels.find(channel => channel.name === process.env.MATCH_STATUS_CHANNEL);
  
  if (matchStatusChannel) {
    const { messages } = await userClient.channels.history({ channel: matchStatusChannel.id });
    const promises = Object.values(messages as object).map(message => userClient.chat.delete({
      channel: matchStatusChannel.id,
      ts: message.ts,
    }));
    await Promise.all(promises);
 
    const { data } = await axios.get<IActionResponse<Match[]>>('getOngoingMatches');    
  
    if (data?.data?.length) {
      const message = await buildMatchMessage(matchStatusChannel.id, data?.data?.[0]);
      client.chat.postMessage(message);
    }
  }
};

const handleUserResponse = async (payload: IResponseAction) => {
  const {
    actions,
    channel,
    message,
    user,
  } = payload;

  console.log('[handleUserResponse]');
  console.log(payload);

  const [action] = actions;
  const actionId = action?.action_id;

  if ({}.hasOwnProperty.call(RESPONSES, actionId)) {
    const responseAction = actionId as ResponseActions;
    const responseActionFunction = RESPONSES[responseAction];
    responseActionFunction(client, { action, channel, message, user });
    await refreshCurrentMatches();
  }
};

const buildCommandExample = (command: ICommand<unknown>) => 
  `${process.env.COMMAND_INITIATOR}${command.name}${command.arguments.map(arg => ` <${arg}>`).join('')}`;

export {
  buildErrorMessage,
  buildCommandExample,
  buildMatchMessage,
  buildPlayerName,
  client,
  getCommand,
  executeCommand,
  handleUserResponse,
  refreshCurrentMatches,
  userClient,
};
