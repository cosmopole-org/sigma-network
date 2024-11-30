import { hookstate } from "@hookstate/core";

const Trello = (window as any).Trello

export const lists: any = hookstate({})

export const fetchLists = async (boardId: string) => {
    return new Promise((resolve: any) => {
        Trello.get(`/boards/${boardId}/lists`,
            (ls: any) => {
                console.log(ls)
                let lss = lists.get({ noproxy: true })
                lss[boardId] = ls
                lists.set({ ...lss })
                resolve(true)
            },
            (error: any) => {
                console.log('could not get lists')
                resolve(false)
            }
        )
    })
}