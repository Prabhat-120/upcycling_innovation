require('dotenv').config()
const express = require('express');
const bodyparser = require('body-parser');
const cors = require('cors');

const route = require('./routes/designRoutes');
const conRoute = require('./routes/consumerRoutes');
const admRoute = require('./routes/adminRoutes')

const connectdb = require('./Config/database');
connectdb();

const app = express();
app.use(cors());

app.use(bodyparser.json({limit:"100mb"}));
app.use(bodyparser.urlencoded({extended:true,limit:"100mb"}));

app.use("/images",express.static('uploads'));

app.use('/',route);
app.use('/',conRoute);
app.use('/',admRoute);

const port = process.env.PORT || 8000;

app.listen(port,()=>{
    console.log(`server run at http://localhost:${port}`);
});