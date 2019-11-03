import { ActionFunction, IChannelListApiResult, IOpenIMChannelApiResult, IUserInfoApiResult } from "../types";
import { ActionsBlock, Block, ChatPostMessageArguments, ContextBlock, DividerBlock, MessageAttachment, SectionBlock } from "@slack/web-api";
import { IActionResponse, IEloChange, INTERVALS, Intervals, Match, Player, Standings } from "@team-scott/domain";
import { buildCommandExample, buildErrorMessage, buildPlayerName } from "../helpers";

import COMMANDS from "./cmds";
import axios from 'axios';

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
    const errorMessage = buildErrorMessage(msg.channel, data);
    client.chat.postMessage(errorMessage);
    return;
  }
  
  message.text = data.details;

  client.chat.postMessage(message);
};

const changeNickname: ActionFunction<[string, string]> = async (
  client,
  msg,
  [name, nickname],
) => {
  console.log(name, nickname);
  console.log('[changeNickname]');
  const message: ChatPostMessageArguments = {
    text: '',
    channel: msg.channel,
  };

  const invalidNameText = 'Nickname was not updated. You must provide the user\'s name and the intended nickname. `!changeNickname <name/nickname/@slackId> <nickname>`';
  if (!name || !nickname) {
    message.text = invalidNameText;
    client.chat.postMessage(message);
    return;
  }

  const { data } = await axios.post<IActionResponse>('change-nickname', { name, nickname });

  if (data.error) {
    const errorMessage = buildErrorMessage(msg.channel, data);
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
        text: `*${command.name.charAt(0).toUpperCase()}${command.name.substr(1)}:*  \`${buildCommandExample(command)}\``,
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

  client.chat.postMessage(message);
};

const challengePlayer: ActionFunction<[string]> = async (
  client,
  msg,
  [name],
) => {
  console.log('[challengePlayer]');
  const channelMessage: ChatPostMessageArguments = {
    text: '',
    mrkdwn: true,
    channel: msg.channel,
    blocks: [],
  };

  const invalidNameText = 'PLACEHOLDER TEXT';

  if (!name) {
    channelMessage.text = invalidNameText;
    client.chat.postMessage(channelMessage);
    return;
  }

  const { data } = await axios.post<IActionResponse<Match>>('challenge-player', {
    initiator: msg.user,
    target: name,
  });

  if (data.error) {
    const errorMessage = buildErrorMessage(msg.channel, data);
    client.chat.postMessage(errorMessage);
    return;
  }

  const challengeStatementBlock: SectionBlock = {
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: `🏓🏓 ${data.details} 🏓🏓`,
    },
  };

  const initiator = data?.data?.initiator as Player;
  const target = data?.data?.target as Player;

  const targetChannel = await client.im.open({
    user: target.slackId,
    return_im: true,
  }) as IOpenIMChannelApiResult;

  const imMessage: ChatPostMessageArguments = {
    text: '',
    mrkdwn: true,
    channel: targetChannel.channel.id,
    blocks: [],
  };

  const initiatorName = buildPlayerName(initiator, true);

  const challengeIMBlock: SectionBlock = {
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: `You have been challenged to a match by ${initiatorName}`,
    },
  };

  console.log(challengeIMBlock);

  const actionBlock: ActionsBlock = {
    type: 'actions',
    elements: [
      {
        type: 'button',
        text: {
          type: 'plain_text',
          text: 'Accept',
        },
        style: 'primary',
        action_id: 'accept_challenge',
        value: data?.data?._id,
      },
      {
        type: 'button',
        text: {
          type: 'plain_text',
          text: 'Decline',
        },
        style: 'danger',
        action_id: 'decline_challenge',
        value: data?.data?._id,
      },
    ],
  };

  channelMessage.blocks = [
    challengeStatementBlock,
  ];

  imMessage.blocks = [
    challengeIMBlock,
    actionBlock,
  ];

  const { channels } = await client.channels.list() as IChannelListApiResult;
  const challengeChannel = channels.find(channel => channel.name === process.env.CHALLENGE_CHANNEL);

  if (challengeChannel) {
    channelMessage.channel = challengeChannel.id;
    client.chat.postMessage(channelMessage);
    client.chat.postMessage(imMessage);
    return;
  }

  channelMessage.text = `Could not find channel with name: ${process.env.CHALLENGE_CHANNEL}. Check your .env file.`;
  client.chat.postMessage(channelMessage);
};

const reportResult: ActionFunction<['win' | 'loss']> = async (
  client,
  msg,
  [matchResult],
) => {
  console.log('[reportResult]');
  console.log(msg);
  const message: ChatPostMessageArguments = {
    text: '',
    mrkdwn: true,
    channel: msg.channel,
  };

  if (!matchResult) {
    message.text = 'Missing command parameters';
    client.chat.postMessage(message);
    return;
  }

  if (!['win', 'loss'].includes(matchResult)) {
    message.text = 'Your command must be in the format `!submit <win / loss>';
    client.chat.postMessage(message);
    return
  }

  const payload = {
    slackId: msg.user,
    matchResult,
  };

  const { data } = await axios.post<IActionResponse<IEloChange>>('report-match-result', payload);

  if (data.error) {
    const errorMessage = buildErrorMessage(msg.channel, data);
    client.chat.postMessage(errorMessage);
    return;
  }

  const winner = data.data?.winner;
  const loser = data.data?.loser;

  const buildValue = (difference: number, original: number) => {
    let result = '';
    if (difference > 0) {
      result = `${original + difference} (+${difference})`;
    } else {
      result = `${original + difference} (${difference})`;
    }
    return result;
  };

  if (winner && loser) {
    const attachment: MessageAttachment = {
      text: '',
      fields: [{
        title: buildPlayerName(winner, true),
        value: buildValue(winner.difference, winner.originalElo),
        short: true,
      }, {
        title: buildPlayerName(loser, true),
        value: buildValue(loser.difference, loser.originalElo),
        short: true,
      }],
    }

    message.attachments = [attachment];
  }
  
  message.text = data.details;

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

const printStandings: ActionFunction<[Intervals]> = async (
  client,
  msg,
  [interval],
) => {
  console.log('printStandings');
  const message: ChatPostMessageArguments = {
    text: '',
    mrkdwn: true,
    channel: msg.channel,
    blocks: [],
  };

  if (!INTERVALS.includes(interval)) {
    message.text = `Your command must be in the format of \`${buildCommandExample(COMMANDS.printstandings)}\``;
    client.chat.postMessage(message);
    return;
  }
  const { data } = await axios.get<IActionResponse<Standings>>('print-standings', {
    params: {
      interval,
    },
  });

  
  const buildStandingsText = () => {
    let text = '```';
    const standings = data.data;
    interface IStandingTextChunk {
      accessor?: keyof Standings,
      value?: string | number,
      length?: number,
      alignment?: 'left' | 'right'
    }

    const MAX_LENGTHS: Record<keyof Standings, { length: number, alignment: 'left' | 'right' }> = {
      playerName: {
        length: 20,
        alignment: 'left',
      },
      wins: {
        length: 2,
        alignment: 'right',
      },
      losses: {
        length: 2,
        alignment: 'right',
      },
      eloChange: {
        length: 5,
        alignment: 'right',
      },
      currentElo: {
        length: 6,
        alignment: 'right',
      },
    };

    const setMaxLength = (values: Record<keyof Standings, string | number>) => {
      Object.entries(values).forEach(([accessor, value]) => {
        const valueLength = `${value}`.length;
        if (MAX_LENGTHS[accessor].length < valueLength) {
          MAX_LENGTHS[accessor].length = valueLength;
        }
      });
    };

    const normalizeValue = ({
      accessor,
      value,
      length = 0,
      alignment = 'left',
    }: IStandingTextChunk) => {
      let result = `${value}`;
      if (accessor) {
        length = MAX_LENGTHS[accessor].length;
        alignment = MAX_LENGTHS[accessor].alignment;
      }
      while (result.length < length) {
        if (alignment === 'left') {
          result += ' ';
        }
        if (alignment === 'right') {
          result = ` ${result}`;
        }
      }
      return result;
    }

    if (standings) {
      const standingsArray = Object.values(standings).sort((a, b) => {
        return (b.wins - b.losses) - (a.wins - a.losses);
      });
      standingsArray.forEach((entry) => {
        setMaxLength(entry);
      });
      const HEADER_CHUNKS: IStandingTextChunk[] = [
        { value: 'Name', length: MAX_LENGTHS.playerName.length },
        { value: 'W', accessor: 'wins' },
        { value: '-', length: 0 },
        { value: 'L', accessor: 'losses' },
        { value: '+/-', length: 5, alignment: 'right' },
        { value: 'Elo', accessor: 'currentElo' },
        { value: '+/-', accessor: 'eloChange'  },
      ];
      const headerLine = HEADER_CHUNKS.map(normalizeValue).join(' ');
      text += `${headerLine}\n`;

      const separatorLine = Array(headerLine.length).fill('-').join('');
      text += `${separatorLine}\n`;
      
      standingsArray.forEach(({
        playerName,
        wins,
        losses,
        eloChange,
        currentElo,
      }) => {
        const LINE_CHUNKS: IStandingTextChunk[] = [
          { accessor: 'playerName', value: playerName },
          { accessor: 'wins', value: wins },
          { value: '-', length: 0 },
          { accessor: 'losses', value: losses },
          { value: `${wins - losses >= 0 ? '+' : ''}${wins - losses}`, length: 5, alignment: 'right' },
          { accessor: 'currentElo', value: currentElo },
          { accessor: 'eloChange', value: `${eloChange >= 0 ? '+' : ''}${eloChange}` },
        ];
        const entryLine = LINE_CHUNKS.map(normalizeValue).join(' ');
        text += `${entryLine}\n`;
      });
    }
    text += '```';
    return text;
  }


  const titleBlock: SectionBlock = {
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: `*${data.details.charAt(0).toUpperCase()}${data.details.substr(1)}*`,
    },
  };

  const standingsBlock: SectionBlock = {
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: buildStandingsText(),
    },
  };

  message.blocks = [
    titleBlock,
    standingsBlock,
  ];

  client.chat.postMessage(message);
};

export {
  register,
  changeNickname,
  commands,
  challengePlayer,
  reportResult,
  printStandings,
};
