
import {DesktopData} from './desk';
import { useEffect, useRef } from 'react';

const useDesk = (show: boolean, editMode: boolean, saveLayouts: (layouts: any) => void, getLayouts: () => any) => {
    
    useEffect(() => {
        desktopRef.current.onLayoutChangeByUI((layouts: any, updates: Array<any>) => {
            saveLayouts(layouts)
        })
        desktopRef.current.onLayoutChangeByCode((layouts: any) => {
            saveLayouts(layouts)
        })
    }, [])
    return {
        desktop: desktopRef.current
    }
}

export default useDesk
