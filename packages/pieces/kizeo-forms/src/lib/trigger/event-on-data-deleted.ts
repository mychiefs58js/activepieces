import { HttpRequest, HttpMethod, httpClient } from '@activepieces/pieces-common';
import { TriggerStrategy, createTrigger } from "@activepieces/pieces-framework";
import { endpoint, kizeoFormsCommon } from '../common';
import { kizeoFormsAuth } from '../..';

const triggerNameInStore = 'event_on_data_deleted_trigger';
export const eventOnDataDeleted = createTrigger({
  auth: kizeoFormsAuth,
  name: 'event_on_data_deleted',
  displayName: 'Event On Data Deleted',
  description: 'Handle EventOnData delete event via webhooks',
  props: {
    formId: kizeoFormsCommon.formId,
  },
  sampleData: {
    "id": "1",
    "eventType": "[delete]",
    "data": {
      "format": "4",
      "answer_time": "2023-04-11T13:59:23+02:00",
      "update_answer_time": "2023-04-11T13:59:23+02:00",
      "id_tel": "web2",
      "form_id": "1",
      "origin": "web",
      "app_version": "webapp",
      "media": [],
      "fields": {},
      "id": "1",
      "user_id": "1",
      "recipient_id": "1",
      "parent_data_id": null
    }
  },
  type: TriggerStrategy.WEBHOOK,
  async onEnable(context) {
    const { formId } = context.propsValue;
    const webhookUrl = context.webhookUrl;
    const match = webhookUrl.match(/\/webhooks\/(\w+)\//);
    let workflowId = ""
    if (match) {
      workflowId = match[1];
    }
    const request: HttpRequest = {
      method: HttpMethod.POST,
      url: endpoint + `public/v4/forms/${formId}/third_party_webhooks?used-with-actives-pieces=`,
      body: {
        'on_events': ['delete'],
        'url': webhookUrl,
        'http_verb': 'POST',
        'body_content_choice': 'json_v4',
        'third_party': 'Active Pieces ',
        'third_party_id': workflowId,
      },
      headers: {
        'Authorization': context.auth
      },
      queryParams: {},
    };
    const { body } = await httpClient.sendRequest<{ id: string }>(request);
    await context.store?.put<KizeoFormsWebhookInformation>(triggerNameInStore, {
      webhookId: body.id,
    });


  },
  async onDisable(context) {
    const { formId } = context.propsValue;
    const response = await context.store?.get<KizeoFormsWebhookInformation>(triggerNameInStore);
    if (response !== null && response !== undefined) {
      const request: HttpRequest = {
        method: HttpMethod.DELETE,
        url: endpoint + `public/v4/forms/${formId}/third_party_webhooks/${response.webhookId}?used-with-actives-pieces=`,
        headers: {
          'Authorization': context.auth
        },
      };
      await httpClient.sendRequest(request);
    }
  },
  async run(context) {
    if (!context.payload.body) {
      return []
    }
    return [context.payload.body];
  },
});



interface KizeoFormsWebhookInformation {
  webhookId: string;
}
