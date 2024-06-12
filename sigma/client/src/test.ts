import Security from './security';

(async () => {

    let security = new Security();

    const message = "hello world !";

    console.log(message)
    security.getOrGenerateSingleKey("first key")
    const cipher = await security.encryptDataByKey("first key", message);
    console.log(cipher)

    await security.getMyKeyPair();

    const sampleCount = 50000;

    console.log("done 1 !");

    let keyMap = await security.encryptKeyBatch(["me"], security.getOrGenerateSingleKey("first key"))

    console.log(keyMap);

    await security.decryptAndStoreKey("my group", keyMap["me"]);
    const messageBack = await security.decryptDataByKey("my group", cipher);
    console.log(messageBack)

    console.log("done 2");
})();
