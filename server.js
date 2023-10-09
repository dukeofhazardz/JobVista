import routes from './routes';
const path = require('path');
const express = require('express');

const port = 5000
const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use('/', routes);

app.listen(port, (err) => {
    if (err) {
        console.log(`Error connecting to server: ${err}`);
    }
    console.log(`Server running on port ${port}`);
});
