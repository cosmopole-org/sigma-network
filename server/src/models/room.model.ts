
interface IRoom {
    id: string,
    title: string,
    avatarId: string,
    towerId: string,
    floor: string,
    isPublic: boolean,
    wallpaperId: string,
    secret: any
}

export { IRoom }
