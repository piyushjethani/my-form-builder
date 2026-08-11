const app = require('./app');
const { port } = require('./config/env');

app.listen(port, () => {
  console.log(`Form Builder API running on http://localhost:${port}`);
});
