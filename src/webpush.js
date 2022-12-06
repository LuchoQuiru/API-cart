const webpush = require('web-push');

// VAPID keys should be generated only once.
//const vapidKeys = webpush.generateVAPIDKeys(); -> Las genero por consola y las hardcodeo 

//No lo voy a usar porque no se que es
//webpush.setGCMAPIKey('<Your GCM API Key Here>');

webpush.setVapidDetails(
  'mailto:luchoquiru@carrito.com',
  process.env.PUBLIC_VAPID_KEY,
  process.env.PRIVATE_VAPID_KEY
);

// This is the same output of calling JSON.stringify on a PushSubscription
const pushSubscription =  {
  "endpoint":"https://fcm.googleapis.com/fcm/send/cxpqNGxwNMY:APA91bFiyTekwxCszaLrSEZ4gtWcu548PP8BFHTBuPHLIHkELt1-kZWsJ1uORNuiKn5LJNsHaZDtovZTEurjk796V-pCb0-UlJljfq54-pCaZY8Nvjhq8WAnn_zeMJsSxd-BKs4kTseS",
  "expirationTime":null,
  "keys":{"p256dh":"BA0T6BVEdyUrGwtUqS0zYrzJOH_fW9pceR9EcuA_qvoCCqJllrXFevOkdUc-ypkKr8H8-TOFwqzd5auNpunUm48","auth":"aUXuITm2vC5OBdFZUvt6pw"}
}


const payload = JSON.stringify({
  title : 'no te prometo intentarlo, pero........',
  message : 'intentaré intentarlo!'
})

const send = () =>{
  webpush.sendNotification(pushSubscription, payload);
  console.log("Estoy en send de webpush")
}

module.exports = send