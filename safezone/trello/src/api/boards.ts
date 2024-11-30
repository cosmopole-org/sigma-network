import { hookstate } from "@hookstate/core";

const Trello = (window as any).Trello

export const boards = hookstate([])

export const fetchBoards = async (checking?: boolean) => {
    return new Promise((resolve: any, reject: any) => {
        Trello.get('/member/me/boards',
            (bs: any) => {
                console.log(bs)
                boards.set(bs)
                resolve(true)
            },
            (error: any) => {
                console.log('could not get boards')
                reject()
            }
        )
    })
}