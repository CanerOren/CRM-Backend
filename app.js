import express from 'express';
import ejs from 'ejs';

import

const app = express();

// Template Engine
app.set('view engine', 'ejs');

//Middlewares
app.use(express.static('public'));
//Routes
app.get('/', (req, res) => {
  res.render('Hello World!!!');
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Initialized server listening on port ${port}`);
});
