
import { PieceAuth, createPiece } from '@activepieces/pieces-framework';
import { renderTemplate } from './lib/actions/renderTemplate.action';

const markdownDescription = `
To obtain your GenerateBanners public and secret API Keys, you can follow the steps below:

1. Go to the [GenerateBanners homepage](https://www.generatebanners.com/).
2. Sign up or log in into your account.
3. Go to your [account page](https://www.generatebanners.com/app/account).
4. The public and secret API keys are now displayed, copy them one by one into the right Activepieces fields.
`;

export const generatebannersAuth = PieceAuth.BasicAuth({
  displayName: 'API Key',
  description: markdownDescription,
  required: true,
  username: {
    displayName: 'Public API Key',
  },
  password: {
    displayName: 'Secret API Key',
  },
})

export const generatebanners = createPiece({
  displayName: 'GenerateBanners',
      minimumSupportedRelease: '0.5.0',
    logoUrl: 'https://cdn.activepieces.com/pieces/generatebanners.png',
  authors: [
  ],
  auth: generatebannersAuth,
  actions: [
    renderTemplate
  ],
  triggers: [
  ],
});
