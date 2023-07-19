import { DynamicPropsValue, Property, createAction } from "@activepieces/pieces-framework";
import { APITableCommon } from "../common";
import { APITableAuth } from "../../index";
import { HttpRequest, HttpMethod, httpClient } from "@activepieces/pieces-common";

export const apiTableCreateRecord = createAction({
    auth: APITableAuth,
    name: 'apitable_create_record',
    displayName: 'Create APITable Record',
    description: 'Adds a record into an ApiTable datasheet.',
    sampleData: {
        "code": 200,
        "success": true,
        "data": {
          "records": [
            {
              "recordId": "recwFSozTQON7",
              "createdAt": 1689774745000,
              "updatedAt": 1689774745000,
              "fields": {
                "Long text": "you still read this?",
                "asdasd": "bro?",
                "Options": [
                  "ok?"
                ],
                "Title": "mhm"
              }
            }
          ]
        },
        "message": "SUCCESS"
    },
    props: {
        datasheet: APITableCommon.datasheet,
        fields: APITableCommon.fields,
    },
    async run(context) {
        const auth = context.auth;
        const datasheet = context.propsValue.datasheet;
        const dynamicFields: DynamicPropsValue = context.propsValue.fields;
        const fields: {
            [n: string]: string
        } = {};

        const props = Object.entries(dynamicFields);
        for (const [propertyKey, propertyValue] of props) {
            if (propertyValue) {
                fields[propertyKey] = propertyValue;
            }
        }

        const request: HttpRequest = {
            method: HttpMethod.POST,
            url: `https://api.apitable.com/fusion/v1/datasheets/${datasheet}/records`,
            headers: {
                "Authorization": "Bearer " + auth,
                "Content-Type": "application/json",
            },
            body: {
                records: [
                    {
                        fields: {
                            ...fields,
                        }
                    }
                ]
            }
        };

        const res = await httpClient.sendRequest<any>(request);
        
        return res.body;
    },
})
