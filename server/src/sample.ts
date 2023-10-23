import Sigma from "./";
import MessengerMachine from "./messenger.machine";

let sigma = new Sigma({
    "MONGODB_URI": "mongodb://localhost:27017/sigma",
    "REDIS_PORT": 6379,
    "REDIS_EXPRESS_PORT": 4001,
    "REDIS_SESSION_SECRET": "enter_the_session_name",
    "REDIS_SESSION_NAME": "yoursecret"
})
sigma.start().then(() => {
    sigma.shell([
        new MessengerMachine()
    ])
})
