import { fetchBoards } from "./boards";

const Trello = (window as any).Trello

export const authorize = () => {
    return new Promise((resolve: any, reject: any) => {
        var authenticationSuccess = function () {
            console.log('Successful authentication');
            fetchBoards().then(() => {
                resolve()
            }).catch(() => {
                reject()
            });
        }
        var authenticationFailure = function () {
            console.log('Failed authentication');
            reject()
        };
        Trello.authorize({
            type: 'popup',
            name: 'Getting Started Application',
            scope: {
                read: 'true',
                write: 'true'
            },
            expiration: 'never',
            success: authenticationSuccess,
            error: authenticationFailure
        });
    })
}