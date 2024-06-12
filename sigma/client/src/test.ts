import Security from './security';

(async () => {

    let security = new Security();

    const message = "hello world !";

    await security.getMyKeyPair();

    console.log(message)
    await security.newGroup("rasht");
    console.log("start")
    const cipher = await security.encryptGroupPacket("1","rasht", message);
    console.log(cipher)
    let messageBack = await security.decryptGroupPacket("2","rasht", cipher);
    console.log(messageBack)

    console.log("end");
})();
