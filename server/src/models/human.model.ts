
interface IHuman {
    id: string,
    firstName: string,
    lastName: string,
    publicKey: string,
    lastSeen: number,
    isGuest: boolean,
    secret: any
}

export { IHuman }
