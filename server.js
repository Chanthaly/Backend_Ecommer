
// import   libary 
import express from 'express';
import cor from 'cors';
import bodyParser from 'body-parser';
import { routes } from './route/index.routes.js';
import { rootPath } from './util/Multer.Helper.js';
import { initializeSocket } from './util/socket.js';
 const app = express();
const port = process.env.PORT || 4000;
import http  from 'http'
;


  app.use(express.urlencoded({extended : true}));
  app.use(cor())
  app.use(bodyParser.json());

//milddleware
  const server = http.createServer(app)
  initializeSocket(server);
// routes
app.use('/api',routes)
const rootImage = rootPath();
app.use('/upload', express.static(rootImage))
  server.listen(`${port}`, () => {
    console.log(`Server is Running on port ${port}`)
  })






