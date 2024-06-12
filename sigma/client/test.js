
(async () => {

    const key = "%d_zf&kgjq3#o5k_ghy13@2qg";
    const message = "hello world !";

    const keyPairs = [];
    const encryptedKeys = [];

    const cipher = await CryptoJS.AES.encrypt(
        message,
        key
    );

    console.log(cipher)

    for (let i = 0; i < 1; i++) {
        let keyPair = await window.crypto.subtle.generateKey(
            {
                name: "RSA-OAEP",
                modulusLength: 4096,
                publicExponent: new Uint8Array([1, 0, 1]),
                hash: "SHA-256",
            },
            true,
            ["encrypt", "decrypt"],
        );
        console.log(keyPair)
        keyPairs.push(keyPair);
    }

    const sampleCount = 50000;

    console.log("done 1 !");

    let promises = [];

    for (let i = 0; i < sampleCount; i++) {
        promises.push(

        );
    }

    await Promise.all(promises);

    console.log("done 2");
})();
