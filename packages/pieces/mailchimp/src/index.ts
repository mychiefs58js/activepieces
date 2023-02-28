import {createPiece} from '@activepieces/framework';
import {addMemberToList} from './lib/actions/add-member-to-list.action/add-member-to-list.action'
import {mailChimpSubscribeTrigger} from './lib/triggers/subscribe-trigger';

export const mailchimp = createPiece({
	name: 'mailchimp',
	displayName: "Mailchimp",
	logoUrl: 'https://cdn.activepieces.com/pieces/mailchimp.png',
  version: '0.0.0',
	authors: ['AbdulTheActivePiecer'],
	actions: [addMemberToList],
	triggers: [mailChimpSubscribeTrigger],
});
