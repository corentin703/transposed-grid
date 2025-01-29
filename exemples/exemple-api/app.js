import express, { json, urlencoded } from 'express';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import cors from 'cors';

import fakeDataRouter from './routes/fakeData.js';

const PORT = process.env.PORT ?? 30000;

const app = express();

app.use(cors())
app.use(logger('dev'));
app.use(json());
app.use(urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/fakeData', fakeDataRouter);

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`)
})

export default app;
