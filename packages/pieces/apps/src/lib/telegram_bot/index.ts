import {createPiece} from '@activepieces/framework';
import { telegramSendMessageAction } from './action/send-text-message.action';

export const telegramBot = createPiece({
	name: 'telegram_bot',
	displayName: "Telegram bot",
	logoUrl: 'https://cdn.activepieces.com/pieces/telegram_bot.png',
  version: '0.0.0',
	actions: [telegramSendMessageAction],
	authors: ['abuaboud'],
	triggers: [],
});
