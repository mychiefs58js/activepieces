import packageJson from "../package.json";
import { createPiece } from "@activepieces/pieces-framework";
import { blackbaudUpsertContact } from "./lib/actions/upsert-contact";
import { blackbaudSearchAfterDate } from "./lib/actions/search-contacts-after-date";

export const blackbaud = createPiece({
    name: 'blackbaud',
    displayName: "Blackbaud",
    logoUrl: 'https://cdn.activepieces.com/pieces/blackbaud.png',
    version: packageJson.version,
    authors: ['abuaboud'],
    actions: [blackbaudSearchAfterDate, blackbaudUpsertContact],
    triggers: [],
});
