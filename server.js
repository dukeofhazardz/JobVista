import routes from './routes';

const path = require('path');
const express = require('express');
const upload = require('express-fileupload');

const port = 4000;
const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(upload());
app.use('/', routes);
app.use(express.static(path.join(__dirname, 'static')));
app.listen(port, (err) => {
  if (err) {
    console.log(`Error connecting to server: ${err}`);
  }
  console.log(`Server running on port ${port}`);
});
