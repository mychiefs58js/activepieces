import { createAction, Property } from "@activepieces/pieces-framework";
import { mysqlCommon, mysqlConnect, isSpecialColumn } from "../common";
import { mysqlAuth } from "../..";

export default createAction({
    auth: mysqlAuth,
    action: {
        name: 'find_rows',
        displayName: 'Find Rows',
        description: 'Reads rows from a table',
        props: {
            timezone: mysqlCommon.timezone,
            table: mysqlCommon.table(),
            condition: Property.ShortText({
                displayName: 'Condition',
                description: 'SQL condition, can also include logic operators, etc.',
                required: true
            }),
            args: Property.Array({
                displayName: 'Arguments',
                description: 'Arguments can be used using ? in the condition',
                required: false
            }),
            columns: Property.Array({
                displayName: 'Columns',
                description: 'Specify the columns you want to select',
                required: false
            }),
        },
        async run(context) {
            const columns = context.propsValue.columns as string[] || ['*']
            const qsColumns = columns.map(c => isSpecialColumn(c) ? c : ("`" + c + "`")).join(',')
            const qs = "SELECT " + qsColumns + " FROM `" + context.propsValue.table + "` WHERE " + context.propsValue.condition + ";"
            const conn = await mysqlConnect(context.auth, context.propsValue);
            try {
                const results = await conn.query(qs, context.propsValue.args)
                return { results }
            } finally {
                await conn.end()
            }
        }
    }
})
