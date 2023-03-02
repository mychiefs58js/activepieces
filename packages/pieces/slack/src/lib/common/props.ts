import { Property } from '@activepieces/framework'

export const slackAuth = Property.OAuth2({
  description: '',
  displayName: 'Authentication',
  authUrl: 'https://slack.com/oauth/authorize',
  tokenUrl: 'https://slack.com/api/oauth.access',
  required: true,
  scope: [
    'channels:read',
    'channels:write',
    'channels:history',
    'chat:write:bot',
    'groups:read',
    'mpim:read',
    'users:read',
  ],
})
