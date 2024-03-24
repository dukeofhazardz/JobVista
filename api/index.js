import { router } from '../routes/routes.js';
import dbClient from '../utils/db.js';
import express from 'express';
import session from 'express-session';
import flash from 'connect-flash';
import path from 'path';
import upload from 'express-fileupload';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const port = 4000;
const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(session({
  secret: 'something',
  cookie: { maxAge: 60000 },
  resave: true,
  saveUninitialized: true,
}));
app.use(flash());
app.use(upload());
app.use('/', router);
app.use(express.static(path.join(__dirname, 'static')));
dbClient.connect().then(() => {
  app.listen(port, (err) => {
    if (err) {
      console.log(`Error connecting to server: ${err}`);
    }
    console.log(`Server running on port ${port}`)
  });
});

