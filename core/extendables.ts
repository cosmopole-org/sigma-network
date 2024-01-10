
export const EntityTypes = {
    ROOM_CREATION: "room_creation"
}

export default class Extendables {
    store: { [id: string]: any }
    callbacks = {
        creations: {
            rooms: {
                inject(callback: any) {
                    this.callbacks[EntityTypes.ROOM_CREATION] = callback
                }                    
            }
        }
    }
}
