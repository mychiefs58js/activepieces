import { Property } from "@activepieces/pieces-framework";
import { makeClient } from "../../common";
import { clockodo } from "../../../";

clockodo.addAction({
    name: 'delete_absence',
    displayName: 'Delete Absence',
    description: 'Deletes an absence in clockodo',
    props: {
        absence_id: Property.Number({
            displayName: 'Absence ID',
            required: true
        })
    },
    async run({ auth, propsValue }) {
        const client = makeClient(auth);
        await client.deleteAbsence(propsValue.absence_id)
    }
})
