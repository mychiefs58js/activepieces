import { createPiece } from '@activepieces/framework';
import { gmailGetEmail } from './lib/actions/get-mail-action';
import { gmailGetThread } from './lib/actions/get-thread-action';
import { gmailSearchMail } from './lib/actions/search-email-action';
import { gmailSendEmailAction } from './lib/actions/send-email-action';
import { gmailNewEmailTrigger } from './lib/triggers/new-email';

export const gmail = createPiece({
	name: 'gmail',
	logoUrl: 'https://cdn.activepieces.com/pieces/gmail.png',
	actions: [gmailSendEmailAction, gmailGetEmail, gmailSearchMail, gmailGetThread],
	displayName: 'Gmail',
	authors: ['AbdulTheActivePiecer', 'kanarelo'],
	triggers: [gmailNewEmailTrigger],
	version: '0.0.0',
});
