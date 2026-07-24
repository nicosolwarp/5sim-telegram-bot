const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");
const fs = require("fs");
require("dotenv").config();


const bot = new TelegramBot(
process.env.BOT_TOKEN,
{polling:true}
);


const ADMIN_ID = String(process.env.ADMIN_ID);

let keys = require("./keys.json");
let keyIndex = 0;


function getKey(){

let key = keys[keyIndex];

keyIndex++;

if(keyIndex >= keys.length)
keyIndex=0;

return key;

}



function saveOrders(data){

fs.writeFileSync(
"orders.json",
JSON.stringify(data,null,2)
);

}



function getOrders(){

return JSON.parse(
fs.readFileSync("orders.json")
);

}




function auth(msg){

return String(msg.from.id) === ADMIN_ID;

}



// START

bot.onText(/\/start/,msg=>{

if(!auth(msg))
return bot.sendMessage(msg.chat.id,"⛔ Access Denied");


bot.sendMessage(
msg.chat.id,
"🔥 5SIM BOT READY",
{
reply_markup:{
keyboard:[
["💰 Balance"],
["📱 Buy Number"],
["📩 Check SMS"],
["📜 Orders"],
["❌ Cancel Order"]
],
resize_keyboard:true
}
}
);

});




// BALANCE

bot.on("message",async msg=>{

if(!auth(msg)) return;


if(msg.text==="💰 Balance"){

try{

let res=await axios.get(
"https://5sim.net/v1/user/profile",
{
headers:{
Authorization:`Bearer ${getKey()}`
}
}
);


bot.sendMessage(
msg.chat.id,
`💰 Balance: ${res.data.balance} USD`
);


}catch(e){

bot.sendMessage(
msg.chat.id,
"❌ Balance Error"
);

}

}

});




// BUY NUMBER

bot.on("message",async msg=>{

if(!auth(msg)) return;


if(msg.text==="📱 Buy Number"){


try{


let res=await axios.get(

"https://5sim.net/v1/user/buy/activation/any/any/telegram",

{
headers:{
Authorization:`Bearer ${getKey()}`
}
}

);



let orders=getOrders();


orders.push({

id:res.data.id,
number:res.data.phone,
status:"WAITING"

});


saveOrders(orders);



bot.sendMessage(
msg.chat.id,

`📱 Number Bought

☎️ ${res.data.phone}

🆔 Order ID:
${res.data.id}

Waiting SMS...`

);


}catch(e){

console.log(e.response?.data);

bot.sendMessage(
msg.chat.id,
"❌ Purchase Failed"
);

}

}

});




// CHECK SMS

bot.on("message",async msg=>{

if(!auth(msg)) return;


if(msg.text==="📩 Check SMS"){


let orders=getOrders();


let order=orders[orders.length-1];


if(!order)
return bot.sendMessage(msg.chat.id,"No order");


try{


let res=await axios.get(

`https://5sim.net/v1/user/check/${order.id}`,

{
headers:{
Authorization:`Bearer ${getKey()}`
}
}

);



bot.sendMessage(
msg.chat.id,

JSON.stringify(
res.data,
null,
2
)

);


}catch(e){

bot.sendMessage(
msg.chat.id,
"SMS check error"
);

}


}

});




// ORDERS

bot.on("message",msg=>{


if(!auth(msg)) return;


if(msg.text==="📜 Orders"){

let data=getOrders();


bot.sendMessage(
msg.chat.id,
JSON.stringify(data,null,2)
);

}

});





// CANCEL

bot.on("message",async msg=>{

if(!auth(msg)) return;


if(msg.text==="❌ Cancel Order"){


let orders=getOrders();


let order=orders[orders.length-1];


try{


await axios.get(

`https://5sim.net/v1/user/cancel/${order.id}`,

{
headers:{
Authorization:`Bearer ${getKey()}`
}
}

);


bot.sendMessage(
msg.chat.id,
"❌ Order Cancelled"
);



}catch(e){

bot.sendMessage(
msg.chat.id,
"Cancel failed"
);


}

}

});





require("http")
.createServer((req,res)=>{
res.end("5SIM BOT RUNNING");
})
.listen(
process.env.PORT || 10000
);



console.log("BOT STARTED");
