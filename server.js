import routes from './routes';
const express = require('express');

const port = 5000
const app = express();
app.use('/', routes);

app.listen(port, (err) => {
    if (err) {
        console.log(`Error connecting to server: ${err}`);
    }
    console.log(`Server running on port ${port}`);
});
