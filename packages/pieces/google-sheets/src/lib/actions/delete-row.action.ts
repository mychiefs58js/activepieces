import { createAction, Property } from '@activepieces/pieces-framework';
import { googleSheetsCommon } from '../common/common';
import { googleSheetsAuth } from '../../';

export const deleteRowAction = createAction({
    auth: googleSheetsAuth,
    action: {
        name: 'delete_row',
        description: 'Delete a row on an existing sheet you have access to',
        displayName: 'Delete Row',
        props: {
            spreadsheet_id: googleSheetsCommon.spreadsheet_id,
            include_team_drives: googleSheetsCommon.include_team_drives,
            sheet_id: googleSheetsCommon.sheet_id,
            row_id: Property.Number({
                displayName: 'Row Number',
                description: 'The row number to remove',
                required: true,
            })
        },
        async run(context) {
            const sheetName = await googleSheetsCommon.findSheetName(context.auth.access_token,
                context.propsValue['spreadsheet_id'],
                context.propsValue['sheet_id']);
            if (!sheetName) {
                throw Error("Sheet not found in spreadsheet");
            }

                // Subtract 1 from the row_id to convert it to 0-indexed
                const adjustedRowIndex = context.propsValue.row_id - 1;

                const response = await googleSheetsCommon.deleteRow(context.propsValue.spreadsheet_id, context.propsValue.sheet_id, adjustedRowIndex,
                    context.auth.access_token)

            return {
                success: true,
                body: response
            };
        },
    },
});
