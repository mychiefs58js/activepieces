
import { createPiece, PieceAuth } from "@activepieces/pieces-framework";
import { readFileAction } from "./lib/actions/read-file";

export const readFile = createPiece({
  displayName: "Read-file",
  auth: PieceAuth.None(),
  minimumSupportedRelease: '0.9.0',
  logoUrl: "https://cdn.activepieces.com/pieces/file-piece.svg",
  authors: ["Salem-Alaa"],
  actions: [readFileAction],
  triggers: [],
});
