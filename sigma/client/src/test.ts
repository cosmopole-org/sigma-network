
import Sigma from "./sigma";

(async () => {

    let app = new Sigma();
    await app.run();

    let {success: s1, data: d1} = await app.services.users.create({username: "kasperius", secret: "0123", name: "keyhan", avatar: "123"})
    if (!s1) {
        console.log(d1.error);
        return;
    }
    console.log(d1.user);

    let { success: s2, data: d2 } = await app.services.users.get({userId: d1.user.id});
    if (!s2) {
        console.log(d2.error);
        return
    }
    console.log(d2.user);

})();
