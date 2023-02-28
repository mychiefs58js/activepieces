import { Piece } from '@activepieces/framework';
import { airtable } from '@activepieces/piece-airtable';
import { asana } from '@activepieces/piece-asana';
import { bannerbear } from '@activepieces/piece-bannerbear';
import { binance } from '@activepieces/piece-binance';
import { blackbaud } from '@activepieces/piece-blackbaud';
import { calcom } from '@activepieces/piece-cal-com';
import { calendly } from '@activepieces/piece-calendly';
import { clickup } from '@activepieces/piece-clickup';
import { csv } from '@activepieces/piece-csv';
import { discord } from '@activepieces/piece-discord';
import { drip } from '@activepieces/piece-drip';
import { dropbox } from '@activepieces/piece-dropbox';
import { figma } from '@activepieces/piece-figma';
import { freshsales } from '@activepieces/piece-freshsales';
import { github } from '@activepieces/piece-github';
import { gmail } from '@activepieces/piece-gmail';
import { googleCalendar } from '@activepieces/piece-google-calendar';
import { googleContacts } from '@activepieces/piece-google-contacts';
import { googleDrive } from '@activepieces/piece-google-drive';
import { googleSheets } from '@activepieces/piece-google-sheets';
import { googleTasks } from '@activepieces/piece-google-tasks';
import { slack } from '@activepieces/piece-slack';
import { hackernews } from './lib/hackernews';
import { http } from './lib/http';
import { hubspot } from './lib/hubspot';
import { mailchimp } from './lib/mailchimp';
import { openai } from './lib/openai';
import { pipedrive } from './lib/pipedrive';
import { rssFeed } from './lib/rss';
import { sendgrid } from './lib/sendgrid';
import { stripe } from './lib/stripe';
import { telegramBot } from './lib/telegram_bot';
import { todoist } from './lib/todoist';
import { twilio } from './lib/twilio';
import { typeform } from './lib/typeform';
import { zoom } from './lib/zoom';
import { storage } from './lib/store';
import { posthog } from './lib/posthog';
import { wordpress } from './lib/wordpress';

export const pieces: Piece[] = [
    airtable,
    asana,
    bannerbear,
    binance,
    blackbaud,
    calcom,
    calendly,
    csv,
    clickup,
    discord,
    drip,
    dropbox,
    figma,
    freshsales,
    github,
    gmail,
    googleCalendar,
    googleContacts,
    googleDrive,
    googleSheets,
    googleTasks,
    hackernews,
    http,
    hubspot,
    mailchimp,
    openai,
    pipedrive,
    posthog,
    rssFeed,
    sendgrid,
    slack,
    storage,
    stripe,
    telegramBot,
    todoist,
    twilio,
    typeform,
    wordpress,
    zoom
].sort((a, b) => a.displayName > b.displayName ? 1 : -1);

export const getPiece = (name: string): Piece | undefined => {
    return pieces.find((f) => name.toLowerCase() === f.name.toLowerCase());
};
