import { PieceAuth, createPiece } from '@activepieces/pieces-framework';
import { fetchCryptoPairPrice } from './lib/actions/fetch-pair-price';

export const binance = createPiece({
  displayName: 'Binance',
  logoUrl: 'https://cdn.activepieces.com/pieces/binance.png',
  auth: PieceAuth.None(),
  actions: [fetchCryptoPairPrice],
  authors: ['m-tabaza'],
  triggers: [],
});
