const {
	MessageType,
	Mimetype
} = require("@adiwajshing/baileys");
const fs = require('fs');
const con = require("./connect")
const fetch = require('node-fetch');
const request = require('request');
const { exec } = require("child_process");
const util = require('util')
const streamPipeline = util.promisify(require('stream').pipeline)

const wa = con.Whatsapp


async function downloadURL(url, filename) {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`unexpected response ${response.statusText}`)
  await streamPipeline(response.body, fs.createWriteStream(filename))
  return response.headers.get('content-type')
}
function normalizeMention(to, txt, mention=[]){
    if(! mention.length > 0){
        return "Not Mentioned"
    }
    if(txt.includes("@!")){
        const texts = txt.split('@!')
        let textx = ''
        if(texts.length -1 !== mention.length){
           return  "Invalid Number"
        }
        for(i of mention){
            textx += texts[mention.indexOf(i)]
            textx +="@"+i.replace("@s.whatsapp.net", "")
        }
        textx += texts[mention.length]
        return textx
    }else return "Invalid Mention Position"
}

exports.getRandom = (ext) => {
    return `${Math.floor(Math.random() * 10000)}${ext}`
}
    
exports.serialize = function(chat){
    m = JSON.parse(JSON.stringify(chat)).messages[0]
    if (m.message["ephemeralMessage"]){
        m.message = m.message.ephemeralMessage.message
        m.ephemeralMessage = true
        
    }else{
      m.ephemeralMessage = false
    }
    content = m.message
    m.isGroup = m.key.remoteJid.endsWith('@g.us')
    try{
        const berak = Object.keys(content)[0]
        m.type = berak
    } catch {
        m.type = null
    }
    try{
        const context = m.message.extendedTextMessage.contextInfo.quotedMessage
        if(context["ephemeralMessage"]){
            m.quoted = context.ephemeralMessage.message
        }else{
            m.quoted = context
        }
    }catch{
        m.quoted = null
    }
    
    try{
        const mention = m.message[m.type].contextInfo.mentionedJid
        m.mentionedJid = mention
    }catch{
        m.mentionedJid = null
    }
    
    if (m.isGroup){
        m.sender = m.participant
    }else{
        m.sender = m.key.remoteJid
    }
    if (m.key.fromMe){
        m.sender = wa.user.jid
    }
    
    txt = (m.type === 'conversation' && m.message.conversation) ? m.message.conversation : (m.type == 'imageMessage') && m.message.imageMessage.caption ? m.message.imageMessage.caption : (m.type == 'documentMessage') && m.message.documentMessage.caption ? m.message.documentMessage.caption : (m.type == 'videoMessage') && m.message.videoMessage.caption ? m.message.videoMessage.caption : (m.type == 'extendedTextMessage') && m.message.extendedTextMessage.text ? m.message.extendedTextMessage.text : ""
    m.text = txt
    return m
}
//download file url
exports.downloadFile = function (uri, filename, callback) {
    request.head(uri, function (err, res, body) {
    request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
   })
}

//sebd message
exports.sendMessage = function(to, text){
    wa.sendMessage(to, text, MessageType.text)
}

//send image
exports.sendImage = function(to, filename, text=""){
	const bufer = fs.readFileSync(filename)
	wa.sendMessage(to, bufer, MessageType.image, {caption: text})
}

//send Audio
exports.sendAudio = function(to, filename, text=""){
	const bufer = fs.readFileSync(filename)
	wa.sendMessage(to, bufer, MessageType.mp4Audio, { mimetype: Mimetype.mp4Audio, ptt: true})
}

//send Video
exports.sendVideo = function(to, filename, text=""){
	const bufer = fs.readFileSync(filename)
	wa.sendMessage(to, bufer, MessageType.video, {caption: text})
}
//send Video
exports.sendPdf = function(to, filename, text="HujanAPI.pdf"){
    const bufer = fs.readFileSync(filename)
    wa.sendMessage(to, bufer, MessageType.document, { mimetype: Mimetype.pdf, title: text})
}

//send GIF only use MP4, not work if you use gif
exports.sendGif = function(to, filename){
    const bufer = fs.readFileSync(filename)
    wa.sendMessage(to, bufer,MessageType.video, { mimetype: Mimetype.gif, gifPlayback: true})
}
//send Sticker
exports.sendSticker = function(to, filename){
    const bufer = fs.readFileSync(filename)
    wa.sendMessage(to, bufer, MessageType.sticker)
}

//
exports.sendStickerUrl = async(to, url) => {
    var names = Date.now() / 10000;
    var download = function (uri, filename, callback) {
        request.head(uri, function (err, res, body) {
            request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
        });
    };
    download(url, './media/sticker/' + names + '.png', async function () {
        console.log('done');
        let filess = './media/sticker/' + names + '.png'
        let asw = './media/sticker/' + names + '.webp'
        exec(`ffmpeg -i ${filess} -vcodec libwebp -filter:v fps=fps=20 -lossless 1 -loop 0 -preset default -an -vsync 0 -s 512:512 ${asw}`, (err) => {
            let media = fs.readFileSync(asw)
            wa.sendMessage(to, media, MessageType.sticker)
        });
    });
}

//send media with url 
exports.sendMediaURL = async(to, url, text="", mids=[]) =>{
    if(mids.length > 0){
        text = normalizeMention(to, text, mids)
    }
    const fn = Date.now() / 10000;
    const filename = fn.toString()
    let mime = ""
    var download = function (uri, filename, callback) {
		request.head(uri, function (err, res, body) {
		    mime = res.headers['content-type']
			request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
		});
	};
    download(url, filename, async function () {
		//console.log('done');
		let media = fs.readFileSync(filename)
		let type = mime.split("/")[0]+"Message"
		if(mime === "image/gif"){
            type = MessageType.video
            mime = Mimetype.gif
        }
        if(mime === "application/pdf"){
            type = MessageType.document
            mime = Mimetype.pdf
        }
        if(mime.split("/")[0] === "audio"){
            mime = Mimetype.mp4Audio
        }
		wa.sendMessage(to, media, type, { mimetype: mime, caption: text,contextInfo: {"mentionedJid": mids}})
		
        fs.unlinkSync(filename)
	});
}

//send contact
exports.sendContact = function(to, id, name){
	const vcard = 'BEGIN:VCARD\n' + 'VERSION:3.0\n' + 'FN:' + name + '\n' + 'ORG:Kontak\n' + 'TEL;type=CELL;type=VOICE;waid=' + id.split("@s.whatsapp.net")[0] + ':+' + id.split("@s.whatsapp.net")[0] + '\n' + 'END:VCARD'
	wa.sendMessage(to, {displayname: name, vcard: vcard}, MessageType.contact)
}
//send Mention
exports.sendMention = function(to, text, mids=[]){
    const txt = normalizeMention(to, text, mids)
    if(txt){
        wa.sendMessage(to, txt, MessageType.text, {contextInfo: {"mentionedJid": mids}})
    }
}

// GROUP
exports.getGroup = async function(to) {
    const response = await wa.groupMetadata(to)
    return JSON.parse(JSON.stringify(response))
}
exports.getParticipantIds = async function(to) {
    var mat = await wa.groupMetadata(to)
    var members = mat.participants
    let mids = []
    for (let member of members) {
        mids.push(member.jid)
    }
    return JSON.parse(JSON.stringify(mids))
}
exports.getAdminIds = async function(to) {
    var group = await wa.groupMetadata(to)
    var participants = group.participants
    let admin = []
    for (let members of participants) {
        if (members.isAdmin) {
            admin.push(members.jid)
        }
    }
    return JSON.parse(JSON.stringify(admin))
}
exports.getOwnerIds = async function(to) {
    var group = await wa.groupMetadata(to)
    var participants = group.participants
    let admin = []
    for (let members of participants) {
        if (members.isSuperAdmin) {
            admin.push(members.jid)
        }
    }
    return JSON.parse(JSON.stringify(admin))
}
// All Groups
exports.getGroups = async function() {
    const totalchat = await wa.chats.all()
    let a = []
    let gid = []
    for (mem of totalchat){
        a.push(mem.jid)
    }
    for (id of a){
        if (id && id.includes('g.us')){
            gid.push(id)
        }
    }
    return JSON.parse(JSON.stringify(gid))
}
//Link Group
exports.getGroupInvitationCode = async function(to) {
    const linkgc = await wa.groupInviteCode(to)
    const code = "https://chat.whatsapp.com/"+linkgc
    return code
}

exports.kickMember = async function(to, target=[]){
    if(!target.length > 0) { return  wa.sendMessage(to, "No target..") }
    const g = await wa.groupMetadata(to)
    const owner = g.owner.replace("c.us","s.whatsapp.net")
    const me = wa.user.jid
    for (i of target){
        if (!i.includes(me) && !i.includes(owner)){
            const res = await wa.groupRemove(to, [i])
        }else{
            wa.sendMessage(to, "NOT PREMITED")
        }
    }
}
exports.promoteAdmin = async function(to, target=[]){
    if(!target.length > 0) { return  wa.sendMessage(to, "No target..") }
    const g = await wa.groupMetadata(to)
    const owner = g.owner.replace("c.us","s.whatsapp.net")
    const me = wa.user.jid
    for (i of target){
        if (!i.includes(me) && !i.includes(owner)){
            const res = await wa.groupMakeAdmin(to, [i])
        }else{
            wa.sendMessage(to, "NOT PREMITED")
        }
    }
}
exports.demoteAdmin = async function(to, target=[]){
    if(!target.length > 0) { return  wa.sendMessage(to, "No target..") }
    const g = await wa.groupMetadata(to)
    const owner = g.owner.replace("c.us","s.whatsapp.net")
    const me = wa.user.jid
    for (i of target){
        if (!i.includes(me) && !i.includes(owner)){
            const res = await wa.groupDemoteAdmin(to, [i])
        }else{
            wa.sendMessage(to, "NOT PREMITED")
        }
    }
}
exports.leaveGroup = function(to){
    res = wa.groupLeave(to)
    return res
}

exports.getContact = function(idx) {
    try {
        const r = JSON.parse(JSON.stringify(wa.contacts[idx]))
        return r
    } catch (e) {
        console.log('Error : '+ e)
    }
}
exports.getBio = async function(mids) {
    const pdata = await wa.getStatus(mids)
    if (pdata.status == 401) { // Untuk Self-Bot
        return pdata.status
    } else  {
        return pdata.status
    }
}
exports.getPict = async function(mids) {
    try {
        var url = await wa.getProfilePicture(mids)
    } catch {
        var url = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png?q=60'
    }
    return url
}
//Hide tag
exports.hideTag = async function(to, text){
    var mat = await wa.groupMetadata(to)
    var members = mat.participants
    let mids = []
    for (let member of members) {
        mids.push(member.jid)
    }
    wa.sendMessage(to, text, MessageType.text, { contextInfo: { "mentionedJid": mids } })
}

//send image HideTag
exports.hideTagImage = async function(to, filename){
    const bufer = fs.readFileSync(filename)
    var mat = await wa.groupMetadata(to)
    var members = mat.participants
    let mids = []
    for (let member of members) {
        mids.push(member.jid)
    }
    wa.sendMessage(to, bufer, MessageType.image, { contextInfo: { "mentionedJid": mids } })
}

exports.hideTagSticker = async function(to, filename){
    const bufer = fs.readFileSync(filename)
    var mat = await wa.groupMetadata(to)
    var members = mat.participants
    let mids = []
    for (let member of members) {
        mids.push(member.jid)
    }
    wa.sendMessage(to, bufer, MessageType.sticker, { contextInfo: { "mentionedJid": mids } })
}

//Fake Reply
exports.fakeReply = async function(to, target, text, prevtext, mention=[], msgId="B826873620DD5947E683E3ABE663F263"){
    mention = m.message.extendedTextMessage.contextInfo.mentionedJid[0]
    wa.sendMessage(to, text, MessageType.text, {
        contextInfo: {"mentionedJid": mention, "stanzaId": msgId,"participant": target,"quotedMessage": {"conversation": prevtext}}
    })
}
exports.fakeReply2 = async function(to, target, text, prevtext, mention=[], msgId="B826873620DD5947E683E3ABE663F263"){
    mention = m.message.extendedTextMessage.contextInfo.mentionedJid[0]
    wa.sendMessage(to, text, MessageType.text, {
        contextInfo: {"mentionedJid": mention, "stanzaId": msgId, "participant": target,"quotedMessage": {"conversation": prevtext}}
    })
}
exports.ReplyStatusWA = async function(to, text, prevtext, filename, msgId="B826873620DD5947E683E3ABE663F263"){
    waid = "0@s.whatsapp.net"
    wa.sendMessage(to, text, MessageType.text, {contextInfo: {'stanzaId': msgId, 'participant': waid, 'remoteJid': 'status@broadcast', 'quotedMessage': {"imageMessage": {"caption": prevtext, 'jpegThumbnail': fs.readFileSync(filename)}}}})
}
exports.ReplyFakeStatus = async function(to, text, prevtext, jid, filename, msgId="B826873620DD5947E683E3ABE663F263"){
    wa.sendMessage(to, text, MessageType.text, {contextInfo: {'stanzaId': msgId, 'participant': jid, 'remoteJid': 'status@broadcast', 'quotedMessage': {"imageMessage": {"caption": prevtext, 'jpegThumbnail': fs.readFileSync(filename)}}}})
}
exports.ReplyStatusWAMention = async function(to, text, prevtext, filename, mids=[], msgId="B826873620DD5947E683E3ABE663F263"){
    if(mids.length > 0){
        text = normalizeMention(to, text, mids)
    }
    waid = "0@s.whatsapp.net"
    anu  = {contextInfo: {'mentionedJid': mids, 'stanzaId': msgId, 'participant': waid, 'remoteJid': 'status@broadcast', 'quotedMessage': {"imageMessage": {"caption": prevtext, 'jpegThumbnail': fs.readFileSync(filename)}}}}
    wa.sendMessage(to, text, MessageType.text, anu)
}
exports.ReplyStatusWALoc = async function(to, text, prevtext, filename, msgId="B826873620DD5947E683E3ABE663F263"){
    waid = "0@s.whatsapp.net"
    anu  = {contextInfo: {'stanzaId': msgId, 'participant': waid, 'remoteJid': 'status@broadcast', 'quotedMessage': {"locationMessage": {"degreesLatitude": 41.893714904785156, "degreesLongitude": -87.63370513916016, "name": "Wildfire", 'jpegThumbnail': fs.readFileSync(filename)}}}}
    wa.sendMessage(to, text, MessageType.text, anu)
}

exports.setName = async function(query){
    const response = await wa.updateProfileName(query)
    return response
}
exports.setBio = async function(query){
    const response = await wa.setStatus(query)
    return response
}

// Thumbnail
exports.setThumbnail = async function(to, url, title, desc, filename){
    const bufer = fs.readFileSync(filename)
    var anu = {
        detectLinks: false
    }
    var mat = await wa.generateLinkPreview(url)
    mat.title = title;
    mat.description = desc;
    mat.jpegThumbnail = bufer;
    wa.sendMessage(to, mat, MessageType.extendedText, anu)
}

exports.sendReply = function(to, text, mids=[]){
    if(mids.length > 0){
        text = normalizeMention(to, text, mids)
    }
    if (m.isGroup){
        m.sender = m.participant
    }else{
        m.sender = m.key.remoteJid
    }
    ini = m.key.id
    wa.sendMessage(to, text, MessageType.extendedText, { contextInfo: {"mentionedJid": mids,"stanzaId": ini, "participant": m.sender, "quotedMessage": { "conversation": text}} })
}

exports.sendReplyWA = function(to, text, prevtext, mids=[]){
    if(mids.length > 0){
        text = normalizeMention(to, text, mids)
    }
    waid = "0@s.whatsapp.net"
    ini = m.key.id
    wa.sendMessage(to, text, MessageType.extendedText, { contextInfo: {"mentionedJid": mids,"stanzaId": ini, "participant": waid, "quotedMessage": { "conversation": prevtext}} })
}

exports.addMetadata = function(packname, author) {    
    let name = `${author}_${packname}`
    if (fs.existsSync(`./media/sticker/${name}.exif`)) return `./media/sticker/${name}.exif`
    const json = {  
        "sticker-pack-name": packname,
        "sticker-pack-publisher": author,
    }
    const x = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00])  
    const bytes = [0x00, 0x00, 0x16, 0x00, 0x00, 0x00]  

    let len = JSON.stringify(json).length   
    let last

    if (len > 256) {
        len = len - 256 
        bytes.unshift(0x01) 
    } else {
        bytes.unshift(0x00) 
    }   

    if (len < 16) { 
        last = len.toString(16) 
        last = "0" + len
    } else {    
        last = len.toString(16) 
    }   

    const xx = Buffer.from(last, "hex")
    const xxx = Buffer.from(bytes) 
    const xxxx = Buffer.from(JSON.stringify(json))

    const buffer = Buffer.concat([x, xx, xxx, xxxx])  
    fs.writeFile(`./media/sticker/${name}.exif`, buffer, (err) => {  
        return `./media/sticker/${name}.exif`
    })

}
