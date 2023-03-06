import Airtable from "airtable";
import { Property, HttpRequest, HttpMethod, AuthenticationType, httpClient } from "@activepieces/framework";

declare type AirtablePermissionLevel = "none" | "read" | "comment" | "edit" | "create";
interface AirtableBase {
    id: string;
    name: string;
    permissionLevel: AirtablePermissionLevel
}

export interface AirtableRecord {
    fields: Record<string, unknown>,
    createdTime: Date,
    id: string;
}

export const airtableCommon = {
    authentication: Property.SecretText({
        displayName: "Personal Token",
        required: true,
        description: "Visit https://airtable.com/create/tokens/ to create one"
    }),
    base: Property.Dropdown({
        displayName: 'Base',
        required: true,
        refreshers: ["authentication"],
        options: async (props) => {
            if (!props['authentication']) {
                return {
                    disabled: true,
                    options: [],
                    placeholder: "Please connect your account"
                }
            }
            const request: HttpRequest = {
                method: HttpMethod.GET,
                url: "https://api.airtable.com/v0/meta/bases",
                authentication: {
                    type: AuthenticationType.BEARER_TOKEN,
                    token: props["authentication"] as string
                }
            };
            const response = await httpClient.sendRequest<{ bases: AirtableBase[] }>(request);
            const opts = response.body.bases.map((base) => {
                return { value: base.id, label: base.name };
            });
            return {
                disabled: false,
                options: opts,
            }
        }

    }),
    table: Property.Dropdown({
        displayName: 'Table',
        required: true,
        refreshers: ["authentication", "base"],
        options: async (props) => {
            if (!props['authentication']) {
                return {
                    disabled: true,
                    options: [],
                    placeholder: "Please connect your account"
                }
            }
            if (!props['base']) {
                return {
                    disabled: true,
                    options: [],
                    placeholder: "Please select a base first"
                }
            }

            const request: HttpRequest = {
                method: HttpMethod.GET,
                url: `https://api.airtable.com/v0/meta/bases/${props['base']}/tables`,
                authentication: {
                    type: AuthenticationType.BEARER_TOKEN,
                    token: props["authentication"] as string
                }
            };
            const response = await httpClient.sendRequest<{ tables: { id: string, name: string }[] }>(request);
            const opts = response.body.tables.map((table) => {
                return { value: table.id, label: table.name };
            });
            return {
                disabled: false,
                options: opts,
            }
        }

    }),
    async getTableSnapshot(params: { personalToken: string, baseId: string, tableId: string }) {
        Airtable.configure({
            apiKey: params.personalToken,
        });
        const airtable = new Airtable();
        const currentTablleSnapshot = (await airtable
            .base(params.baseId)
            .table(params.tableId)
            .select()
            .all()).map((r) => r._rawJson)
            .sort((x, y) => new Date(x.createdTime).getTime() - new Date(y.createdTime).getTime());
        return currentTablleSnapshot;
    }

}

