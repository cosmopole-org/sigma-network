
import Desktop from './desktop';
import { useEffect, useRef } from 'react';

const useDesk = (show: boolean, editMode: boolean, saveLayouts: (layouts: any) => void, getLayouts: () => any) => {
    const desktopRef = useRef(new Desktop.DesktopData())
    desktopRef.current.fill(getLayouts())
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
