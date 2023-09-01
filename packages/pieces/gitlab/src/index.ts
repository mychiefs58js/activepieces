import { createPiece, PieceAuth } from '@activepieces/pieces-framework';
import { gitlabIssuesEvent } from './lib/trigger/issue-event';

export const gitlabAuth = PieceAuth.OAuth2({
  required: true,
  authUrl: 'https://gitlab.com/oauth/authorize',
  tokenUrl: 'https://gitlab.com/oauth/token',
  scope: ['api', 'read_user'],
});

export const gitlab = createPiece({
  displayName: 'Gitlab',
  auth: gitlabAuth,
  minimumSupportedRelease: '0.7.1',
  logoUrl: 'https://cdn.activepieces.com/pieces/gitlab.png',
  authors: [],
  actions: [],
  triggers: [gitlabIssuesEvent],
});
