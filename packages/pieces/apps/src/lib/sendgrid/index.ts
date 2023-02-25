import {createPiece} from '@activepieces/framework';
import { sendEmail } from './actions/send-email';

export const sendgrid = createPiece({
	name: 'sendgrid',
	displayName: "SendGrid",
	logoUrl: 'https://cdn.activepieces.com/pieces/sendgrid.png',
  version: '0.0.0',
	authors: ['ashrafsamhouri'],
	actions: [sendEmail],
	triggers: [],
});
