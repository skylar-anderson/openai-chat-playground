
import { createPrimaryColumn, hydrateCell } from "./actions";
import Grid from "./components/Grid";

export default function Page() {
  return (
    <Grid
      createPrimaryColumn={createPrimaryColumn}
      hydrateCell={hydrateCell}
    />
  )

}