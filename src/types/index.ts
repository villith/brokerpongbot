import { MessageAttachment, WebAPICallResult, WebClient } from "@slack/web-api";

import { Match } from "@team-scott/domain";

export type Commands = 'register'
| 'commands'
| 'changenickname'
| 'challengeplayer'
| 'reportresult';

export type ResponseActions = 'accept_challenge'
| 'decline_challenge';

export type ActionFunction<args = undefined> = (
  client: WebClient,
  msg: IMessageEvent,
  args: args
) => unknown;

export type ResponseActionFunction = (
  client: WebClient,
  details: {
    action: IAction;
    channel: Pick<IChannel, 'id' | 'name'>;
    match?: Match;
    user: IUser;
  },
) => unknown;

export type ResponseActionListMap = Record<ResponseActions, ResponseActionFunction>;
export type CommandListMap = Record<Commands, ICommand<unknown>>;

export type Permissions = 'ADMIN' | 'USER';

export interface IResponseAction {
  type: 'block_actions' | 'dialog' | 'interactive_message';
  team: ITeam;
  user: IUser;
  api_app_id: string;
  token: string;
  container: IContainer;
  trigger_id: string;
  channel: Pick<IChannel, 'id' | 'name'>;
  message: IMessageEvent;
  response_url: string;
  actions: IAction[]; // useless. array the actions within the blocks
}

interface IAction {
  action_id: string;
  block_id: string;
  value: string;
  style: string;
  type: string;
  action_ts: string;
}

interface IContainer {
  type: string;
  message_ts: string;
  channel_id: string;
  is_ephemeral: boolean;
}

interface IUser {
  id: string;
  username: string;
  name: string;
  team_id: string;
}

export interface ICommand<args> {
  name: string;
  description: string;
  aliases: string[];
  action: ActionFunction<args>;
  roles: Permissions[];
  arguments: string[];
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

export interface IUserProfileApiResult extends WebAPICallResult {
  profile: IProfile;
}
  
interface IProfile {
  avatar_hash: string;
  status_text: string;
  status_emoji: string;
  status_expiration: number;
  real_name: string;
  display_name: string;
  real_name_normalized: string;
  display_name_normalized: string;
  email: string;
  image_original: string;
  image_24: string;
  image_32: string;
  image_48: string;
  image_72: string;
  image_192: string;
  image_512: string;
  team: string;
}

export interface IChannelListApiResult extends WebAPICallResult {
  channels: IChannel[];
}

interface IChannel {
  id: string;
  name: string;
  is_channel: boolean;
  created: number;
  is_archived: boolean;
  is_general: boolean;
  unlinked: number;
  creator: string;
  name_normalized: string;
  is_shared: boolean;
  is_org_shared: boolean;
  is_member: boolean;
  is_private: boolean;
  is_mpim: boolean;
  members: string[];
  topic: ITopic;
  purpose: ITopic;
  previous_names: any[];
  num_members: number;
}

interface ITopic {
  value: string;
  creator: string;
  last_set: number;
}

export interface IUserInfoApiResult extends WebAPICallResult {
  user: IUserInfo;
}

interface IUserInfo {
  id: string;
  team_id: string;
  name: string;
  deleted: boolean;
  color: string;
  real_name: string;
  tz: string;
  tz_label: string;
  tz_offset: number;
  profile: IProfile;
  is_admin: boolean;
  is_owner: boolean;
  is_primary_owner: boolean;
  is_restricted: boolean;
  is_ultra_restricted: boolean;
  is_bot: boolean;
  updated: number;
  is_app_user: boolean;
  has_2fa: boolean;
}

interface IProfile {
  avatar_hash: string;
  status_text: string;
  status_emoji: string;
  real_name: string;
  display_name: string;
  real_name_normalized: string;
  display_name_normalized: string;
  email: string;
  image_original: string;
  image_24: string;
  image_32: string;
  image_48: string;
  image_72: string;
  image_192: string;
  image_512: string;
  team: string;
}

export interface IActionEvent {
  type: string;
  actions: IAction[];
  callback_id: string;
  team: ITeam;
  channel: IChannel;
  user: IChannel;
  action_ts: string;
  message_ts: string;
  attachment_id: string;
  token: string;
  is_app_unfurl: boolean;
  original_message: IOriginalMessage;
  response_url: string;
  trigger_id: string;
}

interface IOriginalMessage {
  type: string;
  subtype: string;
  text: string;
  ts: string;
  username: string;
  bot_id: string;
  attachments: MessageAttachment[];
}

interface IChannel {
  id: string;
  name: string;
}

interface ITeam {
  id: string;
  domain: string;
}

interface IAction {
  id: string;
  name: string;
  type: string;
  value: string;
  text: string;
  style: string;
}