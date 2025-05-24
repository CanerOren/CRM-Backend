const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const requestLogger = require('./app/middlewares/log/requestLogger');
const errorLogger = require('./app/middlewares/log/errorLogger');
const dailyReportJob = require('./app/cron/dailyReport');
require('dotenv').config();
const router = require('./app/routes/routes');

const app = express();

app.use(express.json());
app.use(bodyParser.json());
app.use(cors());
//app.use(requestLogger);
app.use(router);
//app.use(errorLogger);
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Initialized server listening on port ${port}`);
  dailyReportJob();
});
