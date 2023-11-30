
interface IDocument {
    id: string,
    type: string,
    time: number,
    isPublic: boolean,
    previewId: string,
    secret: {
        uploaderId: string,
        roomIds: Array<string>,
    },
    metadata: {
        duration: number,
        width: number,
        height: number,
        extension: string,
        title: string,
        size: number
    }
}

export default IDocument
