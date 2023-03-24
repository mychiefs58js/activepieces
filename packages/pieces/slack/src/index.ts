import { createPiece } from '@activepieces/framework'
import { slackSendDirectMessageAction } from './lib/actions/send-direct-message-action'
import { slackSendMessageAction } from './lib/actions/send-message-action'
import { version } from '../package.json'
import { newMessage as newSlackMessage } from './lib/triggers/new-message'
import crypto from 'crypto'
import { newReactionAdded } from './lib/triggers/new-reaction-added'

export const slack = createPiece({
  name: 'slack',
  displayName: 'Slack',
  logoUrl: 'https://cdn.activepieces.com/pieces/slack.png',
  version,
  actions: [
    slackSendDirectMessageAction,
    slackSendMessageAction,
  ],
  events: {
    parseAndReply: ({ payload }) => {
      if (payload.body['challenge']) {
        return {
          reply: {
            body: payload.body['challenge'],
            headers: {}
          }
        };
      }
      return { event: payload.body?.event?.type, identifierValue: payload.body.team_id}
    },
    verify: ({ webhookSecret, payload }) => {
      // Construct the signature base string
      const timestamp = payload.headers['x-slack-request-timestamp'];
      const signature = payload.headers['x-slack-signature'];
      const signatureBaseString = `v0:${timestamp}:${payload.rawBody}`;
      const hmac = crypto.createHmac('sha256', webhookSecret);
      hmac.update(signatureBaseString);
      const computedSignature = `v0=${hmac.digest('hex')}`;
      return signature === computedSignature;
    }
  },
  triggers: [newSlackMessage, newReactionAdded]
})
