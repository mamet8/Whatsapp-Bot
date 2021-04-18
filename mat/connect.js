const {
  WAConnection,
  MessageType,
  Presence,
  Mimetype,
  GroupSettingChange,
  MessageOptions,
  WALocationMessage,
  WA_MESSAGE_STUB_TYPES,
  ReconnectMode,
  ProxyAgent,
  waChatKey,
  mentionedJid
} = require("@adiwajshing/baileys");
const qrImg = require('qr-image');
const fs = require('fs');
const clc = require('chalk');

//==================================================°
const conn = new WAConnection() 

exports.Whatsapp = conn

exports.connectToWhatsApp =  async() =>{
  conn.on('qr', qr => {
     var qr_svg = qrImg.image(qr, { type: 'png' });
      qr_svg.pipe(require('fs').createWriteStream('qr.png'));
      var svg_string = qrImg.imageSync(qr, { type: 'png' });
  console.log('PLEASE SCAN the QR CODE')
  });
    
  fs.existsSync('./session.json') && conn.loadAuthInfo('./session.json')
  await conn.connect()
  fs.writeFileSync('./session.json', JSON.stringify(conn.base64EncodedAuthInfo(), null, '\t'))
  console.log(' ====================================================')
  console.log("│ +  WA Version: "+conn.user.phone.wa_version)
  console.log("│ +  OS Version: "+conn.user.phone.os_version)
  console.log("│ +  Device: "+conn.user.phone.device_manufacturer)
  console.log("│ +  Model: "+conn.user.phone.device_model)
  console.log("│ +  OS Build Number: "+conn.user.phone.os_build_number)
  console.log(' ====================================================')
  console.log(clc.green(' ===================================================='))
  console.log(clc.green('│ + Github : https://github.com/mamet8/Whatsapp-Bot  │'))
  console.log(clc.green('│ + Whatsapp : https://wa.me/6281396061030           │ '))
  console.log(clc.green(' ===================================================='))
  return conn
}
