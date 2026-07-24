const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");
require("dotenv").config();
const http = require("http");



const BOT_TOKEN = process.env.BOT_TOKEN;
const ADMIN_ID = String(process.env.ADMIN_ID);

const API_KEYS = (process.env.API_KEYS || "")
.split(",")
.filter(key => key.trim() !== "");


let keyIndex = 0;


function getKey(){

    if(API_KEYS.length === 0){
        throw new Error("API_KEYS missing");
    }

    let key = API_KEYS[keyIndex];

    keyIndex++;

    if(keyIndex >= API_KEYS.length){
        keyIndex = 0;
    }

    return key;

}



const bot = new TelegramBot(
    if(!BOT_TOKEN){
    console.log("❌ BOT_TOKEN missing");
    process.exit(1);
}

if(!ADMIN_ID){
    console.log("❌ ADMIN_ID missing");
    process.exit(1);
}

if(API_KEYS.length === 0){
    console.log("❌ API_KEYS missing");
    process.exit(1);
}
    {
        polling:true
    }
);



let orders = [];



function isAdmin(msg){

    return String(msg.from.id) === ADMIN_ID;

}




// START

bot.onText(/\/start/, async(msg)=>{


    if(!isAdmin(msg)){
        return bot.sendMessage(
            msg.chat.id,
            "⛔ Access Denied"
        );
    }



    bot.sendMessage(
        msg.chat.id,
        "🔥 5SIM BOT ONLINE",
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





// ALL BUTTON HANDLER

bot.on("message", async(msg)=>{


if(!msg.text) return;


if(!isAdmin(msg)) return;



// BALANCE

if(msg.text==="💰 Balance"){


try{


let res = await axios.get(
"https://5sim.net/v1/user/profile",
{
headers:{
Authorization:
`Bearer ${getKey()}`
}
}
);



bot.sendMessage(
msg.chat.id,
`💰 Balance: ${res.data.balance} USD`
);



}catch(err){

console.log(err.response?.data);

bot.sendMessage(
msg.chat.id,
"❌ Balance Error"
);

}



}




// BUY NUMBER


if(msg.text==="📱 Buy Number"){


try{


let res = await axios.get(

"https://5sim.net/v1/user/buy/activation/any/any/telegram",

{
headers:{
Authorization:
`Bearer ${getKey()}`
}
}

);



let order={

id:res.data.id,
number:res.data.phone,
status:"WAITING"

};



orders.push(order);



bot.sendMessage(
msg.chat.id,

`
📱 Number Purchased

☎️ Number:
${order.number}

🆔 Order ID:
${order.id}

⏳ Waiting SMS...
`

);



}catch(err){


console.log(
err.response?.data || err.message
);


bot.sendMessage(
msg.chat.id,
"❌ Buy Number Failed"
);


}


}





// CHECK SMS


if(msg.text==="📩 Check SMS"){


if(orders.length===0){

return bot.sendMessage(
msg.chat.id,
"No active order"
);

}



let order =
orders[orders.length-1];



try{


let res = await axios.get(

`https://5sim.net/v1/user/check/${order.id}`,

{
headers:{
Authorization:
`Bearer ${getKey()}`
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



}catch(err){


bot.sendMessage(
msg.chat.id,
"❌ SMS Check Failed"
);


}



}





// ORDERS


if(msg.text==="📜 Orders"){


if(orders.length===0){

return bot.sendMessage(
msg.chat.id,
"No Orders"
);

}



bot.sendMessage(
msg.chat.id,
JSON.stringify(
orders,
null,
2
)
);


}





// CANCEL


if(msg.text==="❌ Cancel Order"){



if(orders.length===0){

return bot.sendMessage(
msg.chat.id,
"No Order"
);

}



let order =
orders[orders.length-1];



try{


await axios.get(

`https://5sim.net/v1/user/cancel/${order.id}`,

{
headers:{
Authorization:
`Bearer ${getKey()}`
}
}

);



order.status="CANCELLED";



bot.sendMessage(
msg.chat.id,
"❌ Order Cancelled"
);



}catch(err){


bot.sendMessage(
msg.chat.id,
"Cancel Failed"
);


}



}



});





// HTTP SERVER FOR RENDER


const PORT =
process.env.PORT || 10000;



http.createServer(
(req,res)=>{

res.writeHead(200);

res.end(
"5SIM Telegram Bot Running"
);

}

).listen(
PORT,
()=>console.log(
`Server running ${PORT}`
)
);



console.log(
"✅ BOT STARTED"
);
