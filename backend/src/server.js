import "dotenv/config";

import app from "./app.js";
import { migrarPortalCliente } from "./config/migrarPortalCliente.js";

const port = Number(process.env.PORT || 8080);

// Do not expose a running API if its schema could not be prepared.
await migrarPortalCliente();
app.listen(port, () => console.log(`API running on port ${port}`));
