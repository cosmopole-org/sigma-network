
export type User = {
    id: string
    username: string
    name: string
    avatar: string
    publicKey: string
    type: string
}

export type Session = {
    id: string
    token: string
    userId: string
}

export type Space = {
    id: string
    tag: string
    title: string
    avatar: string
    isPublic: boolean
}

export type Topic = {
    id: string
    title: string
    avatar: string
    spaceId: string
}

export type Member = {
    id: string
    userId: string
    spaceId: string
    topicId: string
    metadata: string
}

export type MemberUser = {
    id: string
    user: User
    member: Member
}

export type Invite = {
    id: string
    userId: string
    spaceId: string
}

export type Secret = {
    id: string
    privateKey: string
    publicKey: string
}

export type Message = {
    id: string
    authorId: string
    spaceId: string
    topicId: string
    time: number
    tag: string
    state?: string,
    data: {
        text?: string
    }
}

export type Interaction = {
    id: string,
    userId: string,
    state: any
}