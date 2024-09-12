
// apps create | update

import { IconType } from "@/types"

export const appsCreateNavbarItems = [
    { key: '1', title: 'Knowledgebase', action: '/knowledge' },
    { key: '2', title: 'Sessions', action: '/' },
    { key: '3', title: 'Memories', action: '/' },
    { key: '4', title: 'Analytics', action: '/' },
    { key: '5', title: 'Pro', action: '/plans' }
]

export const appsCreateDrawerItems = [
    { key: '1', title: 'Create new App', variant: 'filled', icon: 'addicon', action: '/apps/create' },
    { key: '2', title: 'app ...', icon: 'project', action: '/apps/update' },
    { key: '3', title: 'app ...', icon: 'project', action: '/apps/update' },
    { key: '4', title: 'app ...', icon: 'project', action: '/apps/update' },
    { key: '5', title: 'app ...', icon: 'project', action: '/apps/update' },
    { key: '6', title: 'app ...', icon: 'project', action: '/apps/update' }
]

// apps create

export const botsCreateNavbarItems = [
    { key: '1', title: 'Setup', action: '/knowledge' },
    { key: '2', title: 'Appearance', action: '/' },
    { key: '3', title: 'Analytics', action: '/' },
    { key: '4', title: 'Pro', action: '/plans' }
]

export const botsCreateDrawerItems = [
    { key: '1', title: 'Create new Bot', variant: 'filled', icon: 'addicon' },
    { key: '2', title: 'Bot #1 : doing something', subtitle: '2 days ago', icon: 'asqme-logo', iconType: 'circle' as IconType },
    { key: '3', title: 'Bot #1 : doing something', subtitle: '2 days ago', icon: 'asqme-logo', iconType: 'circle' as IconType },
    { key: '4', title: 'Bot #1 : doing something', subtitle: '2 days ago', icon: 'asqme-logo', iconType: 'circle' as IconType },
    { key: '5', title: 'Bot #1 : doing something', subtitle: '2 days ago', icon: 'asqme-logo', iconType: 'circle' as IconType },
    { key: '6', title: 'Bot #1 : doing something', subtitle: '2 days ago', icon: 'asqme-logo', iconType: 'circle' as IconType },
    
]

// plans

export const plansNavbarItems = [
    { key: '1', compType: 'dropdown' },
    { key: '2', title: 'Setup', action: '/knowledge' },
    { key: '3', title: 'Appearance', action: '/' },
    { key: '4', title: 'Analytics', action: '/' },
    { key: '5', title: 'Pro', action: '/plans' }
]

export const plansDrawerItems = []

