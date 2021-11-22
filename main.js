/*Mat and Zhoe*/
const conn = require("./mat/connect")
const wa = require("./mat/helper")
const fs = require("fs")
const moment = require('moment-timezone')
const requests = require("node-fetch")
const request = require('request');
const clc = require('chalk');
const FormData =require('form-data');
const {Duplex} = require('stream');
const { exec } = require("child_process");
const imgToPDF = require('image-to-pdf');
const util = require("util")
const speed = require('performance-now')
const { GroupSettingChange } = require("@adiwajshing/baileys");


conn.connectToWhatsApp()
const event = conn.Whatsapp

const setting = JSON.parse(fs.readFileSync('./settings.json'))

const APIKUY = "Chat me for Apikey https://wa.me/6281396061030"
var blocked = []
var tmp_ids = []
var tmp_hit = []
var respon_tag = {}
var respon_pm = {}

function cih(s) {
    var hours = Math.floor(s / (60 * 60))
    var minutes = Math.floor(s % (60 * 60) / 60);
    var seconds = Math.floor(s % 60);
    if (hours === 0) return `Bot active from *${minutes}* _min_, *${seconds}* _sec_,`
    return `Bot active from *${hours}* _hour_, *${minutes}* _min_, *${seconds}* _sec_,`
}
function modecmd(sender){
    if(setting.Modepublic.status){
        return true
    }else{
        if(sender === event.user.jid){
            return true
        }else{
            return false
        }
    }
}

async function printLogs(msg){
    const time = moment.tz('Asia/Jakarta').format('DD/MM HH:mm:ss')
    const text = msg.text
    const cmd = text.toLowerCase()
    const sender = msg.sender
    const to = msg.key.remoteJid
    const msg_id = msg.key.id
    const args = cmd.split(' ')
    tmp_hit.push(cmd)
    if(!msg.isGroup){
        try {
            console.log(clc.green("[ CMD ] "), clc.yellow(time), clc.green(text), 'form', clc.green(event.contacts[sender].notify));
        } catch (e) {
            console.log('Error :', e)
        }
    } else {
        const gc = await wa.getGroup(to)
        console.log(clc.green("[ CMD ] "), clc.yellow(time), clc.green(text), 'form', clc.green(event.contacts[sender].notify), 'To', clc.yellow(gc.subject));
    }
}

event.on('chat-update', async(msg) =>{
    if (!msg.hasNewMessage) return;
    const owner = ["6282260888474@s.whatsapp.net","6281396061030@s.whatsapp.net", event.user.jid]
    msg = wa.serialize(msg)
    const text = msg.text
    const cmd = text.toLowerCase()
    const sender = msg.sender
    const to = msg.key.remoteJid
    const msg_id = msg.key.id
    const args = cmd.split(' ')

//============================================================
    if (setting.responder.groupchange.status){ 
        if (msg.messageStubType === 'GROUP_CHANGE_DESCRIPTION'){
            const pict = await wa.getPict(to)
            wa.ReplyStatusWAMention(to, "Group description has been changed by @!", "Group-Update", [sender])
        }
        if (msg.messageStubType === 'GROUP_CHANGE_SUBJECT'){
            const pict = await wa.getPict(to)
            wa.ReplyStatusWAMention(to, "Group subject has been changed by @!", "Group-Update", [sender])
        }
        if (msg.messageStubType === 'GROUP_CHANGE_ICON'){
            wa.ReplyStatusWAMention(to, "Group icon has been changed by @!", "Group-Update", [sender])
        }
    }
    if (setting.gAutoRead.status){
        if (msg.isGroup){
            event.chatRead(to)
        }
    }
    if (setting.pmAutoRead.status){
        if (!msg.isGroup){
            event.chatRead(to)
        }
    }
    
    if(msg.key.fromMe){
        tmp_ids.push(msg_id)
    }
    if (msg.quoted){
        const qType = Object.keys(msg.quoted)[0]
        if (!modecmd(sender)) return
        if (cmd == "to status"){
            if (qType === "conversation" | qType === "extendedTextMessage"){
                event.sendMessage("status@broadcast", text, "extendedTextMessage")
                wa.sendMessage(to, "update status text succes")
            }
            printLogs(msg)
        } else if (qType === "videoMessage"){
            if (cmd.startsWith("upstatus")) {
                const xtext = cmd.replace("upstatus ", "")
                if(args.length === 1){
                    msg.message = msg.quoted
                    a = msg.message.videoMessage.seconds
                    if (a > 30) return wa.sendReply(to, "duration exceeds 30 seconds")
                    wa.sendReply(to, "Meluncur")
                    b = await event.downloadMediaMessage(msg)
                    event.sendMessage("status@broadcast", b, qType)
                }else{
                    msg.message = msg.quoted
                    a = msg.message.videoMessage.seconds
                    if (a > 30) return wa.sendReply(to, "duration exceeds 30 seconds")
                    wa.sendReply(to, "Success Upload Status")
                    b = await event.downloadMediaMessage(msg)
                    event.sendMessage("status@broadcast", b, qType, {'caption': xtext})
                }
                printLogs(msg)
            } else if (cmd == "sticker"){
                msg.message = msg.quoted
                const file = await event.downloadAndSaveMediaMessage(msg, msg_id)
                mat = wa.getRandom('.webp')
                exec(`ffmpeg -i ${file} -ss 00:00:00 -t 00:00:15 ${mat}`, (err) => {
                    fs.unlinkSync(file)
                    if (err) return wa.sendMessage(to, 'Failed to convert video to sticker❌')
                    buffer = fs.readFileSync(mat)
                    wa.sendSticker(to, mat)
                    fs.unlinkSync(mat)
                })
                printLogs(msg)
            } else if (cmd.startsWith("sticker2")){
                const xtext = txt.replace('sticker2' + " ", "")
                cond = xtext.split("|")
                if(args.length === 1){
                    msg.message = msg.quoted
                    const file = await event.downloadAndSaveMediaMessage(msg, msg_id)
                    mat = wa.getRandom('.webp')
                    exof = await wa.addMetadata('BOT', "Mat")
                    exec(`ffmpeg -i ${file} -ss 00:00:00 -t 00:00:15 ${mat}`, (err) => {
                        fs.unlinkSync(file)
                        if (err) return wa.sendMessage(to, 'Failed to convert image to sticker❌')
                        exec(`webpmux -set exif ${exof} ${mat} -o ${mat}`, async (error) => {
                            if (error) return console.log(error)
                            wa.sendSticker(to, mat)
                            fs.unlinkSync(mat)
                        })
                    })
                }else{
                    if (!cond.length === 2) return
                    msg.message = msg.quoted
                    const file = await event.downloadAndSaveMediaMessage(msg, msg_id)
                    mat = wa.getRandom('.webp')
                    crot = wa.addMetadata(cond[0], cond[1])
                    exec(`ffmpeg -i ${file} -ss 00:00:00 -t 00:00:15 ${mat}`, (err) => {
                        fs.unlinkSync(file)
                        if (err) return wa.sendMessage(to, 'Failed to convert image to sticker❌')
                        exec(`webpmux -set exif ${crot} ${mat} -o ${mat}`, async (error) => {
                            if (error) return console.log(error)
                            wa.sendSticker(to, mat)
                            fs.unlinkSync(mat)
                        })
                    })
                }
                printLogs(msg)
            }
        // Reply Image
        } else if (qType === "imageMessage"){
            if (cmd.startsWith("upstatus")) {
                const xtext = cmd.replace("upstatus ", "")
                if(args.length === 1){
                    msg.message = msg.quoted
                    b = await event.downloadMediaMessage(msg)
                    event.sendMessage("status@broadcast", b, qType)
                    wa.sendReply(to, "Success Upload Status")
                }else{
                    msg.message = msg.quoted
                    b = await event.downloadMediaMessage(msg)
                    event.sendMessage("status@broadcast", b, qType, {'caption': xtext})
                    wa.sendReply(to, "Success Upload Status")
                }
                printLogs(msg)
            } else if (cmd == "sticker2"){
                msg.message = msg.quoted
                const file = await event.downloadAndSaveMediaMessage(msg, msg_id)
                mat = wa.getRandom('.webp')
                exec(`ffmpeg -i ${file} -vcodec libwebp -filter:v fps=fps=20 -lossless 1 -loop 0 -preset default -an -vsync 0 -s 512:512 ${mat}`, (err) => {
                    fs.unlinkSync(file)
                    if (err) return wa.sendMessage(to, 'Failed to convert image to sticker❌')
                    exec(`webpmux -set exif ${wa.addMetadata('BOT', "Mat")} ${mat} -o ${mat}`, async (error) => {
                        if (error) return console.log(error)
                        wa.sendSticker(to, mat)
                        fs.unlinkSync(mat)
                    })
                })
                printLogs(msg)
            } else if (cmd == "sticker"){
                msg.message = msg.quoted
                const file = await event.downloadAndSaveMediaMessage(msg, msg_id)
                mat = wa.getRandom('.webp')
                exec(`ffmpeg -i ${file} -vcodec libwebp -filter:v fps=fps=20 -lossless 1 -loop 0 -preset default -an -vsync 0 -s 512:512 ${mat}`, (err) => {
                    fs.unlinkSync(file)
                    if (err) return wa.sendMessage(to, 'Failed to convert image to sticker❌')
                    buffer = fs.readFileSync(mat)
                    wa.sendSticker(to, mat)
                    fs.unlinkSync(mat)
                })
                printLogs(msg)
            } else if (cmd == "img2url"){
                msg.message = msg.quoted
                const file = await event.downloadAndSaveMediaMessage(msg, msg_id)
                const stream = fs.createReadStream(file);
                const form = new FormData();
                form.append('img', stream);
                const res = await requests('http://hujanapi.xyz/api/image2url?apikey='+APIKUY, { method: 'POST', body: form })
                const ret =  await res.json()
                wa.sendMessage(to, ret.result.url)
                fs.unlinkSync(file)
                printLogs(msg)
            } else if (cmd == "setfakestatus"){
                msg.message = msg.quoted
                await event.downloadAndSaveMediaMessage(msg, "./media/pictfakestatus")
                setting.pictFakestatus = "./media/pictfakestatus.jpeg"
                fs.writeFileSync('./settings.json', JSON.stringify(setting, null, 2))
                wa.sendReply(to, "succes")
                printLogs(msg)
            } else if (cmd == "setfakethumb"){
                msg.message = msg.quoted
                await event.downloadAndSaveMediaMessage(msg, "./media/pictfakethumb")
                setting.pictFakethumb = "./media/pictfakestatus.jpeg"
                fs.writeFileSync('./settings.json', JSON.stringify(setting, null, 2))
                wa.sendReply(to, "succes")
                printLogs(msg)
            } else if (cmd == "setpictdefeca"){
                msg.message = msg.quoted
                await event.downloadAndSaveMediaMessage(msg, "./media/pictfakestatus")
                setting.pictDeface = "./media/pictdeface.jpeg"
                fs.writeFileSync('./settings.json', JSON.stringify(setting, null, 2))
                wa.sendReply(to, "succes")
                printLogs(msg)
            } else if (cmd == "set pictgroup") {
                if (msg.isGroup){
                    try{
                        msg.message = msg.quoted
                        const file = await event.downloadAndSaveMediaMessage(msg, "./media/"+msg_id)
                        const img = fs.readFileSync(file)
                        await event.updateProfilePicture(to, img)
                        wa.sendReply(to, "Success Change Picture Group")
                        fs.unlinkSync(file)
                    } catch {wa.sendReplyWA(to, "Failed\nOnly Admin can settings group picture", "Change Group Picture")}
                } else {wa.sendMessage(to, 'Only Group')}
                printLogs(msg)
            } else if (cmd == "set picture") {
                msg.message = msg.quoted
                const file = await event.downloadAndSaveMediaMessage(msg, "./media/"+msg_id)
                const img = fs.readFileSync(file)
                await event.updateProfilePicture(event.user.jid, img)
                wa.sendReply(to, "Success Change Picture Profile")
                fs.unlinkSync(file)
                printLogs(msg)
            } else if (cmd == "to hidetag"){
                msg.message = msg.quoted
                const file = await event.downloadAndSaveMediaMessage(msg, msg_id)
                wa.hideTagImage(to, file)
                fs.unlinkSync(file)
                printLogs(msg)
            } else if (cmd.startsWith("addimg")) {
                const xtext = cmd.replace("addimg ", "")
                if (!imguy[xtext]){
                    msg.message = msg.quoted
                    const file = await event.downloadAndSaveMediaMessage(msg, "./media/tmp/"+xtext)
                    imguy[xtext] = "./media/tmp/"+xtext+".jpeg"
                    fs.writeFileSync('./mat/data/image.json', JSON.stringify(imguy, null, 2))
                    wa.sendReply(to, "success save image "+ xtext)
                } else {
                    wa.sendReply(to, "*"+xtext+"* already in key _image_")
                }
                printLogs(msg)
            }
        // Batas Reply Image
        } else if (cmd == "to sscode"){
            if (Object.keys(msg.quoted)[0] === "conversation"){
                xtext = msg.quoted.conversation
                const code = await requests('http://hujanapi.xyz/api/sscode?query='+xtext+'&apikey='+APIKUY)
                const mat = await code.json()
                wa.sendMediaURL(to,mat.result)
                printLogs(msg)
            }
        } else if (cmd == "totext"){
            if (Object.keys(msg.quoted)[0] === "audioMessage") {
                msg.message = msg.quoted
                const file = await event.downloadAndSaveMediaMessage(msg, msg_id)
                const stream = fs.createReadStream(file);
                const form = new FormData();
                form.append('audio', stream);
                const res = await requests('http://hujanapi.xyz/api/stt?apikey='+APIKUY, { method: 'POST', body: form })
                const ret =  await res.json()
                wa.sendMessage(to, ret.result)
                fs.unlinkSync(file)
                printLogs(msg)
            }
        } else if (Object.keys(msg.quoted)[0] === "audioMessage"){
            if (cmd.startsWith("addvoice")) {
                const xtext = cmd.replace("addvoice ", "")
                if (!voiceuy[xtext]){
                    voiceuy[xtext] = msg.quoted.audioMessage
                    fs.writeFileSync('./mat/data/voice.json', JSON.stringify(voiceuy, null, 2))
                    wa.sendReply(to, "success save voice "+ xtext)
                } else {
                    wa.sendReply(to, "*"+xtext+"* already in key _voice_")
                }
                printLogs(msg)
            }
        } else if (Object.keys(msg.quoted)[0] === "stickerMessage"){
            if (cmd.startsWith("addsticker")) {
                const xtext = cmd.replace("addsticker ", "")
                if (!stickuy[xtext]){
                    stickuy[xtext] = msg.quoted.stickerMessage
                    fs.writeFileSync('./mat/data/sticker.json', JSON.stringify(stickuy, null, 2))
                    wa.sendReply(to, "success save sticker "+ xtext)
                } else {
                    wa.sendReply(to, "*"+xtext+"* already in key _sticker_")
                }
                printLogs(msg)
            }else if (cmd == "toimg") {
                msg.message = msg.quoted
                gerak = msg.quoted.stickerMessage.firstFrameSidecar
                const file = await event.downloadAndSaveMediaMessage(msg, msg_id)
                mat = wa.getRandom('.png')
                exec(`ffmpeg -i ${file} ${mat}`, (err) => {
                    fs.unlinkSync(file)
                    if (err) return wa.sendMessage(to, 'Failed to convert sticker to image❌')
                    buffer = fs.readFileSync(mat)
                    wa.sendImage(to, mat)
                    fs.unlinkSync(mat)
                })
                printLogs(msg)
            }else if (cmd == "takesticker") {
                msg.message = msg.quoted
                gerak = msg.quoted.stickerMessage.firstFrameSidecar
                const file = await event.downloadAndSaveMediaMessage(msg, msg_id)
                exec(`webpmux -set exif ${wa.addMetadata('BOT', "Mat")} ${file} -o ${file}`, async (error) => {
                    if (error) return console.log(error)
                    wa.sendSticker(to, file)
                    fs.unlinkSync(file)
                })
                printLogs(msg)
            } else if (cmd == "tomp4") {
                msg.message = msg.quoted
                const file = await event.downloadAndSaveMediaMessage(msg, msg_id)
                const stream = fs.createReadStream(file);
                const form = new FormData();
                form.append('webp', stream);
                const res = await requests('http://hujanapi.xyz/api/webp2mp4?apikey='+APIKUY, { method: 'POST', body: form })
                const ret =  await res.json()
                wa.sendMediaURL(to, ret.result)
                fs.unlinkSync(file)
                printLogs(msg)
            } else if (cmd == "togif") {
                msg.message = msg.quoted
                const file = await event.downloadAndSaveMediaMessage(msg, msg_id)
                const stream = fs.createReadStream(file);
                const form = new FormData();
                form.append('webp', stream);
                const res = await requests('http://hujanapi.xyz/api/webp2mp4?apikey='+APIKUY, { method: 'POST', body: form })
                const ret =  await res.json()
                wa.downloadFile(ret.result, "./media/output.mp4")
                setTimeout(async ()=>{
                    fs.unlinkSync(file)
                    wa.sendGif(to, "./media/output.mp4")
                    fs.unlinkSync("./media/output.mp4")
                },5000)
                printLogs(msg)
            } else if (cmd == "to hidetag"){
                msg.message = msg.quoted
                const file = await event.downloadAndSaveMediaMessage(msg, msg_id)
                wa.hideTagSticker(to, file)
                fs.unlinkSync(file)
                printLogs(msg)
            }
        } else if (cmd == "delete"){
            idx = msg.message.extendedTextMessage.contextInfo.stanzaId
            if (tmp_ids.includes(idx)) {
                event.deleteMessage(to, { id: idx, remoteJid: to, fromMe: true })
            } else {
                wa.sendMessage(to, "Error❌, Bot Cannot Unsend message other people!")
            }
            printLogs(msg)
        }
    }
    if (setting.responder.tag.status){
        if (msg.mentionedJid){
            if (msg.mentionedJid.includes(event.user.jid)){
                if (event.user.jid.includes(sender)) return
                if(!respon_tag[sender]){
                    respon_tag[sender] = true
                    wa.sendReply(to, setting.responder.tag.message[to], [sender])
                }
            }
        }
    }
    if (setting.responder.pm.status){
        if (!msg.isGroup){
            if (msg.key.fromMe === false && ! to.includes("status@broadcast")){
                if(! respon_pm[sender]){
                    respon_pm[sender] = true
                    wa.sendReplyWA(to, setting.responder.pm.message, "Auto Respon", [sender])
                }
            }
        }
    }
    if (msg){
        //console.log(chat)
        if (cmd.startsWith("!")) {
            if (owner.includes(sender)){
                const sep = text.split("\n")
                let exc = text.replace(sep[0]+"\n", "")
                const print = function(text){
                    a = JSON.stringify(text, null, 2)
                    wa.sendMessage(to, util.format(JSON.parse(a)))
                    //wa.sendMessage(to, a)
                }
                const j4p = function(tx){
                    wa.sendMessage(to, JSON.stringify(tx, null, 4))
                }
                console.log(exc)
                eval("(async () => {try{"+exc+"}catch(e){wa.sendMessage(to,  e.toString())}})()")
                printLogs(msg)
            }
        }
        if (cmd === "hi"){
            if (!modecmd(sender)) return
                wa.sendReply(to, "hai juga")
                wa.sendReplyWA(to, "Hey @!", "HujanAPI.xyz", [sender])
        }else if (cmd == "mode public"){
            if (owner.includes(sender)){
                if (setting.Modepublic.status == true){
                    wa.sendReply(to, 'Mode Public already active')
                } else {
                    setting.Modepublic.status = true
                    fs.writeFileSync('./settings.json', JSON.stringify(setting, null, 2))
                    wa.sendReply(to, 'Success activated Mode Public')
                }
            }
            printLogs(msg)
        } else if (cmd == "mode self"){
            if (owner.includes(sender)){
                if (setting.Modepublic.status == false){
                    wa.sendReply(to, 'Mode Self already active')
                } else {
                    setting.Modepublic.status = false
                    fs.writeFileSync('./settings.json', JSON.stringify(setting, null, 2))
                    wa.sendReply(to, 'Success activated Mode Self')
                }
            }
            printLogs(msg)
        } else if (cmd === "me"){
            if (!modecmd(sender)) return
                wa.sendContact(to, sender, "Your Contact")
                printLogs(msg)
        } else if (cmd === "owner"){
            if (!modecmd(sender)) return
            wa.sendContact(to, "6281396061030@s.whatsapp.net", "Owner")
            printLogs(msg)
        } else if (cmd === "runtime"){
            if (!modecmd(sender)) return
            runtime = process.uptime()
            a = cih(runtime)
            wa.sendReply(to, a)
            printLogs(msg)
        } else if (cmd === "settings"){
            if (!modecmd(sender)) return
            let mat = "*Settings*\n"
            if (setting.responder.tag.status == true) { mat += "\n⋄ Respontag < *On* >\n  └ "+setting.responder.tag.message[to]+" < MSG >" } else if (setting.responder.tag.status == false) { mat += "\n⋄ Respontag < *Off* >\n  └ "+setting.responder.tag.message[to]+" < MSG >" }
            if (setting.responder.pm.status == true) { mat += "\n⋄ Responpm < *On* >\n  └ "+setting.responder.pm.message+" < MSG >" } else if (setting.responder.pm.status == false) { mat += "\n⋄ Responpm < *Off* >\n  └ "+setting.responder.pm.message+" < MSG >" }
            if (setting.responder.welcome.status == true) { mat += "\n⋄ Welcome < *On* >\n  └ "+setting.responder.welcome.message[to]+" < MSG >" } else if (setting.responder.welcome.status == false) { mat += "\n⋄ Welcome < *Off* >\n  └ "+setting.responder.welcome.message[to]+" < MSG >" }
            if (setting.responder.leave.status == true) { mat += "\n⋄ Leave < *On* >\n  └ "+setting.responder.leave.message[to]+" < MSG >" } else if (setting.responder.leave.status == false) { mat += "\n⋄ Leave < *Off* >\n  └ "+setting.responder.leave.message[to]+" < MSG >" }
            wa.sendReply(to, mat)
            printLogs(msg)
        } else if (cmd === "help"){
            if (!modecmd(sender)) return
            let mode = ""
            if(setting.Modepublic.status){ mode += "Mode Public" } else if(!setting.Modepublic.status) { mode += "Mode Self" }
            const cr1 = '6281396061030@s.whatsapp.net'
            const cr2 = '6282260888474@s.whatsapp.net'
            let mat = '*< Help Messages >*\n\n'
            mat += `_${mode}_\n`
            mat += `_Total Hit_ *${tmp_hit.length}*\n\n`
            mat += '_Creator:_\n'
            mat += '1. @!\n'
            mat += '2. @!\n'
            mat += 'Github: https://github.com/mamet8/Whatsapp-Bot\n\n'
            mat += '_Command:_ *NO PREFIX*\n'
            mat += '⤷ Hi\n'
            mat += '⤷ Owner\n'
            mat += '⤷ Me\n'
            mat += '⤷ Speed\n'
            mat += '⤷ Runtime\n'
            mat += '⤷ Settings\n'
            mat += '⤷ Grouplist\n'
            mat += '⤷ Tagall\n'
            mat += '⤷ Grouplink\n'
            mat += '⤷ Admingroup\n'
            mat += '⤷ Ownergroup\n'
            mat += '⤷ Onlyadminmsg\n'
            mat += '⤷ Setgroupdesc <text>\n'
            mat += '⤷ Setgroupname <text>\n'
            mat += '⤷ Fakereply <msg you>|<msg target>|<@>\n'
            mat += '⤷ Hidetag\n'
            mat += '⤷ Joingc <link gc>\n'
            mat += '⤷ Getpict <@>\n'
            mat += '⤷ Getbio <@>\n'
            mat += '⤷ Kick <@>\n'
            mat += '⤷ Demote <@>\n'
            mat += '⤷ Promote <@>\n'
            mat += '⤷ Block <@>\n'
            mat += '⤷ Unblock <@>\n'
            mat += '⤷ Listblock <@>\n'
            mat += '⤷ Autoread\n'
            mat += '⤷ Respontag\n'
            mat += '⤷ Responpm\n'
            mat += '⤷ Respongroupupdate\n'
            mat += '⤷ Welcome\n'
            mat += '⤷ Leave\n'
            mat += '⤷ Searhmsg <msg>\n'
            mat += '⤷ Readallchat\n'
            mat += '⤷ Callblock\n'
            mat += '⤷ Liststicker\n'
            mat += '⤷ Delsticker <name>\n'
            mat += '⤷ Listimg\n'
            mat += '⤷ Delimg <name>\n'
            mat += '⤷ Listvoice\n'
            mat += '⤷ Delvoice <name>\n'
            mat += '\n'
            mat += '\n*Media:*\n'
            mat += '⤷ Ig\n'
            mat += '⤷ Youtube\n'
            mat += '⤷ Quranlist\n'
            mat += '⤷ Surah <num>\n'
            mat += '⤷ Ayatkursi\n'
            mat += '⤷ Nabi\n'
            mat += '⤷ Apkpure\n'
            mat += '⤷ PokemonRandom\n'
            mat += '⤷ Pokemon <text>\n'
            mat += '⤷ Dobgin <text>\n'
            mat += '⤷ Nekobin <text>\n'
            mat += '⤷ Nickff <id>\n'
            mat += '⤷ Nickml <id>|<serverid>\n'
            mat += '⤷ Nickcodm <id>\n'
            mat += '⤷ Ceklistrik <nopelanggan>\n'
            mat += '⤷ Cektelkom <nopelanggan>\n'
            mat += '⤷ Sscode <text>\n'
            mat += '⤷ Herolistml\n'
            mat += '⤷ Heroml <hero>\n'
            mat += '⤷ Charsgenshin\n'
            mat += '⤷ Chargi <hero>\n'
            mat += '⤷ Urlshortener1 <url>\n'
            mat += '⤷ Urlshortener2 <url>\n'
            mat += '⤷ Ssweb <url>\n'
            mat += '⤷ Zippydl <url>\n'
            mat += '⤷ Solidfilesdl <url>\n'
            mat += '⤷ Mediafiredl <url>\n'
            mat += '⤷ Fancytext <text>\n'
            mat += '⤷ Topnews\n'
            mat += '⤷ Lirik <text>\n'
            mat += '⤷ Chord <text>\n'
            mat += '⤷ Wikipedia <text>\n'
            mat += '⤷ Gsmarena <text>\n'
            mat += '⤷ Ssweb <url>\n'
            mat += '⤷ Artinama <nama>\n'
            mat += '⤷ Artimimpi <text>\n'
            mat += '⤷ Ramalanjodoh <nama1>|<nama2>\n'
            mat += '⤷ Cersex\n'
            mat += '⤷ Quotes\n'
            mat += '⤷ Quoteid\n'
            mat += '⤷ Quotesanime\n'
            mat += '⤷ Randomcat\n'
            mat += '⤷ Randomloli\n'
            mat += '⤷ Randomblowjob\n'
            mat += '⤷ Randomhentai\n'
            mat += '⤷ Randomkiss\n'
            mat += '⤷ Randomhug\n'
            mat += '⤷ Randomcry\n'
            mat += '⤷ Randomanime\n'
            mat += '⤷ Randomwaifu\n'
            mat += '⤷ Doujin\n'
            mat += '⤷ Kiryuu <text>\n'
            mat += '⤷ Kiryuudl <url>\n'
            mat += '⤷ Shopee <text>\n'
            mat += '⤷ Xvideos <text>\n'
            mat += '⤷ Xvideosdl <url>\n'
            mat += '⤷ Xnxx <text>\n'
            mat += '⤷ Xnxxdl <url>\n'
            mat += '⤷ FFlogo <text>|<hero>\n'
            mat += '⤷ MLlogo <text>|<hero>\n'
            mat += '⤷ Listhero mllogo\n'
            mat += '⤷ Listhero fflogo\n'
            mat += '\n*Reply Command:*\n'
            mat += '⤷ Set Picture\n'
            mat += '⤷ Set Pictgroup\n'
            mat += '⤷ Img2url\n'
            mat += '⤷ Setfakethumb <img>\n'
            mat += '⤷ Setpictdeface <img>\n'
            mat += '⤷ Setfakestatus <img>\n'
            mat += '⤷ Totext\n'
            mat += '⤷ To sscode\n'
            mat += '⤷ To Hidetag <img/sticker>\n'
            mat += '⤷ Toimg\n'
            mat += '⤷ Tomp4'
            wa.sendMention(to, mat, [cr1,cr2])
            printLogs(msg)
        } else if (cmd === "speed"){
            if (!modecmd(sender)) return
            const timestamp = speed();
            const latensi = speed() - timestamp
            wa.sendMessage(to, "*Speed:* "+latensi.toFixed(4)+" _Second_")
            printLogs(msg)
        } else if (cmd === "halo"){
            if (!modecmd(sender)) return
            wa.sendMessage(to, "halo juga")
            printLogs(msg)
        } else if (cmd == "!leave") {
            if (!event.user.jid) return
            wa.leaveGroup(to)
            printLogs(msg)
        } else if (cmd == "tagall") {
            if (!msg.isGroup) return wa.sendMessage(to, 'Only Group')
            if (!modecmd(sender)) return
            const ginfo = await wa.getGroup(to)
            var xyz = await wa.getParticipantIds(to)
            let mids = []
            let fox = "*Tag All Groups*\n"
            let no = 0
            for (let mem of xyz) {
                no += 1
                fox += "\n" + no + ". @!"
                mids.push(mem)
            }
            fox += "\n\nName: "+ginfo.subject+"\nMember: "+mids.length+"\n\n𝗦𝗘𝗟𝗙𝗕𝗢𝗧-𝗪𝗔"
            wa.sendReplyWA(to, fox, "HujanAPI.xyz", mids)
            printLogs(msg)
        } else if (cmd == "admingroup") {
            if (!modecmd(sender)) return
            var xyz = await wa.getAdminIds(to)
            let mids = []
            let fox = "*Admin Groups*\n"
            let no = 0
            for (let mem of xyz) {
                no += 1
                fox += "\n" + no + ". @!"
                mids.push(mem)
            }
            fox += "\n\nTotal: "+mids.length
            wa.sendMention(to, fox, mids)
            printLogs(msg)
        } else if (cmd == "ownergroup") {
            var admin = await wa.getOwnerIds(to)
            let xyz = "*Owner Groups*\n"
            xyz += "\n@!"
            wa.sendMention(to, xyz, admin[0])
            printLogs(msg)
        } else if (cmd == "grouplist") {
            if (!modecmd(sender)) return
            var glist = await wa.getGroups(to)
            let gid = []
            let fox = "*Groups List*\n"
            let no = 0
            for (let a of glist) {
                const name = event.contacts[a].name
                const groupid = event.contacts[a].jid
                no += 1
                fox += "\n"+no+". "+name+" | "+groupid
                gid.push(a)
            }
            fox += "\n\nTotal: "+gid.length
            wa.sendMessage(to, fox)
            printLogs(msg)
        } else if (cmd.startsWith("grouplink")){
            if (!modecmd(sender)) return
            const code = await wa.getGroupInvitationCode(to)
            wa.sendMessage(to, code)
            printLogs(msg)
        } else if (cmd.startsWith("joingc")){
            if (!modecmd(sender)) return
            try {
                const xtext = text.replace('joingc' + " ", "")
                mat = xtext.replace('https://chat.whatsapp.com/','')
                await event.acceptInvite(mat)
                wa.sendReply(to, "Success Join to Group")
            } catch {
                wa.sendReply(to, "Link Group Error")
            }
            printLogs(msg)
        } else if (cmd.startsWith("setgroupdesc")){
            if (!modecmd(sender)) return
            const xtext = cmd.replace('setgroupdesc' + " ", "")
            try {
                await event.groupUpdateDescription(to, xtext)
            } catch {
                wa.sendReply(to, "Failed\nOnly Admin can settings group desc")
            }
            printLogs(msg)
        } else if (cmd.startsWith("setgroupname")){
            if (!modecmd(sender)) return
            const xtext = cmd.replace('setgroupname' + " ", "")
            try {
                await event.groupUpdateSubject(to, xtext)
            } catch {
                wa.sendReply(to, "Failed\nOnly Admin can settings group name")
            }
            printLogs(msg)
        } else if (cmd.startsWith("groupinfo")){
            if (!modecmd(sender)) return
            const pict = await wa.getPict(to)
            const g = await wa.getGroup(to)
            const admin = await wa.getAdminIds(to)
            const owner = await wa.getOwnerIds(to)
            const members = await wa.getParticipantIds(to)
            const milliseconds = g.creation * 1000
            const dateObject = new Date(milliseconds)
            const createdtime = dateObject.toLocaleString()
            let gdesc = ""
            if (g.desc == undefined){
                gdesc += "None"
            } else { gdesc += g.desc }
            let ginfo = "*- Group Information -*\n"
            ginfo += "\n*Group Name:*  \n"+g.subject
            ginfo += "\n*Group ID:*  \n"+g.id
            ginfo += "\n*Owner:* @!"
            ginfo += "\n\n*- Member Information -*"
            ginfo += "\n*Admin:*  _"+admin.length+"_"
            ginfo += "\n*Participant:*  _"+members.length+"_"
            ginfo += "\n\n*- History Information -*"
            ginfo += "\n*Created:*  \n"+createdtime
            ginfo += "\n\n*- Description -*"
            ginfo += "\n "+gdesc
            wa.sendMediaURL(to, pict, ginfo, owner)
            printLogs(msg)
        } else if (cmd.startsWith("getpict")) {
            if (!modecmd(sender)) return
            mentioned = m.message.extendedTextMessage.contextInfo.mentionedJid[0]
            const pict = wa.getPict(mentioned)
            wa.sendMediaURL(to, pict)
            printLogs(msg)
        } else if (cmd.startsWith("getbio")) {
            if (!modecmd(sender)) return
            mentioned = m.message.extendedTextMessage.contextInfo.mentionedJid[0]
            const pdata = await event.getStatus(mentioned)
            if (pdata.status == 401) {
                wa.sendMessage(to, "Status Profile Not Found")
            } else  {
                wa.sendMessage(to, pdata.status)
            }
            printLogs(msg)
        } else if (cmd.startsWith("hidetag")) {
            if (!modecmd(sender)) return
            if (args.length === 1) return 
            const xtext = cmd.replace('hidetag' + " ", "")
            wa.hideTag(to, xtext)
            printLogs(msg)
        } else if (cmd.startsWith("fakereply")) {
            if (!modecmd(sender)) return
            if (args.length === 1) return 
            const xtext = cmd.replace('fakereply' + " ", "")
            pemisah = xtext.split("|")
            user = m.message.extendedTextMessage.contextInfo.mentionedJid[0]
            wa.fakeReply(to, user, pemisah[0], pemisah[1])
            printLogs(msg)
        } else if (cmd.startsWith("demote")) {
            if (!modecmd(sender)) return
            if(args.length === 1) return  wa.sendMessage(to, "No target..")
            admin = await wa.getAdminIds(to)
            if (admin.includes(event.user.jid) == true){
                user = m.message.extendedTextMessage.contextInfo.mentionedJid
                await wa.demoteAdmin(to, user)
            }else{
                wa.sendReply(to, "Bot Not Admin!")
            }
            printLogs(msg)
        } else if (cmd.startsWith("promote")) {
            if (!modecmd(sender)) return
            if(args.length === 1) return  wa.sendMessage(to, "No target..")
            admin = await wa.getAdminIds(to)
            if (admin.includes(event.user.jid) == true){
                user = m.message.extendedTextMessage.contextInfo.mentionedJid
                await wa.promoteAdmin(to, user)
            }else{
                wa.sendReply(to, "Bot Not Admin!")
            }
            printLogs(msg)
        } else if (cmd.startsWith("kick")) {
            if (!modecmd(sender)) return
            if(args.length === 1) return  wa.sendMessage(to, "No target..")
            admin = await wa.getAdminIds(to)
            if (admin.includes(event.user.jid) == true){
                user = m.message.extendedTextMessage.contextInfo.mentionedJid
                await wa.kickMember(to, user)
            }else{
                wa.sendReply(to, "Bot Not Admin!")
            }
            printLogs(msg)
        } else if (cmd.startsWith("add")) {
            if (!modecmd(sender)) return
            admin = await wa.getAdminIds(to)
            if (admin.includes(event.user.jid) == true){
                const xtext = txt.replace('add' + " ", "")
                if (xtext.startsWith('08')) return wa.sendMessage(to, 'Use country code number')
                try {
                    num = `${xtext.replace(/ /g, '')}@s.whatsapp.net`
                    event.groupAdd(to, [num])
                } catch (e) {
                    console.log('Error :', e)
                    wa.sendMessage(to, 'Gagal menambahkan target, mungkin karena di private')
                }
            }else{
                wa.sendReply(to, "Bot Not Admin!")
            }
            printLogs(msg)
        } else if (cmd.startsWith("block")) {
            if (!modecmd(sender)) return
            if(args.length === 1) return
            user = m.message.extendedTextMessage.contextInfo.mentionedJid
            console.log(user)
            let no = 0
            let fox = "*Blocked*\n"
            for (let i of user){
                no += 1
                fox += "\n" + no + ". @!"
                await event.blockUser(i, "add")
            }
            fox += "\n\nSucces Blocked: "+user.length+" User"
            wa.sendReplyWA(to, fox, "HujanAPI.xyz", user)
            printLogs(msg)
        } else if (cmd.startsWith("unblock")) {
            if (!modecmd(sender)) return
            if(args.length === 1) return
            user = m.message.extendedTextMessage.contextInfo.mentionedJid
            console.log(user)
            let no = 0
            let fox = "*Unblocked*\n"
            for (let i of user){
                no += 1
                fox += "\n" + no + ". @!"
                await event.blockUser(i, "remove")
            }
            fox += "\n\nSucces Blocked: "+user.length+" User"
            wa.sendReplyWA(to, fox, "HujanAPI.xyz", user)
            printLogs(msg)
        } else if (cmd == "listblock") {
            if (!modecmd(sender)) return
            let mids = []
            let fox = "*Block List*\n"
            let no = 0
            for (let mem of blocked) {
                no += 1
                fox += "\n" + no + ". @!"
                mids.push(mem)
            }
            fox += "\n\nTotal: "+mids.length+"\n\n𝗦𝗘𝗟𝗙𝗕𝗢𝗧-𝗪𝗔"
            wa.sendReplyWA(to, fox, "HujanAPI.xyz", mids)
            printLogs(msg)
        }else if (cmd.startsWith("searhmsg")){
            if (owner.includes(sender)){
                const xtext = cmd.replace('searhmsg' + " ", "")
                cond = xtext.split(" ")
                const a = await event.searchMessages(xtext, to, 10, 1)// count 10 
                let fox = '「 Message Search 」\n\n'
                num = 0
                for (i of a.messages){
                    num += 1
                    if (i.message.conversation) {
                        if (i.key.fromMe){ 
                            fox += num+'. Sender: '+event.user.jid+'\n    Msg: '+i.message.conversation+'\n    MsgID: '+i.key.id+'\n    Type: conversation\n\n'
                        }else{
                            fox += num+'. Sender: '+i.key.participant+'\n    Msg: '+i.message.conversation+'\n    MsgID: '+i.key.id+'\n    Type: conversation\n\n'
                        } 
                    }
                    else if (i.message.extendedTextMessage){
                        if (i.key.fromMe){ 
                            fox += num+'. Sender: '+event.user.jid+'\n    Msg: '+i.message.extendedTextMessage.text+'\n    MsgID: '+i.key.id+'\n    Type: extendedTextMessage\n\n'
                        }else{
                            fox += num+'. Sender: '+i.key.participant+'\n    Msg: '+i.message.extendedTextMessage.text+'\n    MsgID: '+i.key.id+'\n    Type: extendedTextMessage\n\n'
                        } 
                    }
                }
                wa.sendMessage(to, fox)
            }
            printLogs(msg)
        }else if (cmd.startsWith("readallchat")){
            if (owner.includes(sender)){
                anu = await event.chats.all()
                event.setMaxListeners(25)
                for (let mat of anu) {
                    event.chatRead(mat.jid)
                }
                wa.sendReply(to, "success read all message")
            }
            printLogs(msg)
            
        } else if (cmd.startsWith("liststicker")) {
            if (!modecmd(sender)) return
            let tx = "╭───「 List Sticker 」"
            let no = 0
            for (i in stickuy){
                no += 1
                tx += `\n│ ${no}. ${i}`
            }
            tx += "\n╰───「 Hello World 」"
            wa.sendMessage(to, tx)
            printLogs(msg)
        } else if (cmd.startsWith("delsticker")) {
            if (!modecmd(sender)) return
            const xtext = cmd.replace("delsticker ", "")
            if (!stickuy[xtext]) return wa.sendMessage(to, `*${xtext}* not in key sticker`)
            delete stickuy[xtext]
            fs.writeFileSync('./mat/data/sticker.json', JSON.stringify(stickuy, null, 2))
            wa.sendReply(to, "*"+xtext+"* Sticker Key deleted")
            printLogs(msg)
        } else if (cmd.startsWith("listimg")) {
            if (!modecmd(sender)) return
            let tx = "╭───「 List Image 」"
            let no = 0
            for (i in imguy){
                no += 1
                tx += `\n│ ${no}. ${i}`
            }
            tx += "\n╰───「 Hello World 」"
            wa.sendMessage(to, tx)
            printLogs(msg)
        } else if (cmd.startsWith("delimg")) {
            if (!modecmd(sender)) return
            const xtext = cmd.replace("delimg ", "")
            if (!imguy[xtext]) return wa.sendMessage(to, `*${xtext}* not in key image`)
            fs.unlinkSync(imguy[xtext])
            delete imguy[xtext]
            fs.writeFileSync('./mat/data/image.json', JSON.stringify(imguy, null, 2))
            wa.sendReply(to, "*"+xtext+"* Sticker Key deleted")
            printLogs(msg)
        } else if (cmd.startsWith("listvoice")) {
            if (!modecmd(sender)) return
            let tx = "╭───「 List Voice 」"
            let no = 0
            for (i in voiceuy){
                no += 1
                tx += `\n│ ${no}. ${i}`
            }
            tx += "\n╰───「 Hello World 」"
            wa.sendMessage(to, tx)
            printLogs(msg)
        } else if (cmd.startsWith("delvoice")) {
            if (!modecmd(sender)) return
            const xtext = cmd.replace("delvoice ", "")
            if (!voiceuy[xtext]) return wa.sendMessage(to, `*${xtext}* not in key voice`)
            delete voiceuy[xtext]
            fs.writeFileSync('./mat/data/voice.json', JSON.stringify(voiceuy, null, 2))
            wa.sendReply(to, "*"+xtext+"* Voice Key deleted")
            printLogs(msg)

//============[ Media ]============\\
        } else if (cmd.startsWith("quranlist")) {
            if (!modecmd(sender)) return
            const response = await requests("http://hujanapi.xyz/api/surahalquran?apikey="+APIKUY)
            const mat = await response.json()
            let num = 0
            let xyz = "╭──「 Al-Qur'an 」"
            for (i of mat.data){
                num += 1
                xyz += "\n│ "+num+". "+i.name.transliteration.id
            }
            xyz += "╰ 「 Total: "+mat.data.length+" Surah 」"
            wa.sendReply(to, xyz)
            printLogs(msg)
        } else if (cmd.startsWith("surah")) {
            const xtext = text.replace("surah ", "")
            const response = await requests("http://hujanapi.xyz/api/surah?query="+xtext+"&apikey="+APIKUY)
            const mat = await response.json()
            let num = 0
            let xyz = " 「 Al-Qur'an 」\nSurah: *"+mat.name+"*\n"
            for (i of mat.verses){
                num += 1
                xyz += "\n"+num+". "+i.text
            }
            wa.sendReply(to, xyz)
            printLogs(msg)
        } else if (cmd.startsWith("ayatkursi")) {
            if (!modecmd(sender)) return
            const response = await requests("http://hujanapi.xyz/api/ayatkursi?apikey="+APIKUY)
            const mat = await response.json()
            let xyz = "*Ayatkursi*\n\n"
            xyz += mat.data.arabic
            wa.sendReply(to, xyz)
            printLogs(msg)
        } else if (cmd.startsWith("pinterest")) {
            if (!modecmd(sender)) return
            const xtext = cmd.replace('pinterest' + " ", "")
            const response = await requests("http://hujanapi.xyz/api/pinterest?query="+xtext+"&apikey="+APIKUY)
            const mat = await response.json()
            const data = mat.result.data
            let kya = data[Math.floor(Math.random() * data.length)]
            wa.sendMediaURL(to, kya)
            printLogs(msg)
        } else if (cmd.startsWith("jadwalshalat")) {
            if (!modecmd(sender)) return
            const xtext = cmd.replace('jadwalshalat' + " ", "")
            const response = await requests("http://hujanapi.xyz/api/jadwalsholat?query="+xtext+"&apikey="+APIKUY)
            const mat = await response.json()
            let fox = "*Jadwal Shalat "+xtext+"*\n"
            for (let i of mat.result) {
                fox += "\nSubuh: "+i.Subuh
                fox += "\nDzuhur: "+i.Dzuhur
                fox += "\nAshar: "+i.Ashar
                fox += "\nMaghrib: "+i.Maghrib
                fox += "\nIsya: "+i.Isya
            }
            wa.sendReply(to, fox)
            printLogs(msg)
        } else if (cmd.startsWith("stickerline")) {
            if (!modecmd(sender)) return
            const xtext = txt.replace('stickerline' + " ", "")
            const response = await requests("http://hujanapi.xyz/api/stickerline?url="+xtext+"&apikey="+APIKUY)
            const data = await response.json()
            const cok = data.result
            for (var iu = 0; iu < data.length; iu++) {
                if (data[iu].animation == true) {
                    wa.sendStickerUrl(to, data[iu].url)
                } else {
                    wa.sendStickerUrl(to, data[iu].url)
                }
            }
            printLogs(msg)
        } else if (cmd.startsWith("dogbin")) {
            if (!modecmd(sender)) return
            const xtext = cmd.replace('dogbin' + " ", "")
            const response = await requests("http://hujanapi.xyz/api/dogbin?text="+xtext+ "&apikey="+APIKUY)
            const mat = await response.json()
            wa.sendMessage(to, mat.result)
            printLogs(msg)
        } else if (cmd.startsWith("nekobin")) {
            if (!modecmd(sender)) return
            const xtext = cmd.replace('nekobin' + " ", "")
            const response = await requests("http://hujanapi.xyz/api/nekobin?text="+xtext+ "&apikey="+APIKUY)
            const mat = await response.json()
            wa.sendMessage(to, mat.result)
            printLogs(msg)
        } else if (cmd.startsWith("ceklistrik")) {
            if (!modecmd(sender)) return
            const xtext = cmd.replace('ceklistrik' + " ", "")
            const response = await requests("http://hujanapi.xyz/api/listrik?nop="+xtext+ "&apikey="+APIKUY)
            const mat = await response.json()
            if (mat.status == '422') {
                const crot = mat.meesage
                wa.sendMessage(to,"[ ERROR ]\n\n"+crot)
            } else if (mat.status == '200'){
                let crot = "*Tagihan PLN*\n"
                crot += "\nName: "+mat.result.name
                crot += "\nID Customer: "+mat.result.no_pel
                crot += "\nPeriode: "+mat.result.periode
                crot += "\nFee Admin: "+mat.result.fee_admin
                crot += "\nAmount: "+mat.result.amount
                wa.sendMessage(to,crot)
            }
            printLogs(msg)
        } else if (cmd.startsWith("cektelkom")) {
            if (!modecmd(sender)) return
            const xtext = cmd.replace('cektelkom' + " ", "")
            const response = await requests("http://hujanapi.xyz/api/telkom?nop="+xtext+ "&apikey="+APIKUY)
            const mat = await response.json()
            if (mat.status == '400') {
                const crot = mat.meesage
                wa.sendMessage(to,"[ ERROR ]\n\n"+crot)
            } else if (mat.result.error == false){
                let crot = "*Tagihan PLN*\n"
                crot += "\nCustomer Name: "+mat.result.customer_name
                crot += "\nID Customer: "+mat.result.customer_number
                crot += "\nFee Admin: "+mat.result.fee_admin
                crot += "\nTagihan: "+mat.result.tagihan
                crot += "\nTotal: "+mat.result.total
                wa.sendMessage(to,crot)
            } else if (mat.result.error == "Maaf, sedang error..."){
                wa.sendMessage(to, "[ ERROR ]\n Nomor ID Salah")
            }
            printLogs(msg)
        } else if (cmd.startsWith("sscode")) {
            if (!modecmd(sender)) return
            const xtext = cmd.replace('sscode' + " ", "")
            const response = await requests("http://hujanapi.xyz/api/sscode?query="+xtext+"&apikey="+APIKUY)
            const mat = await response.json()
            wa.sendMediaURL(to,mat.result)
            printLogs(msg)
        } else if (cmd.startsWith("nickff")) {
            if (!modecmd(sender)) return
            if (args.length === 1) return wa.sendReply(to, "Ex: *nickff [id ff]*\nContoh : *nickff 866740835*")
            const xtext = cmd.replace('nickff' + " ", "")
            const response = await requests("http://hujanapi.xyz/api/nickff?id="+xtext+"&apikey="+APIKUY)
            const mat = await response.json()
            wa.sendReply(to, mat.result)
            printLogs(msg)
        } else if (cmd.startsWith("nickcodm")) {
            if (!modecmd(sender)) return
            if (args.length === 1) return wa.sendReply(to, "Ex: *nickcodm [id codm]*\nContoh : *nickcodm 7852089867668209248*")
            const xtext = cmd.replace('nickff' + " ", "")
            const response = await requests("http://hujanapi.xyz/api/nickcodm?id="+xtext+"&apikey="+APIKUY)
            const mat = await response.json()
            wa.sendReply(to, mat.result)
            printLogs(msg)
        } else if (cmd.startsWith("nickml")) {
            if (!modecmd(sender)) return
            if (args.length === 1) return wa.sendReply(to, "Ex: *nickml [id ml]|[serverid]*\nContoh : *nickml 1161941|2002*")
            const xtext = cmd.replace('nickml' + " ", "")
            pemisah = xtext.split("|")
            const response = await requests("http://hujanapi.xyz/api/nickml?id="+pemisah[0]+"&serverid="+pemisah[1]+"&apikey="+APIKUY)
            const mat = await response.json()
            wa.sendReply(to, mat.result)
            printLogs(msg)
        } else if (cmd.startsWith("cocofundl")) {
            if (!modecmd(sender)) return
            const xtext = text.replace('cocofundl' + " ", "")
            const response = await requests("http://hujanapi.xyz/api/cocofun?url="+xtext+"&apikey=" + APIKUY)
            const data = await response.json()
            const cok = data.result
            wa.sendMediaURL(to, data.result.url, "*COCOFUN DOWNLOAD*")
            printLogs(msg)
        } else if (cmd == "herolistml") {
            if (!modecmd(sender)) return
            const response = await requests("http://hujanapi.xyz/api/listheroml?apikey=" + APIKUY)
            const data = await response.json()
            const asu = data.result
            let fox = "*List Hero*\n"
            let no = 0
            for (var a = 0; a < asu.length; a++) {
                no += 1
                fox += "\n" + no + ". " + asu[a].name
            }
            wa.sendMessage(to, fox)
            printLogs(msg)
        } else if (cmd.startsWith("heroml")) {
            if (!modecmd(sender)) return
            const xtext = cmd.replace('heroml' + " ", "")
            const response = await requests("http://hujanapi.xyz/api/heroml?hero="+xtext+"&apikey="+APIKUY)
            const datas = await response.json()
            const asu = datas.results
            let fox = "*Detail Hero*\n"
            fox += "\n*Title :* " + asu.name
            fox += "\n*Quotes :* " + asu.quotes
            fox += "\n*Role :* " + asu.role
            fox += "\n*Line Recommendation :* " + asu.line_recommendation
            fox += "\n*Price :* "
            fox += "\n    *BP:* "+asu.price.battlepoint
            fox += "\n    *DM:* "+asu.price.diamond
            fox += "\n    *Ticket:* "+asu.price.ticket
            fox += "\n\n*Attributes :*"
            fox += "\n    *Ability Critical Rate :* "+asu.attributes.ability_crit_rate
            fox += "\n    *Attack Speed :* "+asu.attributes.attack_speed
            fox += "\n    *Basic Attck CritRate :* "+asu.attributes.basic_atk_crit_rate
            fox += "\n    *HP :* "+asu.attributes.hp
            fox += "\n    *Hp Regen :* "+asu.attributes.hp_regen
            fox += "\n    *Magic Power :* "+asu.attributes.magic_power
            fox += "\n    *Mana :* "+asu.attributes.mana
            fox += "\n    *Mana Regen :* "+asu.attributes.mana_regen
            fox += "\n    *Movement Speed :* "+asu.attributes.movement_speed
            fox += "\n    *Pyhsical Attack :* "+asu.attributes.physical_attack
            fox += "\n    *Pyhsical Defense :* "+asu.attributes.physical_defense
            wa.sendMediaURL(to, asu.img, fox)
            printLogs(msg)
        } else if (cmd == "charsgenshin") {
            if (!modecmd(sender)) return
            const response = await requests("http://hujanapi.xyz/api/gichars?apikey=" + APIKUY)
            const data = await response.json()
            const liyue = data.result.liyue
            const mondstadt = data.result.mondstadt
            let fex = "\n\n*List Character Mondstadt*\n"
            let num = 0
            let fox = "*List Character Liyue*\n"
            let no = 0
            for (var a = 0; a < liyue.length; a++) {
                no += 1
                fox += "\n"+no+". "+liyue[a]
            }
            for (var a = 0; a < mondstadt.length; a++) {
                num += 1
                fex += "\n"+num+". "+mondstadt[a]
            }
            const mat = fox+" "+fex
            wa.sendMessage(to, mat)
            printLogs(msg)
        } else if (cmd.startsWith("chargi")) {
            if (!modecmd(sender)) return
            const xtext = cmd.replace('chargi' + " ", "")
            const response = await requests("http://hujanapi.xyz/api/gichar?query="+xtext+"&apikey="+APIKUY)
            const datas = await response.json()
            const asu = datas.result
            let fox = "*Detail Character*\n"
            fox += "\n*Title :* " + asu.title
            fox += "\n*Info :* " + asu.intro
            wa.sendMediaURL(to, asu.cover1, fox)
            await wa.sendMediaURL(to, asu.cv[0].audio[2])
            printLogs(msg)
        } else if (cmd.startsWith("pokemonrandom")) {
            if (!modecmd(sender)) return
            const response = await requests("http://hujanapi.xyz/api/pokemon?apikey="+APIKUY)
            const datas = await response.json()
            const asu = datas.result
            let weak = ""
            for (let i of asu.weakness) {
                weak += i+", "
            }
            let tipe = ""
            for (let i of asu.type) {
                tipe += i+", "
            }
            let fox = "*Random Pokemon*\n"
            fox += "\n*Title :* " + asu.name
            fox += "\n*Desc :* "+asu.desc
            fox += "\n*Info :*"
            fox += "\n  _Abilities :_ "+asu.description.abilities
            fox += "\n  _Category :_ "+asu.description.category
            fox += "\n  _Height :_ "+asu.description.height
            fox += "\n  _Weight :_ "+asu.description.weight
            fox += "\n*Weakness :* "+weak
            fox += "\n*Type :* "+tipe
            wa.sendMediaURL(to, asu.img, fox)
            printLogs(msg)
        } else if (cmd.startsWith("pokemon ")) {
            if (!modecmd(sender)) return
            const xtext = cmd.replace("pokemon ", "")
            const response = await requests("http://hujanapi.xyz/api/pokemonx?query="+xtext+"&apikey="+APIKUY)
            const datas = await response.json()
            const asu = datas.result
            let weak = ""
            for (let i of asu.weakness) {
                weak += i+", "
            }
            let tipe = ""
            for (let i of asu.type) {
                tipe += i+", "
            }
            let fox = "*Detail Pokemon*\n"
            fox += "\n*Title :* " + asu.name
            fox += "\n*Desc :* "+asu.desc
            fox += "\n*Info :*"
            fox += "\n  _Abilities :_ "+asu.description.abilities
            fox += "\n  _Category :_ "+asu.description.category
            fox += "\n  _Height :_ "+asu.description.height
            fox += "\n  _Weight :_ "+asu.description.weight
            fox += "\n*Weakness :* "+weak
            fox += "\n*Type :* "+tipe
            wa.sendMediaURL(to, asu.img, fox)
            printLogs(msg)
        } else if (cmd.startsWith("lirik")) {
            if (!modecmd(sender)) return
            const xtext = cmd.replace('lirik' + " ", "")
            const response = await requests("http://hujanapi.xyz/api/lirik?query="+xtext+"&apikey="+APIKUY)
            const data = await response.json()
            wa.sendReplyWA(to, data.lyric, "*Lirik Lagu "+data.title+"*")
            printLogs(msg)
        } else if (cmd.startsWith("chord")) {
            if (!modecmd(sender)) return
            const xtext = cmd.replace('chord' + " ", "")
            const response = await requests("http://hujanapi.xyz/api/chord?query="+xtext+"&apikey="+APIKUY)
            const data = await response.json()
            wa.sendMessage(to, data.result)
            printLogs(msg)
        } else if (cmd.startsWith("wikipedia")) {
            if (!modecmd(sender)) return
            const xtext = cmd.replace('wikipedia' + " ", "")
            const response = await requests("http://hujanapi.xyz/api/wikipedia?query=" + xtext + "&apikey="+APIKUY)
            const datas = await response.json()
            const asu = datas.result
            const pp = datas.result.img
            let fox = "*_WIKIPEDIA_*\n"
            fox += "\n*Title :* " + asu.title
            fox += "\n*Result :*\n" + asu.info
            for (var a = 0; a < pp.length; a++) {}
            wa.sendMediaURL(to, pp[0], fox)
            printLogs(msg)
        } else if (cmd.startsWith("gsmarena")) {
            if (!modecmd(sender)) return
            const xtext = cmd.replace('gsmarena' + " ", "")
            const response = await requests("http://hujanapi.xyz/api/gsmarena?query=" + xtext + "&apikey=" + APIKUY)
            const datas = await response.json()
            let fox = "*Result GSMarena*\n"
            fox += "\n*Title :*\n" + datas.result.title
            fox += "\n\n*Spesifikasi :*\n" + datas.result.spec
            wa.sendMediaURL(to, datas.result.img, fox)
            printLogs(msg)
        } else if (cmd.startsWith("artinama")) {
            if (!modecmd(sender)) return
            const xtext = cmd.replace('artinama' + " ", "")
            const response = await requests("http://hujanapi.xyz/api/artinama?query="+xtext+"&apikey="+APIKUY)
            const datas = await response.json()
            const asu = datas.result
            wa.sendMessage(to, asu.result)
            printLogs(msg)
        } else if (cmd.startsWith("artimimpi")) {
            if (!modecmd(sender)) return
            const xtext = cmd.replace('artimimpi' + " ", "")
            const response = await requests("http://hujanapi.xyz/api/artimimpi?query="+xtext+"&apikey="+APIKUY)
            const datas = await response.json()
            const asu = datas.result
            wa.sendMessage(to, asu.result)
            printLogs(msg)
        } else if (cmd.startsWith("jodoh")) {
            if (!modecmd(sender)) return
            const xtext = cmd.replace('jodoh' + " ", "")
            pemisah = xtext.split("|")
            const response = await requests("http://hujanapi.xyz/api/ramalanjodoh?name1="+pemisah[0]+"&name2="+pemisah[1]+"&apikey="+APIKUY)
            const datas = await response.json()
            const asu = datas.result
            let fox = '*Ramalan Jodoh*\n\n'
            fox += `*${asu.nama1}* dan *${asu.nama2}*\n`
            fox += '*Sisi Positif*: '+asu.positif
            fox += '\n*Sisi Negatif*: '+asu.negatif
            fox += '\n\n '+asu.desk
            wa.sendMediaURL(to, asu.img, fox)
            printLogs(msg)
        } else if (cmd.startsWith("urlshortener1")) {
            if (!modecmd(sender)) return
            const xtext = cmd.replace('urlshortener1' + " ", "")
            const response = await requests("http://hujanapi.xyz/api/shorturl?url="+xtext+"&apikey="+APIKUY)
            const anu = await response.json()
            wa.sendMessage(to, anu.result.Short)
            printLogs(msg)
        } else if (cmd.startsWith("urlshortener2")) {
            if (!modecmd(sender)) return
            const xtext = cmd.replace('urlshortener2' + " ", "")
            const response = await requests("http://hujanapi.xyz/api/cuttly?url="+xtext+"&apikey="+APIKUY)
            const anu = await response.json()
            wa.sendMessage(to, anu.result.Short)
            printLogs(msg)
        } else if (cmd.startsWith("ssweb")) {
            if (!modecmd(sender)) return
            const xtext = cmd.replace('ssweb' + " ", "")
            const response = await requests("http://hujanapi.xyz/api/ssweb?url="+xtext+"&apikey="+APIKUY)
            const mat = await response.json()
            wa.sendMediaURL(to, response, "*Your requests*")
            printLogs(msg)
        } else if (cmd.startsWith("mediafiredl")) {
            if (!modecmd(sender)) return
            const xtext = cmd.replace('mediafiredl' + " ", "")
            const response = await requests("http://hujanapi.xyz/api/mediafire?url="+xtext+"&apikey="+APIKUY)
            const mat = await response.json()
            let fox = '*Mediafire Download*\n\n'
            fox += '*Title:* '+mat.result.title
            fox += '\n*Size:* '+mat.result.size
            fox += '\n*Type:* '+mat.result.type
            fox += '\n*Link Download:* '+mat.result.url
            wa.sendMessage(to, fox)
            printLogs(msg)
        } else if (cmd.startsWith("zippydl")) {
            if (!modecmd(sender)) return
            const xtext = cmd.replace('zippydl' + " ", "")
            const response = await requests("http://hujanapi.xyz/api/zippydl?url="+xtext+"&apikey="+APIKUY)
            const mat = await response.json()
            let fox = '*Zippyshare Download*\n\n'
            fox += '\n*Size:* '+mat.size
            fox += '\n*Link Download:* '+mat.link
            wa.sendMessage(to, fox)
            printLogs(msg)
        } else if (cmd.startsWith("solidfilesdl")) {
            if (!modecmd(sender)) return
            const xtext = cmd.replace('solidfilesdl' + " ", "")
            const response = await requests("http://hujanapi.xyz/api/solidfiles?url="+xtext+"&apikey="+APIKUY)
            const mat = await response.json()
            let fox = '*Solidfiles Download*\n\n'
            fox += '*Title:* '+mat.result.title
            fox += '\n*Size:* '+mat.result.size
            fox += '\n*Link Download:* '+mat.result.url
            wa.sendMessage(to, fox)
            printLogs(msg)
        } else if (cmd.startsWith("fancytext")) {
            if (!modecmd(sender)) return
            const xtext = cmd.replace('fancytext' + " ", "")
            const response = await requests("http://hujanapi.xyz/api/fancy?query="+xtext+"&apikey="+APIKUY)
            const mat = await response.json()
            const asu = mat.result.data
            let fox = '*Fancytext*\n\n'
            let no = 0
            for (var a = 0; a < asu.length; a++) {
                no += 1
                fox += "\n" + no + ". " + asu[a]
            }
            wa.sendMessage(to, fox)
            printLogs(msg)
        } else if (cmd.startsWith("nabi")) {
            if (!modecmd(sender)) return
            pemisah = cmd.split(" ")
            const response = await requests("http://hujanapi.xyz/api/rasul?apikey="+APIKUY)
            const datas = await response.json()
            const xyz = datas.result.data
            if (pemisah.length == 1) {
                let num = 0
                let fox = "╭──「 Nama Nabi 」"
                for (i of xyz) {
                    num += 1
                    fox += "\n│ "+num+". "+i.name
                }
                fox += "\n│\n╰ *Hey* @! *For detail*:\n```nabi [number]```"
                wa.sendReply(to, fox, [sender])
            }
            if (pemisah.length == 2) {
                const value = Number(pemisah[1] - 1)
                console.log(value)
                let fox = "Title : " + xyz[value].name
                fox += "\nPlace : " + xyz[value].place
                fox += "\nStory :\n" + xyz[value].description
                wa.sendMediaURL(to, xyz[value].image_url, fox)
            }
            printLogs(msg)
        } else if (cmd.startsWith("shopee ")) {
            if (!modecmd(sender)) return
            const xtext = cmd.replace("shopee ", "")
            pemisah = xtext.split("|")
            const response = await requests("http://hujanapi.xyz/api/shopee?query="+xtext+"&count=10&apikey="+APIKUY)
            const datas = await response.json()
            const img = 'https://igo.space/wp-content/uploads/2020/09/logo.png'
            const asu = datas.result.items
            if (pemisah.length == 1)  {
                let num = 0
                let fox = "*_Shopee Search_*\n\n"
                for (var a = 0; a < asu.length; a++) {
                    num += 1
                    fox += "```"+asu[a].name+"```\n"+asu[a].link_produk+"```("+num+")```\n"
                }
                fox += "\n\n*Hey* @! *For detail*:\n```shopee "+xtext+"|number```"
                wa.sendMediaURL(to, img, fox, [sender])
            }
            if (pemisah.length == 2) {
                const num = pemisah[1]
                const value = Number(pemisah[1] - 1)
                let fox = "*_Detail Product Shopee*_\n"
                fox += "\nTitle : " + asu[value].name
                fox += "\nShop Loc : " + asu[value].shop_loc
                fox += "\nLink Product : " + asu[value].link_produk
                fox += "\nPrice : " + asu[value].price
                fox += "\nPrice Min and Max : " +asu[value].price_min+" "+asu[value].price_max
                fox += "\nDesc : " + asu[value].desc
                fox += "\n\n\nSource : " + datas.result.source
                wa.sendMediaURL(to, asu[value].image_cover, fox)
            }
            printLogs(msg)
        } else if (cmd.startsWith("topnews")) {
            if (!modecmd(sender)) return
            pemisah = cmd.split(" ")
            const response = await requests("http://hujanapi.xyz/api/topnews?apikey="+APIKUY)
            const mat = await response.json()
            let num = 0
            let fox = "*Topnews*\n\n"
            for (let i of mat.result) {
                num += 1
                fox += num+". Title: "+i.title+"\n "+i.url+"\n\n"
                //fox += num+". Title: "+i.title+"\nDesc: "+i.description+"\nPublishedAt: "+i.publishedAt+"\nSource: "+i.source.name+"\nURL:"+i.url+"\n\n"
            }
            wa.sendReply(to, fox)
            printLogs(msg)
        } else if (cmd.startsWith("doujin")) {
            if (!modecmd(sender)) return
            var sep = text.split(' ')
            const xtext = text.replace(sep[0] + " ", "")
            cond = xtext.split(" ")
            let res = "╭───「 Doujin 」"
            res += "\n├ Usage : "
            res += "\n│ • Doujin"
            res += "\n│ • Doujin Search <text>"
            res += "\n│ • Doujin Post <URL>"
            res += "\n│ • Doujin Latest"
            res += "\n╰───「 Hello World 」"
            if (cmd == "doujin") { 
                wa.sendMessage(to, res)
            } else if (cond[0].toLowerCase() == "search") {
                const response = await requests("http://hujanapi.xyz/api/doujindesuserach?query="+cond[1]+"&apikey="+APIKUY)
                const data = await response.json()
                const chap = data.result.chap
                let genres = ""
                for (let i of data.result.genre) {
                    genres += i+", "
                }
                let d = "  ｢ Doujin Search ｣\n"
                d += "\n• Title : "+data.result.title
                d += "\n• Genre : "+genres
                d += "\n• Total : "+chap.length+" Chapter"
                d += "\n• Info : \n"+data.result.info
                wa.sendMediaURL(to, data.result.img, d)
            } else if (cond[0].toLowerCase() == "post"){
                wa.sendReply(to, "Please wait....")
                const response = await requests("http://hujanapi.xyz/api/doujindesudl?url="+cond[1]+"&apikey="+APIKUY)
                const mat = await response.json()
                const media = mat.result.data
                const title = mat.result.title
                console.log(title)
                const PDFpages = [];
                for (let i = 0; i < media.length; i++) {
                    image_name = './media/tmp/imagepdf/'+i+'.jpg';
                    await new Promise((resolve) => request(media[i]).pipe(fs.createWriteStream(image_name)).on('finish', resolve))
                    PDFpages.push(image_name);
                }
                imgToPDF(PDFpages, 'A4').pipe(fs.createWriteStream('output.pdf'));
                try {
                    fs.readdir("./media/tmp/imagepdf/", (err, files) => {
                        if (err) throw err;
                        for (const file of files) {
                            fs.unlink(path.join("./media/tmp/imagepdf/", file), err => {
                            if (err) throw err;
                        });
                      }
                    });
                } catch (eRR) {
                    console.log(eRR);
                }
                setTimeout(async ()=>{return await wa.sendPdf(to, './output.pdf', mat.result.title);},5000)
                setTimeout(async ()=>{return await fs.unlinkSync('./output.pdf');},5000)
            } else if (cond[0].toLowerCase() == "latest"){
                const response = await requests("http://hujanapi.xyz/api/doujindesulatest?&apikey="+APIKUY)
                const data = await response.json()
                num = 0
                let d = "  ｢ Doujin Latest ｣\n"
                for (let i of data.result.data) {
                    num += 1
                    d += "\n"+num+". Title: "+i.title+"\nChapter: "+i.chapter+"\nLink: "+i.url+"\n"
                }
                wa.sendMessage(to, d)
            }
            printLogs(msg)
        } else if (cmd.startsWith("kiryuu ")) {
            if (!modecmd(sender)) return
            const xtext = cmd.replace("kiryuu ", "")
            pemisah = xtext.split("|")
            const response = await requests("http://hujanapi.xyz/api/kiryuu?query="+pemisah[0]+"&apikey="+APIKUY)
            const datas = await response.json()
            const asu = datas.result.data
            if (pemisah.length == 1)  {
                let num = 0
                let fox = "*_Kiryuu Search_*\n\n"
                for (var a = 0; a < asu.length; a++) {
                    num += 1
                    fox += "```"+asu[a].title+"```\n"+asu[a].url+"```("+num+")```\n"
                }
                fox += "\n\n*Hey* @! *For detail*:\n```kiryuu "+xtext+"|number```"
                wa.sendMention(to, fox, [sender])
            }
            if (pemisah.length == 2) {
                const value = Number(pemisah[1] - 1)
                const r = await requests("http://hujanapi.xyz/api/kiryuuinfo?url="+asu[value].url+"&apikey="+APIKUY)
                const mat = await r.json()
                const chap = mat.result.chapter
                let d = "  ｢ Kiryuu Search ｣\n"
                d += "\n• Title : "+mat.result.title
                d += "\n• Total : "+chap.length+" Chapter"
                d += "\n• Sipnosis : "+mat.result.sipnosis
                d += "\n• Info : \n"+mat.result.info
                wa.sendMediaURL(to, mat.result.img, d)
            }
            printLogs(msg)
         } else if (cmd.startsWith("kiryuudl ")) {
            if (!modecmd(sender)) return
            const xtext = cmd.replace("kiryuudl ", "")
            wa.sendReply(to, "Please wait....")
            const response = await requests("http://hujanapi.xyz/api/kiryuudl?query="+xtext+"&apikey="+APIKUY)
            const mat = await response.json()
            const media = mat.result.data
            const title = mat.result.title
            console.log(title)
            const PDFpages = [];
            for (let i = 0; i < media.length; i++) {
                image_name = './media/tmp/imagepdf/'+i+'.jpg';
                await new Promise((resolve) => request(media[i]).pipe(fs.createWriteStream(image_name)).on('finish', resolve))
                PDFpages.push(image_name);
            }
            imgToPDF(PDFpages, 'A4').pipe(fs.createWriteStream('output.pdf'));
            try {
                fs.readdir("./media/tmp/imagepdf/", (err, files) => {
                    if (err) throw err;
                    for (const file of files) {
                        fs.unlink(path.join("./media/tmp/imagepdf/", file), err => {
                        if (err) throw err;
                    });
                  }
                });
            } catch (eRR) {
                console.log(eRR);
            }
            setTimeout(async ()=>{return await wa.sendPdf(to, './output.pdf', mat.result.title);},5000)
            setTimeout(async ()=>{return await fs.unlinkSync('./output.pdf');},5000)
             printLogs(msg)
        } else if (cmd.startsWith("xvideos ")) {
            if (!modecmd(sender)) return
            const xtext = cmd.replace("xvideos ", "")
            pemisah = xtext.split("|")
            const search = pemisah[0]
            const response = await requests("http://hujanapi.xyz/api/xvideos?query="+search+"&apikey="+APIKUY)
            const datas = await response.json()
            const img = 'https://seeklogo.com/images/X/xvideos-logo-77E7B4F168-seeklogo.com.png'
            const asu = datas.result
            if (pemisah.length == 1)  {
                let num = 0
                let fox = "*_Xvideos Search_*\n\n"
                for (var a = 0; a < asu.length; a++) {
                    num += 1
                    fox += "```"+asu[a].title+"```\n"+asu[a].url+" ```("+num+")```\n"
                }
                fox += "\n\n*Hey* @! *For detail*:\n```xvideos "+xtext+"|number```"
                wa.sendMediaURL(to, img, fox, [sender])
            }
            if (pemisah.length == 2) {
                const num = pemisah[1]
                const value = Number(pemisah[1] - 1)
                let fox = "*_Detail Video*_\n"
                fox += "\nTitle : " + asu[value].title
                fox += "\nDuration : " + asu[value].duration
                fox += "\nChannel : " + asu[value].channel
                fox += "\nLink : " + asu[value].url
                fox += "\n\n\nSource : xvideos.com"
                wa.sendMediaURL(to, asu[value].image, fox)
            }
            printLogs(msg)
        } else if (cmd.startsWith("xnxx ")) {
            if (!modecmd(sender)) return
            const xtext = cmd.replace("xnxx ", "")
            pemisah = xtext.split("|")
            const response = await requests("http://hujanapi.xyz/api/xnxx?query="+xtext+"&apikey="+APIKUY)
            const datas = await response.json()
            const img = 'https://yt3.ggpht.com/ytc/AAUvwngpbURJyno0rvS4aza889YDF7-oXbRyopWO0bZO=s900-c-k-c0x00ffffff-no-rj'
            const asu = datas.result
            if (pemisah.length == 1)  {
                let num = 0
                let fox = "*_Xnxx Search_*\n\n"
                for (var a = 0; a < asu.length; a++) {
                    num += 1
                    fox += "```"+asu[a].title+"```\n"+asu[a].url+"```("+num+")```\n"
                }
                fox += "\n\n*Hey* @! *For detail*:\n```xnxx "+xtext+"|number```"
                wa.sendMediaURL(to, img, fox, [sender])
            }
            if (pemisah.length == 2) {
                const num = pemisah[1]
                const value = Number(pemisah[1] - 1)
                let fox = "*_Detail Video*_\n"
                fox += "\nTitle : " + asu[value].title
                fox += "\nDuration : " + asu[value].duration
                fox += "\nChannel : " + asu[value].channel
                fox += "\nLink : " + asu[value].url
                fox += "\n\n\nSource : xnxx.com"
                wa.sendMediaURL(to, asu[value].image, fox)
            }
            printLogs(msg)
        } else if (cmd.startsWith("xnxxdl ")) {
            if (!modecmd(sender)) return
            const xtext = cmd.replace("xnxxdl ", "")
            const response = await requests("http://hujanapi.xyz/api/xnxxdl?url="+xtext+"&apikey="+APIKUY)
            const asu = await response.json()
            if (Number(asu.size.split(' MB')[0]) > 40.00) return wa.sendReply(to, 'Error Send Video\ncause size file is big')
            let crot = "*Xnxx Download*\n\n"
            crot += "*Title*: "+asu.judul
            crot += "\n*Size*: "+asu.size
            crot += "\n*Url*\n"+asu.vid
            wa.sendReply(to, "Silahkan tunggu sebentar proses pengiriman file membutuhkan waktu beberapa menit.")
            wa.sendMediaURL(to, asu.vid, crot)
            printLogs(msg)
        } else if (cmd.startsWith("xvideosdl ")) {
            if (!modecmd(sender)) return
            const xtext = cmd.replace("xvideosdl ", "")
            const response = await requests("http://hujanapi.xyz/api/xvideosdl?url="+xtext+"&apikey="+APIKUY)
            const asu = await response.json()
            if (Number(asu.size.split(' MB')[0]) > 40.00) return wa.sendReply(to, 'Error Send Video\ncause size file is big')
            let crot = "*Xnxx Download*\n\n"
            crot += "*Title*: "+asu.judul
            crot += "\n*Size*: "+asu.size
            crot += "\n*Url*\n"+asu.vid
            wa.sendReply(to, "Silahkan tunggu sebentar proses pengiriman file membutuhkan waktu beberapa menit.")
            wa.sendMediaURL(to, asu.vid, crot)
            printLogs(msg)
        } else if (cmd.startsWith("cersex")) {
            if (!modecmd(sender)) return
            const xtext = cmd.replace('cersex' + " ", "")
            const response = await requests("http://hujanapi.xyz/api/cersex?apikey=" + APIKUY)
            const datas = await response.json()
            const asu = datas.result
            var img = asu.img
            let fox = `*${asu.title}*`
            fox += "\n\n" + asu.result
            wa.sendMediaURL(to, asu.img[0], fox)
            printLogs(msg)
        } else if (cmd == "randompantun") {
            if (!modecmd(sender)) return
            const response = await requests("http://hujanapi.xyz/api/pantun?apikey=" + APIKUY)
            const data = await response.json()
            const crot = data.result
            wa.sendMessage(to, crot.result)
            printLogs(msg)
        } else if (cmd == "quoteid") {
            if (!modecmd(sender)) return
            const response = await requests("http://hujanapi.xyz/api/quotesid?apikey=" + APIKUY)
            const data = await response.json()
            wa.sendMessage(to, data.result.quotes)
            printLogs(msg)
        } else if (cmd == "quotes") {
            if (!modecmd(sender)) return
            const response = await requests("http://hujanapi.xyz/api/quotesen?apikey=" + APIKUY)
            const data = await response.json()
            wa.sendMessage(to, data.result.quotes)
            printLogs(msg)
        } else if (cmd == "quotesanime") {
            if (!modecmd(sender)) return
            const response = await requests("http://hujanapi.xyz/api/quoteanime?apikey=" + APIKUY)
            const data = await response.json()
            const res = data.result.quote+"\n\nAnime:"+data.result.anime+"\nCharacter"+data.result.character
            wa.sendMessage(to, res)
            printLogs(msg)
        } else if (cmd == "randomcat") {
            if (!modecmd(sender)) return
            const response = await requests("http://hujanapi.xyz/api/randomcat?apikey=" + APIKUY)
            const data = await response.json()
            wa.sendMediaURL(to, data.result.url, "*_Random Cat_* @!", [sender])
            printLogs(msg)
        } else if (cmd.startsWith("fflogo")) {
            if (!modecmd(sender)) return
            try{
                const xtext = cmd.replace('fflogo' + " ", "")
                pemisah = xtext.split("|")
                const response = await requests("http://hujanapi.xyz/api/fftext?text="+pemisah[0]+"&hero="+pemisah[1]+"&apikey="+APIKUY)
                const mat = await response.json()
                wa.sendMediaURL(to, mat.result, "*Your requests*")
            }catch{
                wa.sendReply(to, "Error, hero not found. Please type *listhero mllogo* for see all hero")
            }
            printLogs(msg)
        } else if (cmd.startsWith("listhero fflogo")) {
            if (!modecmd(sender)) return
            const list = ["A124","Alok","Alvaro","Andrew","Antonio","Caroline","Hayato","Kapella","Kelly","Kla","Laura","Maxim","Miguel","Misa","Moco","Nikita","Notora","Olivia","Paloma","Rafael","Shani","Steffie"]
            let fox = "*List Hero FFLOGO*\n"
            let no = 0
            for (let i of list) {
                no += 1
                fox += "\n" + no + ". "+i
            }
            wa.sendReply(to, fox)
            printLogs(msg)
        } else if (cmd.startsWith("mllogo")) {
            if (!modecmd(sender)) return
            try{
                const xtext = cmd.replace('mllogo' + " ", "")
                pemisah = xtext.split("|")
                const response = await requests("http://hujanapi.xyz/api/mltext?text="+pemisah[0]+"&hero="+pemisah[1]+"&apikey="+APIKUY)
                const mat = await response.json()
                wa.sendMediaURL(to, mat.result, "*Your requests*")
            }catch{
                wa.sendReply(to, "Error, hero not found. Please type *listhero mllogo* for see all hero")
            }
            printLogs(msg)
        } else if (cmd.startsWith("listhero mllogo")) {
            if (!modecmd(sender)) return
            const list = ["Aldous","Alice 2","Angela 2","Argus 2","Chou","Chou 2","Estes","Eudora","Eudora 2","Granger","Granger 2","Gusion 3","Hanabi 2","Hanzo","Helcurt","Layla 3","Lesley 4","Lunox 2","Odette 3","Saber","Thamuz","Vexana","Argus","Dyrroth","Esmeralda 2","Kadita 2","Lancelot","Leomord 2","Lylia","Vale","Valir","X.Borg","Zhask","Alice","Alpha","Athena","Badang","Balmond","Bane","Diggie","Esmeralda","Fanny 2","Fanny 3","Freya","Guinevere","Gusion","Gusion 2","Hanabi","Harith","Harith 2","Hayabusa 2","Kadita","Kagura 2","Kagura 3","Karina 2","Kimmy","Layla 2","Leomord","Lesley 2","Lesley 3","Lunox","Martis","Miya 2","Nana","Nana 2","Natalia","Natalia 2","Odette 2","Pharsa","Rafaela 2","Selena 2","Zilong","Alucard","Angela","Bruno","Chang'e","Claude","Fanny","Hayabusa","Hilda","Hylos","Kagura","Karina","Karrie","Layla","Lesley","Lolita","Minotaur","Minsittar","Miya","Moskov","Odette","Rafaela","Selena"]
            let fox = "*List Hero MLLOGO*\n"
            let no = 0
            for (let i of list) {
                no += 1
                fox += "\n" + no + ". "+i
            }
            wa.sendReply(to, fox)
            printLogs(msg)
        } else if (cmd.startsWith("wetglass")) {
            if (!modecmd(sender)) return
            const xtext = txt.replace('wetglass' + " ", "")
            const response = await requests("http://hujanapi.xyz/api/wetglass?text="+xtext+"&apikey="+APIKUY)
            const mat = await response.json()
            wa.sendMediaURL(to, mat.result, "*Your Requests*")
            printLogs(msg)
        } else if (cmd.startsWith("thunder")) {
            if (!modecmd(sender)) return
            const xtext = txt.replace('thunder' + " ", "")
            const response = await requests("http://hujanapi.xyz/api/thunder?text="+xtext+"&apikey="+APIKUY)
            const mat = await response.json()
            wa.sendMediaURL(to, mat.result, "*Your Requests*")
            printLogs(msg)
        } else if (cmd.startsWith("blackpink")) {
            if (!modecmd(sender)) return
            const xtext = txt.replace('blackpink' + " ", "")
            const response = await requests("http://hujanapi.xyz/api/blackpink?text="+xtext+"&apikey="+APIKUY)
            const mat = await response.json()
            wa.sendMediaURL(to, mat.result, "*Your Requests*")
            printLogs(msg)
        } else if (cmd.startsWith("skyonline")) {
            if (!modecmd(sender)) return
            const xtext = txt.replace('skyonline' + " ", "")
            const response = await requests("http://hujanapi.xyz/api/skyonline?text="+xtext+"&apikey="+APIKUY)
            const mat = await response.json()
            wa.sendMediaURL(to, mat.result, "*Your Requests*")
            printLogs(msg)
        } else if (cmd.startsWith("greenneon")) {
            if (!modecmd(sender)) return
            const xtext = txt.replace('greenneon' + " ", "")
            const response = await requests("http://hujanapi.xyz/api/greenneon?text="+xtext+"&apikey="+APIKUY)
            const mat = await response.json()
            wa.sendMediaURL(to, mat.result, "*Your Requests*")
            printLogs(msg)
        } else if (cmd.startsWith("glitchtext")) {
            if (!modecmd(sender)) return
            const xtext = txt.replace('glitchtext' + " ", "")
            pemisah = xtext.split("|")
            const response = await requests("http://hujanapi.xyz/api/glitch_text?text1="+pemisah[0]+"&text2="+pemisah[1]+"&apikey="+APIKUY)
            const mat = await response.json()
            wa.sendMediaURL(to, mat.result, "*Your Requests*")
            printLogs(msg)
        } else if (cmd.startsWith("marvelavengers")) {
            if (!modecmd(sender)) return
            const xtext = txt.replace('marvelavengers' + " ", "")
            pemisah = xtext.split("|")
            const response = await requests("http://hujanapi.xyz/api/marvelavengers?text1="+pemisah[0]+"&text2="+pemisah[1]+"&apikey="+APIKUY)
            const mat = await response.json()
            wa.sendMediaURL(to, mat.result, "*Your Requests*")
            printLogs(msg)
        } else if (cmd.startsWith("marvelstudio")) {
            if (!modecmd(sender)) return
            const xtext = txt.replace('marvelstudio' + " ", "")
            pemisah = xtext.split("|")
            const response = await requests("http://hujanapi.xyz/api/marvelstudio?text1="+pemisah[0]+"&text2="+pemisah[1]+"&apikey="+APIKUY)
            const mat = await response.json()
            wa.sendMediaURL(to, mat.result, "*Your Requests*")
            printLogs(msg)
        } else if (cmd.startsWith("wolfblack")) {
            if (!modecmd(sender)) return
            const xtext = txt.replace('wolfblack' + " ", "")
            pemisah = xtext.split("|")
            const response = await requests("http://hujanapi.xyz/api/wolf_black?text1="+pemisah[0]+"&text2="+pemisah[1]+"&apikey="+APIKUY)
            const mat = await response.json()
            wa.sendMediaURL(to, mat.result, "*Your Requests*")
            printLogs(msg)
        } else if (cmd.startsWith("pornhub")) {
            if (!modecmd(sender)) return
            const xtext = txt.replace('pornhub' + " ", "")
            pemisah = xtext.split("|")
            const response = await requests("http://hujanapi.xyz/api/pornhub?text1="+pemisah[0]+"&text2="+pemisah[1]+"&apikey="+APIKUY)
            const mat = await response.json()
            wa.sendMediaURL(to, mat.result, "*Your Requests*")
            printLogs(msg)

        } else if (cmd.startsWith("youtube")) {
            if (!modecmd(sender)) return
            var sep = text.split(' ')
            const xtext = text.replace(sep[0] + " ", "")
            cond = xtext.split(" ")
            let res = "╭───「 Youtube 」"
            res += "\n├ Usage : "
            res += "\n│ • Youtube"
            res += "\n│ • Youtube Search <query>"
            res += "\n│ • Youtube Mp3 <URL>"
            res += "\n│ • Youtube Mp4 <url>"
            res += "\n╰───「 Hello World 」"
            if (cmd == "youtube") { 
                wa.sendMessage(to, res)
            } else if (cond[0].toLowerCase() == "search") {
                const response = await requests("http://hujanapi.xyz/api/ytsearch?query="+cond[1]+"&apikey="+APIKUY)
                const data = await response.json()
                const asu = data.result
                let fox = "*Youtube Search*\n"
                let no = 0
                for (var a = 0; a < asu.length; a++) {
                    no += 1
                    fox += "\n"+asu[a].title+"\n"+asu[a].url+" ("+no+")"
                }
                wa.sendMessage(to, fox)
            } else if (cond[0].toLowerCase() == "mp3") {
                const response = await requests("http://hujanapi.xyz/api/ytdl?url="+cond[1]+"&apikey="+APIKUY)
                const data = await response.json()
                let yt = "*Youtube MP3*\n\n"
                yt += "Title: _"+data.result.title+"_"
                yt += "\nDuration: _"+data.result.duration+"_"
                yt += "\nChannel: _"+data.result.author+"_"
                yt += "\nsize_audio: _"+data.result.size_audio+"_"
                wa.sendMediaURL(to, data.result.image, yt)
                wa.sendMediaURL(to, data.result.mp3)
            } else if (cond[0].toLowerCase() == "mp4") {
                const response = await requests("http://hujanapi.xyz/api/ytdl?url="+cond[1]+"&apikey="+APIKUY)
                const data = await response.json()
                let yt = "*Youtube MP3*\n\n"
                yt += "Title: _"+data.result.title+"_"
                yt += "\nDuration: _"+data.result.duration+"_"
                yt += "\nChannel: _"+data.result.author+"_"
                yt += "\nsize_audio: _"+data.result.size_video+"_"
                wa.sendMediaURL(to, data.result.image, yt)
                wa.sendMediaURL(to, data.result.mp4)
            }
            printLogs(msg)

        } else if (cmd.startsWith("apkpure")) {
            if (!modecmd(sender)) return
            var sep = text.split(' ')
            const xtext = text.replace(sep[0] + " ", "")
            cond = xtext.split(" ")
            let res = "╭───「 Apkpure 」"
            res += "\n├ Usage : "
            res += "\n│ • Apkpure"
            res += "\n│ • Apkpure Search <query>"
            res += "\n│ • Apkpure Download <URL>"
            res += "\n╰───「 Hello World 」"
            if (cmd == "apkpure") { 
                wa.sendMessage(to, res)
            } else if (cond[0].toLowerCase() == "search") {
                xyz = cond[1].split(" ")
                const response = await requests("http://hujanapi.xyz/api/apkpure?query="+xyz+"&apikey="+APIKUY)
                const mat = await response.json()
                let no = 0
                let fox = "*Apkpure Search*\n"
                if (pemisah.length == 1)  {
                    for (let i of mat.result.data) {
                        no += 1
                        fox += "\n\n"+no+". "+i.title+"\n"+i.link
                    }
                    wa.sendReply(to, fox)
                }
            } else if (cond[0].toLowerCase() == "download") {
                const response = await requests("http://hujanapi.xyz/api/apkpuredl?url="+xtext+"&apikey="+APIKUY)
                const mat = await response.json()
                let xyz = "*Apkpure Download*\n"
                xyz = "\n*Title:* "+mat.result.title
                xyz = "\n*Desc:* "+mat.result.desc
                xyz = "\n*Size:* "+mat.result.size
                xyz = "\n*Url:* \n"+mat.result.url
                wa.sendReply(to, xyz)
            }
            printLogs(msg)

        } else if (cmd.startsWith("ig")) {
            if (!modecmd(sender)) return
            var sep = text.split(' ')
            const xtext = text.replace(sep[0] + " ", "")
            cond = xtext.split(" ")
            let res = "╭───「 Instagram 」"
            res += "\n├ Usage : "
            res += "\n│ • Ig"
            res += "\n│ • Ig Profile <username>"
            res += "\n│ • Ig Post <URL>"
            res += "\n│ • Ig Story <username> <count>"
            res += "\n╰───「 Hello World 」"
            if (cmd == "ig") { 
                wa.sendMessage(to, res)
            } else if (cond[0].toLowerCase() == "profile") {
                const response = await requests("http://hujanapi.xyz/api/ig?username="+cond[1]+"&apikey="+APIKUY)
                const data = await response.json()
                let ig = "  ｢Instagram Profile｣\n"
                ig += "\n• Username : "+data.result.user.username
                ig += "\n• Full Name : "+data.result.user.full_name
                ig += "\n• Biography : "+data.result.user.biography
                ig += "\n• Media Count : "+data.result.user.media_count
                ig += "\n• Followers : "+data.result.user.follower_count
                ig += "\n• Following : "+data.result.user.following_count
                ig += "\n• Private : "+data.result.user.is_private
                ig += "\n• Link : https://www.instagram.com/"+xyz
                photo = data.result.user.hd_profile_pic_url_info.url
                wa.sendMediaURL(to, data.result.user.hd_profile_pic_url_info.url, ig)
            } else if (cond[0].toLowerCase() == "post"){
                const response = await requests("http://hujanapi.xyz/api/igpost?url="+cond[1]+"&apikey="+APIKUY)
                const data = await response.json()
                const media = data.result.media
                for (var a = 0; a < media.length; a++) {
                    if (media[a].is_video == true){
                        wa.sendMediaURL(to, media[a].video)
                    } else {
                        wa.sendMediaURL(to, media[a].image)
                    }
                }
            } else if (cond[0].toLowerCase() == "story"){
                xyz = cond[2].split(" ")
                const response = await requests("http://hujanapi.xyz/api/igstory?username="+cond[1]+"&apikey="+APIKUY)
                const data = await response.json()
                const num = xyz
                if (num <= data.length){
                    number = [num - 1]
                    if("is_video" == true){
                        wa.sendMediaURL(to, data[number].url)
                    } else {
                        wa.sendMediaURL(to, data[number].url)
                    }
                } else { 
                    if (data.length == undefined){
                        wa.sendReply(to, "this account has not created a story or this account is private")
                    }else{ 
                        wa.sendReply(to, 'Hanya ada '+data.length+' Story instagram') 
                    }
                }
            } else if (cond[0].toLowerCase() == "tv"){
                const response = await requests("http://hujanapi.xyz/api/igtv?url="+cond[1]+"&apikey="+APIKUY)
                const data = await response.json()
                const mat = data.result.media[0]
                wa.sendMediaURL(to, mat.video_url)
            }
            printLogs(msg)

        } else if (cmd.startsWith("onlyadminmsg")) {
            if (!modecmd(sender)) return
            var sep = text.split(' ')
            const xtext = text.replace(sep[0] + " ", "")
            cond = xtext.split(" ")
            g = await wa.getGroup(to)
            let res = "╭───「 Auto OnlyadminMsg 」"
            res += "\n├ Usage : "
            res += "\n│ • Onlyadminmsg"
            res += "\n│ • Onlyadminmsg <on/off>"
            res += "\n╰───「 Hello World 」"
            if (cmd == "onlyadminmsg") { 
                wa.sendMessage(to, res)
            } else if (cond[0].toLowerCase() == "on") {
                admin = await wa.getAdminIds(to)
                if (admin.includes(event.user.jid) == true){
                    await event.groupSettingChange(to, GroupSettingChange.messageSend, true)
                } else { wa.sendReply(to, "Bot Not Admin!") }
            } else if (cond[0].toLowerCase() == "off") {
                admin = await wa.getAdminIds(to)
                if (admin.includes(event.user.jid) == true){
                    await event.groupSettingChange(to, GroupSettingChange.messageSend, false)
                } else { wa.sendReply(to, "Bot Not Admin!") }
            }
            printLogs(msg)
            
        } else if (cmd.startsWith("autoread")) {
            if (!modecmd(sender)) return
            var sep = text.split(' ')
            const xtext = text.replace(sep[0] + " ", "")
            textt = xtext.toLowerCase()
            let res = "╭───「 Auto Read 」"
            res += "\n├ Status : "
            res += "\n│ • PM : " +setting.pmAutoRead.status
            res += "\n│ • Group : " +setting.gAutoRead.status
            res += "\n├ Usage : "
            res += "\n│ • autoread"
            res += "\n│ • autoread pm <on/off>"
            res += "\n│ • autoread group <on/off>"
            res += "\n╰───「 Hello World 」"
            if (cmd == "autoread") { 
                wa.sendMessage(to, res)
            } else if (textt == "pm on") {
                if (setting.pmAutoRead.status == true){
                    wa.sendMessage(to, "Auto Read already active in PM")
                } else {
                    setting.pmAutoRead.status = true
                    fs.writeFileSync('./settings.json', JSON.stringify(setting, null, 2))
                    wa.sendMessage(to, "Success activated Auto Read in PM")
                }
            } else if (textt == "pm off") {
                if (setting.pmAutoRead.status == false){
                    wa.sendMessage(to, "Auto Read already deactive in PM")
                } else {
                    setting.pmAutoRead.status = false
                    fs.writeFileSync('./settings.json', JSON.stringify(setting, null, 2))
                    wa.sendMessage(to, "Success deactivated Auto Read in PM")
                }
            } else if (textt == "group on") {
                if (setting.gAutoRead.status == true){
                    wa.sendMessage(to, "Auto Read already active on Group")
                } else {
                    setting.gAutoRead.status = true
                    fs.writeFileSync('./settings.json', JSON.stringify(setting, null, 2))
                    wa.sendMessage(to, "Success activated Auto Read on Group")
                }
            } else if (textt == "group off") {
                if (setting.gAutoRead.status == false){
                    wa.sendMessage(to, "Auto Read already deactive on Group")
                } else {
                    setting.gAutoRead.status = false
                    fs.writeFileSync('./settings.json', JSON.stringify(setting, null, 2))
                    wa.sendMessage(to, "Success deactivated Auto Read on Group")
                }
            }
            printLogs(msg)
        } else if (cmd.startsWith("callblock")) {
            if (!modecmd(sender)) return
            var sep = text.split(' ')
            const xtext = text.replace(sep[0] + " ", "")
            textt = xtext.toLowerCase()
            let res = "╭───「 Called block 」"
            res += "\n├ Status : "
            res += "\n│ • Status : " +setting.callblock.status
            res += "\n├ Usage : "
            res += "\n│ • Callblock"
            res += "\n│ • Callblock <on/off>"
            res += "\n╰───「 Hello World 」"
            if (cmd == "autoread") { 
                wa.sendMessage(to, res)
            } else if (textt == "on") {
                if (setting.callblock.status == true){
                    wa.sendMessage(to, "Called Block already active")
                } else {
                    setting.callblock.status = true
                    fs.writeFileSync('./settings.json', JSON.stringify(setting, null, 2))
                    wa.sendMessage(to, "Success activated Called Block")
                }
            } else if (textt == "off") {
                if (setting.callblock.status == false){
                    wa.sendMessage(to, "Called Block already deactive")
                } else {
                    setting.callblock.status = false
                    fs.writeFileSync('./settings.json', JSON.stringify(setting, null, 2))
                    wa.sendMessage(to, "Success deactivated Called Block")
                }
            }
            printLogs(msg)
        } else if (cmd.startsWith("respontag")) {
            if (!msg.isGroup) return wa.sendMessage(to, 'Only Group')
            if (!modecmd(sender)) return
            var sep = text.split(' ')
            const xtext = text.replace(sep[0] + " ", "")
            cond = xtext.split(" ")
            g = await wa.getGroup(to)
            let res = "╭───「 Auto Respon Tag 」"
            res += "\n├ Usage : "
            res += "\n│ • Respontag"
            res += "\n│ • Respontag <on/off>"
            res += "\n│ • Respontag Msg <message>"
            res += "\n╰───「 Hello World 」"
            if (cmd == "respontag") { 
                wa.sendMessage(to, res)
            } else if (cond[0].toLowerCase() == "on") {
                if (setting.responder.tag.status == true){
                    wa.sendMessage(to, `Auto Respon Tag already active *${g.subject}*`)
                } else {
                    setting.responder.tag.status = true
                    setting.responder.tag.GROUP.push(to)
                    setting.responder.tag.message[to] = "ada apa? @!"
                    fs.writeFileSync('./settings.json', JSON.stringify(setting, null, 2))
                    wa.sendMessage(to, `Success activated Auto Respon Tag *${g.subject}*`)
                }
            } else if (cond[0].toLowerCase() == "off") {
                if (setting.responder.tag.status == false){
                    wa.sendMessage(to, "Auto Respon Tag already deactive *"+g.subject+"*")
                } else {
                    setting.responder.tag.status = false
                    setting.responder.tag.GROUP.splice(to)
                    fs.writeFileSync('./settings.json', JSON.stringify(setting, null, 2))
                    respon_tag = {}
                    fs.writeFileSync(respon_tag, JSON.stringify(respon_tag, null, 2))
                    wa.sendMessage(to, "Success deactivated Auto Respon Tag *"+g.subject+"*")
                }
            } else if (cond[0].toLowerCase() == "msg") {
                setting.responder.tag.message[to] = cond[1]
                fs.writeFileSync('./settings.json', JSON.stringify(setting, null, 2))
                wa.sendMessage(to, ' 「 Auto Respon 」\nAuto Respon Tag has been set to:\n_'+setting.responder.tag.message[to]+'_ \nTo: *'+g.subject+'*')
            }
            printLogs(msg)
        } else if (cmd.startsWith("welcome")) {
            if (!msg.isGroup) return wa.sendMessage(to, 'Only Group')
            if (!modecmd(sender)) return
            var sep = text.split(' ')
            const xtext = text.replace(sep[0] + " ", "")
            cond = xtext.split(" ")
            g = await wa.getGroup(to)
            let res = "╭───「 Welcome 」"
            res += "\n├ Usage : "
            res += "\n│ • Welcome"
            res += "\n│ • Welcome <on/off>"
            res += "\n│ • Welcome Msg <message>"
            res += "\n╰───「 Hello World 」"
            if (cmd == "welcome") { 
                wa.sendMessage(to, res)
            } else if (cond[0].toLowerCase() == "on") {
                if (setting.responder.welcome.status == true){
                    wa.sendMessage(to, `Auto Respon Welcome already active *${g.subject}*`)
                } else {
                    setting.responder.welcome.status = true
                    setting.responder.welcome.GROUP.push(to)
                    setting.responder.welcome.message[to] = "Welcome @!"
                    fs.writeFileSync('./settings.json', JSON.stringify(setting, null, 2))
                    wa.sendMessage(to, `Success activated Auto Respon Welcome *${g.subject}*`)
                }
            } else if (cond[0].toLowerCase() == "off") {
                if (setting.responder.welcome.status = false){
                    wa.sendMessage(to, "Auto Respon Welcome already deactive *"+g.subject+"*")
                } else {
                    setting.responder.welcome.status = false
                    setting.responder.welcome.GROUP.splice(to)
                    fs.writeFileSync('./settings.json', JSON.stringify(setting, null, 2))
                    wa.sendMessage(to, "Success deactivated Auto Respon Welcome *"+g.subject+"*")
                }
            } else if (cond[0].toLowerCase() == "msg") {
                setting.responder.welcome.message[to] = cond[1]
                fs.writeFileSync('./settings.json', JSON.stringify(setting, null, 2))
                wa.sendMessage(to, ' 「 Auto Respon 」\nAuto Respon Welcome has been set to:\n_'+setting.responder.welcome.message[to]+'_ \nTo: *'+g.subject+'*')
            }
            printLogs(msg)
        } else if (cmd.startsWith("leave")) {
            if (!msg.isGroup) return wa.sendMessage(to, 'Only Group')
            if (!modecmd(sender)) return
            var sep = text.split(' ')
            const xtext = text.replace(sep[0] + " ", "")
            cond = xtext.split(" ")
            g = await wa.getGroup(to)
            let res = "╭───「 Leave 」"
            res += "\n├ Usage : "
            res += "\n│ • Leave"
            res += "\n│ • Leave <on/off>"
            res += "\n│ • Leave Msg <message>"
            res += "\n╰───「 Hello World 」"
            if (cmd == "leave") { 
                wa.sendMessage(to, res)
            } else if (cond[0].toLowerCase() == "on") {
                if (setting.responder.leave.status == true){
                    wa.sendMessage(to, `Auto Respon Leave already active *${g.subject}*`)
                } else {
                    setting.responder.leave.status = true
                    setting.responder.leave.GROUP.push(to)
                    setting.responder.leave.message[to] = "Sayonara @!"
                    fs.writeFileSync('./settings.json', JSON.stringify(setting, null, 2))
                    wa.sendMessage(to, `Success activated Auto Respon Leave *${g.subject}*`)
                }
            } else if (cond[0].toLowerCase() == "off") {
                if (setting.responder.leave.status == false){
                    wa.sendMessage(to, "Auto Respon Leave already deactive *"+g.subject+"*")
                } else {
                    setting.responder.leave.status = false
                    setting.responder.leave.GROUP.splice(to)
                    fs.writeFileSync('./settings.json', JSON.stringify(setting, null, 2))
                    wa.sendMessage(to, "Success deactivated Auto Respon Leave *"+g.subject+"*")
                }
            } else if (cond[0].toLowerCase() == "msg") {
                setting.responder.leave.message[to] = cond[1]
                fs.writeFileSync('./settings.json', JSON.stringify(setting, null, 2))
                wa.sendMessage(to, ' 「 Auto Respon 」\nAuto Respon Leave has been set to:\n_'+setting.responder.leave.message[to]+'_ \nTo: *'+g.subject+'*')
            }
            printLogs(msg)
        } else if (cmd.startsWith("responpm")) {
            if (!modecmd(sender)) return
            var sep = text.split(' ')
            const xtext = text.replace(sep[0] + " ", "")
            cond = xtext.split(" ")
            let res = "╭───「 Responpm 」"
            res += "\n├ Status : " + setting.responder.pm.status
            res += "\n├ Message : " + setting.responder.pm.message
            res += "\n├ Usage : "
            res += "\n│ • Responpm"
            res += "\n│ • Responpm <on/off>"
            res += "\n│ • Responpm Msg <message>"
            res += "\n╰───「 Hello World 」"
            if (cmd == "responpm") { 
                wa.sendMessage(to, res)
            } else if (cond[0].toLowerCase() == "on") {
                if (setting.responder.pm.status == true){
                    wa.sendMessage(to, `Success activated Responpm`)
                } else {
                    setting.responder.pm.status = true
                    fs.writeFileSync('./settings.json', JSON.stringify(setting, null, 2))
                    wa.sendMessage(to, `Success activated Responpm`)
                }
            } else if (cond[0].toLowerCase() == "off") {
                if (setting.responder.pm.status == false){
                    wa.sendMessage(to, "Success deactivated Responpm")
                } else {
                    setting.responder.pm.status = false
                    fs.writeFileSync('./settings.json', JSON.stringify(setting, null, 2))
                    respon_pm = {}
                    fs.writeFileSync(respon_pm, JSON.stringify(respon_pm, null, 2))
                    wa.sendMessage(to, "Success deactivated Responpm")
                }
            } else if (cond[0].toLowerCase() == "msg") {
                setting.responder.pm.message = cond[1]
                fs.writeFileSync('./settings.json', JSON.stringify(setting, null, 2))
                wa.sendMessage(to, ' 「 Auto Respon 」\nmessage responpm change to:\n_'+setting.responder.pm.message+'_')
            }
            printLogs(msg)

        } else if (cmd.startsWith("respongroupupdate")) {
            if (!modecmd(sender)) return
            var sep = text.split(' ')
            const xtext = text.replace(sep[0] + " ", "")
            cond = xtext.split(" ")
            let res = "╭───「 Respongroupupdate 」"
            res += "\n├ Status : " + setting.responder.groupchange.status
            res += "\n├ Usage : "
            res += "\n│ • Respongroupupdate"
            res += "\n│ • Respongroupupdate <on/off>"
            res += "\n╰───「 Hello World 」"
            if (cmd == "respongroupupdate") { 
                wa.sendMessage(to, res)
            } else if (cond[0].toLowerCase() == "on") {
                if (setting.responder.groupchange.status == true){
                    wa.sendMessage(to, `Respongroupupdate already active`)
                } else {
                    setting.responder.groupchange.status = true
                    fs.writeFileSync('./settings.json', JSON.stringify(setting, null, 2))
                    wa.sendMessage(to, `Success activated Respongroupupdate`)
                }
            } else if (cond[0].toLowerCase() == "off") {
                if (setting.responder.groupchange.status == false){
                    wa.sendMessage(to, "Respongroupupdate already deactive")
                } else {
                    setting.responder.groupchange.status = false
                    fs.writeFileSync('./settings.json', JSON.stringify(setting, null, 2))
                    wa.sendMessage(to, "Success deactivated Respongroupupdate")
                }
            }
            printLogs(msg)
        
//============[ ANIME ]============\\
        } else if (cmd == "randomloli") {
            if (!modecmd(sender)) return
            const response = await requests("http://hujanapi.xyz/api/randomloli?apikey=" + APIKUY)
            const data = await response.json()
            wa.sendMediaURL(to, data.result.result, "*RANDOM LOLI*")
            printLogs(msg)
        } else if (cmd == "randomhentai") {
            if (!modecmd(sender)) return
            const response = await requests("http://hujanapi.xyz/api/randomhentai?apikey=" + APIKUY)
            const data = await response.json()
            wa.sendMediaURL(to, data.url, "*Your requests*")
            printLogs(msg)
        } else if (cmd == "randomblowjob") {
            if (!modecmd(sender)) return
            const response = await requests("http://hujanapi.xyz/api/randomblowjob?apikey=" + APIKUY)
            const data = await response.json()
            await wa.downloadFile(data.url, "./randomblowjob.gif")
            setTimeout(async ()=>{return await exec('ffmpeg -i randomblowjob.gif -pix_fmt yuv420p -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" ini.mp4 -y', (er) => {
                fs.unlinkSync('./randomblowjob.gif')
                if (er) console.log(er)
                wa.sendGif(to, './ini.mp4')
                fs.unlinkSync('./ini.mp4')
            });},5000)
            printLogs(msg)
        } else if (cmd == "randomkiss") {
            if (!modecmd(sender)) return
            const response = await requests("http://hujanapi.xyz/api/randomkiss?apikey=" + APIKUY)
            const data = await response.json()
            await wa.downloadFile(data.url, "./randomkiss.gif")
            setTimeout(async ()=>{return await exec('ffmpeg -i randomkiss.gif -pix_fmt yuv420p -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" ini.mp4 -y', (er) => {
                fs.unlinkSync('./randomkiss.gif')
                if (er) console.log(er)
                wa.sendGif(to, './ini.mp4')
                fs.unlinkSync('./ini.mp4')
            });},5000)
            printLogs(msg)
        } else if (cmd == "randomhug") {
            if (!modecmd(sender)) return
            const response = await requests("http://hujanapi.xyz/api/randomhug?apikey=" + APIKUY)
            const data = await response.json()
            await wa.downloadFile(data.url, "./randomhug.gif")
            setTimeout(async ()=>{return await exec('ffmpeg -i randomhug.gif -pix_fmt yuv420p -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" ini.mp4 -y', (er) => {
                fs.unlinkSync('./randomhug.gif')
                if (er) console.log(er)
                wa.sendGif(to, './ini.mp4')
                fs.unlinkSync('./ini.mp4')
            });},5000)
            printLogs(msg)
        } else if (cmd == "randomcry") {
            if (!modecmd(sender)) return
            const response = await requests("http://hujanapi.xyz/api/randomcry?apikey=" + APIKUY)
            const data = await response.json()
            await wa.downloadFile(data.url, "./randomcry.gif")
            setTimeout(async ()=>{return await exec('ffmpeg -i randomcry.gif -pix_fmt yuv420p -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" ini.mp4 -y', (er) => {
                fs.unlinkSync('./randomcry.gif')
                if (er) console.log(er)
                wa.sendGif(to, './ini.mp4')
                fs.unlinkSync('./ini.mp4')
            });},5000)
            printLogs(msg)
        } else if (cmd == "randomanime") {
            if (!modecmd(sender)) return
            const response = await requests("http://hujanapi.xyz/api/randomanime?apikey=" + APIKUY)
            const data = await response.json()
            wa.sendMediaURL(to, data.url, "*Your requests*")
            printLogs(msg)
        } else if (cmd == "randomwaifu") {
            if (!modecmd(sender)) return
            const response = await requests("http://hujanapi.xyz/api/randomwaifu?apikey=" + APIKUY)
            const data = await response.json()
            let fox = "*Nama :* " + data.result.name
            fox += "*\nDeskripsi :* " + data.result.description
            wa.sendMediaURL(to, data.result.image, fox)
            printLogs(msg)
        }
    }
   
})
    
event.on('group-participants-update', async (chat) => {
    try {
        const group = await wa.getGroup(chat.jid)
        mem = chat.participants[0]
        if (setting.responder.welcome.status){
            if (group.id.includes(setting.responder.welcome.group)){
                if (chat.action == 'add') {
                    mem = chat.participants[0]
                    photo = await wa.getPict(mem)
                    pesan = setting.responder.welcome.message[group.id]
                    wa.sendMediaURL(group.id, photo, pesan, [mem])
                }
            }
        }
        if (setting.responder.leave.status){
            if (group.id.includes(setting.responder.leave.group)){
                if (chat.action == 'remove') {
                    mem = chat.participants[0]
                    photo = await wa.getPict(mem)
                    pesan = setting.responder.leave.message[group.id]
                    wa.sendMediaURL(group.id, photo, pesan, [mem])
                }
            }
        }
        if (chat.action == 'add') {
            if (chat.participants.includes(event.user.jid)){
                console.log("[ Update Group ] Anda Telah Masuk ke group "+group.subject)
            } else {
                console.log("[ Update Group ] "+mem+" Telah Masuk ke group "+group.subject)
            }
        }
        if (chat.action == 'remove') {
            if (chat.participants.includes(event.user.jid)){
                console.log("[ Update Group ] Anda Telah keluar dari group "+group.subject)
            } else {
                console.log("[ Update Group ] "+mem+" Telah keluar dari group "+group.subject)
            }
        }
    } catch (e) {
        console.log('Error : '+ clc.red(e))
    }
})

event.on('CB:action,,call', async json => {
    const callerId = json[2][0][1].from;
    if (setting.callblock.status){
        wa.sendMessage(callerId, "Maaf anda di block karena menelpon nomor bot")
        await event.blockUser(callerId, "add") // Block user
        //console.log(callerId);
    }
});

event.on('blocklist-update', async (chat) => {
    // ADD BLOCK
    for (i of chat.added){
        target = i.replace('@c.us', '@s.whatsapp.net')
        blocked.push(target)
        console.log("[ BLOCK ]"+target)
    }
    // REMOVE BLOCK
    for (i of chat.removed){
        target = i.replace('@c.us', '@s.whatsapp.net')
        blocked.splice(target, 1)
        console.log("[ UNBLOCK ]"+target)
    }
})
