import { ChatPostMessageArguments, DividerBlock, MessageAttachment, SectionBlock, WebClient } from "@slack/web-api";
import { IActionResponse, MATCH_STATUS_LABELS, Match, Player } from '@team-scott/domain';
import { ICommand, IMessageEvent, IUserProfileApiResult } from "../types";

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

const buildMatchMessage = async (client: WebClient, channel: string, match: Match) => {
  console.log('[buildMatchMessage]');
  const message: ChatPostMessageArguments = {
    text: '',
    mrkdwn: true,
    channel,
    blocks: [],
  };

  const { initiator, target } = match;

  // Temporary until I understand how typegoose wants to you to use populated values
  const playerOne = initiator as Player;
  const playerTwo = target as Player;

  const slackPlayerOne = await client.users.profile.get({ user: playerOne.slackId }) as IUserProfileApiResult;
  const slackPlayerTwo = await client.users.profile.get({ user: playerTwo.slackId }) as IUserProfileApiResult;
  
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

  const playerBlocks = (player: Player, slackPlayer: IUserProfileApiResult) => ([
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `${player.nickname} *(${player.name})* ${player.emojiFlair}`,
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
  ]);

  message.blocks = [
    statusBlock,
    dividerBlock,
    ...playerBlocks(playerOne, slackPlayerOne),
    dividerBlock,
    ...playerBlocks(playerTwo, slackPlayerTwo),
    dividerBlock,
  ];

  return message;
}

export {
  buildErrorMessage,
  buildMatchMessage,
  getCommand,
  executeCommand,
};
