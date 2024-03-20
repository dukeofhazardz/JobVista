import routes from './routes';

const session = require('express-session');
const flash = require('connect-flash');
const path = require('path');
const express = require('express');
const upload = require('express-fileupload');

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
app.use('/', routes);
app.use(express.static(path.join(__dirname, 'static')));
app.listen(port, (err) => {
  if (err) {
    console.log(`Error connecting to server: ${err}`);
  }
  console.log(`Server running on port ${port}`);
});

export default app;
