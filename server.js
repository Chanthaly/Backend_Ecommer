
// import   libary 
import express from 'express';
import cor from 'cors';
import bodyParser from 'body-parser';
import { routes } from './route/index.routes.js';
import { rootPath } from './util/Multer.Helper.js';
 const app = express();
const port = 4000;
import http  from 'http'
import {Server} from 'socket.io'
;


  app.use(express.urlencoded({extended : true}));
  app.use(cor())
  app.use(bodyParser.json());

//milddleware
  const server = http.createServer(app)
  export const io =  new Server(server,{
    cors:{
       origin:"*"
    }
  })
// routes
app.use('/api',routes)
const rootImage = rootPath();
app.use('/upload', express.static(rootImage))
// Socket IO
  io.on("connection",(socket)=> {
 console.log('ClientConnected:', socket.id)
 socket.on("disconnect", () => {
   console.log("Client Disconnected:", socket.id)
 })
  })
  server.listen(`${port}`, () => {
    console.log(`Server is Running on port ${port}`)
  })






