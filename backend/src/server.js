import "dotenv/config";

import app from "./app.js";
import { migrarPortalCliente } from "./config/migrarPortalCliente.js";

const port = Number(process.env.PORT || 8080);

try {
  await migrarPortalCliente();
} catch (error) {
  console.error("Não foi possível aplicar as atualizações do portal do cliente:", error.message);
}
app.listen(port, () => console.log(`API running on port ${port}`));
