
let { io } = require('socket.io-client')

let registeredHumanId;

let socket = io('http://localhost:3000')
const request = (path, body, callback) => {
    socket.emit(path, body, Math.random(), callback)
}

socket.on('update', update => {
    console.log('update', update)
})

const towerTest = () => {
    request('tower/create', { title: 'libbrary', isPublic: true }, (response7) => {
        console.log(response7);
        request('messenger/createTextMessage', { towerId: response7.tower.id, name: 'keyhan' }, (response8) => {
            console.log(response8);
        })
        // request('tower/update', { towerId: response7.tower.id, title: 'library', isPublic: true }, (response8) => {
        //     console.log(response8);
        //     request('tower/search', { query: 'lib' }, (response9) => {
        //         console.log(response9);
        //         request('tower/join', { towerId: response7.tower.id }, (response10) => {
        //             console.log(response10);
        //             //request('tower/remove', { towerId: response7.tower.id }, (response11) => {
        //             //    console.log(response11);
        //             roomTest(response7.tower.id)
        //             //});
        //         });
        //     });
        // });
    });
}
const roomTest = (towerId) => {
    request('room/create', { title: 'games', isPublic: true, towerId }, (response12) => {
        console.log(response12);
        request('room/readById', { towerId, roomId: response12.room.id }, (response13) => {
            console.log(response13);
            request('room/search', { towerId, query: 'g' }, (response14) => {
                console.log(response14);
                request('room/remove', { towerId, roomId: response12.room.id }, (response15) => {
                    console.log(response15);
                    inviteTest(towerId)
                });
            });
        });
    });
}
const inviteTest = (towerId) => {
    request('invite/create', { targetHumanId: registeredHumanId, towerId }, (response16) => {
        console.log(response16);
        request('invite/cancel', { inviteId: response16.invite.id }, (response17) => {
            console.log(response17);
        });
    });
}
const rest = (humanId) => {
    registeredHumanId = humanId
    request('human/readById', { targetHumanId: humanId }, (response5) => {
        console.log(response5);
        request('human/search', { query: 'edw' }, (response6) => {
            console.log(response6);
            towerTest()
        });
    });
}
request('human/signUp', { email: 'test@test.com' }, (response1) => {
    console.log(response1);
    request('human/verify', { cCode: response1.cCode, vCode: '123' }, (response2) => {
        console.log(response2);
        if (response2.session) {
            request('human/signIn', { token: response2.session.token }, (response4) => {
                console.log(response4);
                rest(response2.human.id)
            });
        } else {
            request('human/complete', { cCode: response1.cCode, firstName: 'edward', lastName: 'kasperian' }, (response3) => {
                console.log(response3);
                request('human/signIn', { token: response3.session.token }, (response4) => {
                    console.log(response4);
                    rest(response3.human.id)
                });
            });
        }
    });
});
