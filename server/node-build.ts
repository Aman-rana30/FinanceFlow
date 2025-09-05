import { createServer } from "./index";

const app = createServer();
const port = process.env.PORT || 8080;

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
