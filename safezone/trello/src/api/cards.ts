import { hookstate } from "@hookstate/core"

const Trello = (window as any).Trello

export const cards: any = hookstate({})

export const fetchCards = async (listId: string) => {
    return new Promise((resolve: any) => {
        Trello.get(`/lists/${listId}/cards`,
            (cs: any) => {
                console.log(cs)
                let cass = cards.get({ noproxy: true })
                cass[listId] = cs
                cards.set({ ...cass })
                resolve(true)
            },
            (error: any) => {
                console.log('could not get cards')
                resolve(false)
            }
        )
    })
}
