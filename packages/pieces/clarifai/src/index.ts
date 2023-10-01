import { PieceAuth, createPiece } from "@activepieces/pieces-framework";
import { visualClassifierModelPredictAction, imageToTextModelPredictAction } from "./lib/actions/call-image-model";
import { textToTextModelPredictAction, textClassifierModelPredictAction } from "./lib/actions/call-text-model";
import { audioToTextModelPredictAction } from "./lib/actions/call-audio-model";
import { postInputsAction } from "./lib/actions/call-post-inputs";
import { workflowPredictAction } from "./lib/actions/call-workflow";
import { clarifaiAskLLM } from "./lib/actions/ask-llm";
import { clarifaiGenerateIGM } from "./lib/actions/generate-IGM";
import { HttpMethod, HttpRequest, httpClient } from "@activepieces/pieces-common";

const markdownDescription = `
Follow these instructions to get your Clarifai APT Key:
1. Go to the [security tab](https://clarifai.com/settings/security) in your Clarifai account and generate a new PAT token.
2. Copy the PAT token and paste it in the APT Key field.
`;
export const clarifaiAuth = PieceAuth.SecretText({
    displayName: "APT Key",
    description: "Obtain an API or PAT key from your Clarifai account",
    required: true,
    validate: async (auth) => {
        const request : HttpRequest = {
            method: HttpMethod.GET,
            url:"https://api.clarifai.com/v2/models?sort_by_star_count=true&use_cases=llm&filter_by_user_id=true&additional_fields=stars&per_page=24&page=1",
            headers : {
                Authorization : 'Key ' + auth as string
            }
        }
        try{
            await httpClient.sendRequest(request);
            return{
                valid: true,
            }
        }catch(e){
            return{
                valid: false,
                error: 'Invalid PAT token'
            }
        }
      }
});

export const clarifai = createPiece({
    displayName: "Clarifai",
    minimumSupportedRelease: '0.5.0',
    logoUrl: 'https://cdn.activepieces.com/pieces/clarifai.png',
    authors: ['akatechis','Salem-Alaa'],
    auth: clarifaiAuth,
    actions: [
        clarifaiAskLLM,
        clarifaiGenerateIGM,
        visualClassifierModelPredictAction,
        textClassifierModelPredictAction,
        imageToTextModelPredictAction,
        textToTextModelPredictAction,
        audioToTextModelPredictAction,
        postInputsAction,
        workflowPredictAction,
    ],
    triggers: [],
});
