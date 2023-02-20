import { Property } from "@activepieces/framework";

export const sendgridCommon = {
    baseUrl: "https://api.sendgrid.com/v3",
    authentication: Property.SecretText({
        displayName: "API Key",
        required: true,
        description: "API key acquired from your SendGrid settings"
    }),
}
