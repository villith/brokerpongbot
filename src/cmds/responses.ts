import { acceptChallenge, declineChallenge } from './reponseActions';

import { ResponseActionListMap } from '../types';

const RESPONSES: ResponseActionListMap = {
  accept_challenge: acceptChallenge,
  decline_challenge: declineChallenge,
};

export default RESPONSES;