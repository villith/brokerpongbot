import { WebClient } from "@slack/web-api";

export type Commands = 'addPlayer' | 'commands';

export type Action = (
  client: WebClient,
  msg: IMessageEvent,
  ...args: unknown[]
) => unknown;

export type CommandListMap = Record<Commands, ICommand>;

export interface ICommand {
  name: string;
  description: string;
  aliases: string[];
  action: Action;
}

export interface IMessageEvent {
  client_msg_id: string;
  type: string;
  text: string;
  user: string;
  ts: string;
  team: string;
  channel: string;
  event_ts: string;
  channel_type: string;
}
