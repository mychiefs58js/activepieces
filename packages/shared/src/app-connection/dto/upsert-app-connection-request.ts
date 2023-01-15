import { Static, Type } from "@sinclair/typebox";
import { AppConnectionType } from "../app-connection";

const commonAuthProps = {
    name: Type.String({}),
    appName: Type.String({}),
    projectId: Type.String({}),
};

const OAuth2ConnectionValue = {
    expires_in: Type.Optional(Type.Number()),
    claimed_at: Type.Optional(Type.Number()),
    refresh_token: Type.Optional(Type.String()),
    token_type: Type.Optional(Type.String({})),
    access_token: Type.String({}),
    scope: Type.String(),
    data: Type.Any({}),
}

export const UpsertCloudOAuth2Request = Type.Object({
    ...commonAuthProps,
    value: Type.Object({
        ...OAuth2ConnectionValue,
        type: Type.Literal(AppConnectionType.CLOUD_OAUTH2),
    })
});

export const UpsertSecretTextRequest = Type.Object({
    ...commonAuthProps,
    value: Type.Object({
        type: Type.Literal(AppConnectionType.SECRET_TEXT),
        secret_key: Type.String({})
    })
});

export const UpsertOAuth2Request = Type.Object({
    ...commonAuthProps,
    value: Type.Object({
        client_id: Type.String({}),
        client_secret: Type.String({}),
        token_url: Type.String({}),
        redirect_url: Type.String({}),
        ...OAuth2ConnectionValue,
        type: Type.Literal(AppConnectionType.OAUTH2),
    })
});

export type UpsertCloudOAuth2Request = Static<typeof UpsertCloudOAuth2Request>;
export type UpsertOAuth2Request = Static<typeof UpsertCloudOAuth2Request>;
export type UpsertSecretTextRequest = Static<typeof UpsertSecretTextRequest>;

export const UpsertConnectionRequest = Type.Union([UpsertSecretTextRequest, UpsertOAuth2Request, UpsertCloudOAuth2Request]);
export type UpsertConnectionRequest = Static<typeof UpsertConnectionRequest>;