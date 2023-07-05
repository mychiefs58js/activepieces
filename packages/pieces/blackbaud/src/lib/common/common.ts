import {Property} from "@activepieces/pieces-framework";

export const blackbaudCommon = {
    baseUrl: "https://api.sky.blackbaud.com",
    auth_props: {
        subscription_key: Property.ShortText({
            displayName: "Subscription Key",
            required: true
        })
    },
    fundraiser_list: Property.Dropdown<string>({
        displayName: "Fundraising List",
        required: true,
        description: "Select the List",
        refreshers: [],
        options: async () => {
            return {
                options: [
                    {
                        label: "Campaign",
                        value: "campaigns",
                    },
                    {
                        label: "Appeal",
                        value: "appeals",
                    },
                    {
                        label: "Fund",
                        value: "funds",
                    }
                ]
            }
        }
    }),
}
