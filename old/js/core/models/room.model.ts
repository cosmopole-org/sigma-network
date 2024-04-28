
interface IRoom {
    id: string,
    title: string,
    avatarId: string,
    towerId: string,
    floor: string,
    isPublic: boolean,
    secret: any
}

export { IRoom }
