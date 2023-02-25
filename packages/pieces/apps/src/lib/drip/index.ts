import { createPiece } from '@activepieces/framework';
import { dripAddSubscriberToCampaign } from './actions/add-subscriber-to-campaign.action';
import { dripApplyTagToSubscriber } from './actions/apply-tag-to-subscriber.action';
import { dripUpsertSubscriberAction } from './actions/upsert-subscriber.action';
import { dripNewSubscriberEvent } from './trigger/new-subscriber.trigger';
import { dripTagAppliedEvent } from './trigger/new-tag.trigger';


export const drip = createPiece({
	name: 'drip',
	displayName: 'Drip',
	logoUrl: 'https://cdn.activepieces.com/pieces/drip.png',
  version: '0.0.0',
	authors: ['AbdulTheActivePiecer'],
	actions: [dripApplyTagToSubscriber, dripAddSubscriberToCampaign, dripUpsertSubscriberAction],
	triggers: [dripNewSubscriberEvent, dripTagAppliedEvent],
});
