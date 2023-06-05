import { createAction, Property } from "@activepieces/pieces-framework";
import { mysqlCommon, mysqlConnect, sanitizeColumnName } from "../common";

export default createAction({
    name: 'delete_row',
    displayName: 'Delete Row',
    description: 'Deletes one or more rows from a table',
    props: {
        authentication: mysqlCommon.authentication,
        timezone: mysqlCommon.timezone,
        table: mysqlCommon.table(),
        search_column: Property.ShortText({
            displayName: 'Search Column',
            required: true
        }),
        search_value: Property.ShortText({
            displayName: 'Search Value',
            required: true
        })
    },
    async run(context) {
        const qs = "DELETE FROM `" + context.propsValue.table + "` WHERE " + sanitizeColumnName(context.propsValue.search_column) + "=?;"
        const conn = await mysqlConnect(context.propsValue);
        try {
            const result = await conn.query(qs, [context.propsValue.search_value])
            return result
        } finally {
            await conn.end()
        }
    }
})