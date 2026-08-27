import app from './app';
import { config } from './config/env';
import { seedIfEmpty } from './seed';

seedIfEmpty();

app.listen(config.port, () => {
  console.log(`Server running on http://localhost:${config.port}`);
});
