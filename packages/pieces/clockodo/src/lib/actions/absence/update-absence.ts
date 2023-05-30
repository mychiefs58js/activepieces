import { createAction, Property } from "@activepieces/pieces-framework";
import { clockodoCommon, emptyToNull, makeClient, reformatDate } from "../../common";

export default createAction({
    name: 'update_absence',
    displayName: 'Update Absence',
    description: 'Updates an absence in clockodo',
    props: {
        authentication: clockodoCommon.authentication,
        absence_id: Property.Number({
            displayName: 'Absence ID',
            required: true,
        }),
        date_since: Property.DateTime({
            displayName: 'Start Date',
            required: false
        }),
        date_until: Property.DateTime({
            displayName: 'End Date',
            required: false
        }),
        type: clockodoCommon.absenceType(false),
        status: Property.StaticDropdown({
            displayName: 'Status',
            required: false,
            options: {
                options: [
                    { value: 0, label: 'Requested' },
                    { value: 1, label: 'Approved' },
                    { value: 2, label: 'Declined' },
                    { value: 3, label: 'Approval cancelled' },
                    { value: 4, label: 'Request cancelled' },
                ]
            }
        }),
        half_days: Property.Checkbox({
            displayName: 'Half Days',
            required: false
        }),
        note: Property.LongText({
            displayName: 'Note',
            required: false
        }),
        sick_note: Property.Checkbox({
            displayName: 'Sick Note',
            required: false
        })
    },
    async run(context) {
        const client = makeClient(context);
        const res = await client.updateAbsence(context.propsValue.absence_id, {
            date_since: reformatDate(context.propsValue.date_since),
            date_until: reformatDate(context.propsValue.date_until),
            type: context.propsValue.type,
            status: context.propsValue.status,
            count_days: context.propsValue.half_days ? 0.5 : 1,
            note: emptyToNull(context.propsValue.note),
            sick_note: context.propsValue.sick_note
        })
        return res.absence
    }
})