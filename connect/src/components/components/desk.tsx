import { CircularProgress, Paper, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import Desktop, { columnsDict, rowHeight, sizeKey } from './desktop';
import useDesk from "./use-desk";
import { hookstate, useHookstate } from "@hookstate/core";
import AppHostUtils from './applet-host';
import { api } from "@/index";
import { Topic } from "@/api/sigma/models";
import { Document } from "@/api/sigma/models/member";
import { colors } from "@nextui-org/theme";

let cachedWorkers: Array<any> = []

let saveLayouts = (layouts: ReactGridLayout.Layouts) => {
    let updates: Array<any> = []
    let workersDict: { [id: string]: any } = {}
    cachedWorkers?.forEach((worker: any) => { workersDict[worker.id] = worker });
    layouts.lg.map(sampleItem => sampleItem.i).forEach(itemId => {
        let worker = workersDict[itemId]
        let anyNew = false
        Object.keys(layouts).forEach(layoutKey => {
            let item = layouts[layoutKey].filter(item => item.i === itemId)[0]
            if (
                worker && (
                    worker.secret.grid[layoutKey].x !== item.x ||
                    worker.secret.grid[layoutKey].y !== item.y ||
                    worker.secret.grid[layoutKey].w !== item.w ||
                    worker.secret.grid[layoutKey].h !== item.h
                )
            ) {
                anyNew = true
                worker.secret.grid[layoutKey].x = item.x
                worker.secret.grid[layoutKey].y = item.y
                worker.secret.grid[layoutKey].w = item.w
                worker.secret.grid[layoutKey].h = item.h
            }
        })
        if (anyNew) {
            updates.push(worker)
        }
    })
    return updates
}

let buildLayoutOfWorkers = () => {
    let filtered: any[] = [];
    cachedWorkers.forEach(w => {
        let md = w.metadata;
        if (md.length > 0) {
            let obj = JSON.parse(md);
            if (obj.secret) {
                w.secret = obj.secret;
                filtered.push(w);
            }
        }
    })
    return {
        lg: filtered.map((w: any) => ({ ...w.secret.grid.lg, i: w.id, static: false })),
        md: filtered.map((w: any) => ({ ...w.secret.grid.md, i: w.id, static: false })),
        sm: filtered.map((w: any) => ({ ...w.secret.grid.sm, i: w.id, static: false })),
        xs: filtered.map((w: any) => ({ ...w.secret.grid.xs, i: w.id, static: false })),
        xxs: filtered.map((w: any) => ({ ...w.secret.grid.xxs, i: w.id, static: false }))
    }
}

export let desktopEditMode = hookstate(false)
const measureWidgetSize = (worker: any) => {
    let rowWorkersCount = cachedWorkers.filter(w => {
        return (
            (
                w.secret.grid[sizeKey].y >= worker.secret.grid[sizeKey].y &&
                w.secret.grid[sizeKey].y <= (worker.secret.grid[sizeKey].y + worker.secret.grid[sizeKey].h - 1)
            ) || (
                worker.secret.grid[sizeKey].y >= w.secret.grid[sizeKey].y &&
                worker.secret.grid[sizeKey].y <= (w.secret.grid[sizeKey].y + w.secret.grid[sizeKey].h - 1)
            )
        )
    }).length
    let unit = (window.innerWidth - (rowWorkersCount * 16)) / columnsDict[sizeKey]
    const widSize = {
        w: worker.secret.grid[sizeKey].w,
        width: worker.secret.grid[sizeKey].w * unit,
        h: worker.secret.grid[sizeKey].h,
        height: worker.secret.grid[sizeKey].h * rowHeight
    }
    return widSize
}

let desktop: any = undefined

export const addWidgetToSDesktop = (room: Topic, machineId: string) => {
    let workersMax = 0
    if (cachedWorkers.length > 0) {
        workersMax = Math.max(...cachedWorkers.map(w => w.secret.grid[sizeKey].y + w.secret.grid[sizeKey].h)) + 1
    }
    let unit = window.innerWidth / columnsDict[sizeKey] - 16
    let url = "";
    if (machineId === "5c23a6dea8c7e58ec93459e85bb64de8") {
        let str = prompt("input the url to embed:");
        if (str) {
            url = str;
        }
    }
    api.sigma.services?.spaces.createMember({
        spaceId: room.spaceId,
        userId: machineId,
        metadata: JSON.stringify({
            secret: {
                grid: {
                    lg: { x: 0, y: workersMax, w: 2, h: unit / 8 },
                    md: { x: 0, y: workersMax, w: 2, h: unit / 8 },
                    sm: { x: 0, y: workersMax, w: 2, h: unit / 8 },
                    xs: { x: 0, y: workersMax, w: 2, h: unit / 8 },
                    xxs: { x: 0, y: workersMax, w: 2, h: unit / 8 }
                },
                frameUrl: url
            }
        })
    }).then((body: any) => {
        cachedWorkers.push(body.member)
        api.sigma.store.db.collections.members.findOne({ selector: { userId: { $eq: api.sigma.store.myUserId }, spaceId: { $eq: room.spaceId } } }).exec().then((member: any) => {
            api.sigma.services?.topics.send({ type: "single", spaceId: room.spaceId, topicId: room.id, memberId: member.id, recvId: body.member.id, data: { tag: 'get/widget', widgetSize: measureWidgetSize(body.worker), secondaryColor: colors.purple, colorName: "blue", colors: colors.blue } });
        });
    }).catch(ex => {
        console.log(ex)
    })
}

const Desk = (props: { show: boolean, room: any }) => {
    const desktopWrapperRef = useRef(null)
    const [loadDesktop, setLoadDesktop] = useState(false)
    const editMode = useHookstate(desktopEditMode).get({ noproxy: true })
    const DesktopHolder = useDesk(
        props.show,
        editMode,
        (layouts: ReactGridLayout.Layouts) => {
            saveLayouts(layouts).forEach((worker: any) => {
                //api.sigma.services?.spaces.update({ towerId: props.room.towerId, roomId: props.room.id, worker })
                api.sigma.store.db.collections.members.findOne({ selector: { userId: { $eq: api.sigma.store.myUserId }, spaceId: { $eq: props.room.spaceId } } }).exec().then((member: any) => {
                    api.sigma.services?.topics.send({ type: "single", spaceId: props.room.spaceId, topicId: props.room.id, memberId: member.id, recvId: worker.member.id, data: { tag: 'get/widget', widgetSize: measureWidgetSize(worker), secondaryColor: colors.purple, colorName: "blue", colors: colors.blue } });
                });
            })
        },
        () => buildLayoutOfWorkers()
    )
    desktop = DesktopHolder.desktop
    useEffect(() => {
        // switchSwipeable(!editMode)
    }, [editMode])
    // useEffect(() => {
    //     desktop.clear()
    //     AppHostUtils.unloadAllHosts()
    //     setTimeout(() => {
    //         api.sigma.services?.topics.onPacketReceive((data: any) => {
    //             if (data.type === 'get/widget') {
    //                 metadataRef.current[data.workerId] = { onClick: data.onClick }
    //                 if (!desktop.appletExists(data.workerId)) {
    //                     let gridData = cachedWorkers.filter(w => w.id === data.workerId)[0]?.secret?.grid
    //                     if (gridData) {
    //                         desktop.addWidget({ id: data.workerId, jsxCode: data.code, gridData: gridData[sizeKey] })
    //                     }
    //                 } else {
    //                     desktop.updateWidget(data.workerId, data.code)
    //                 }
    //             }
    //         })
    //         api.sigma.services?.spaces.readMembers({ spaceId: props.room.towerId }).then((body: any) => {
    //             cachedWorkers = body.workers
    //             desktop.fill(buildLayoutOfWorkers())
    //             cachedWorkers.forEach(worker => {
    // api.sigma.store.db.collections.members.findOne({ selector: { userId: { $eq: api.sigma.store.myUserId }, spaceId: { $eq: props.room.spaceId } } }).exec().then((member: any) => {
    //                     api.sigma.services?.topics.send({ type: "single", spaceId: props.room.spaceId, topicId: props.room.id, memberId: member.id, recvId: worker.member.id, data: { tag: 'get/widget', widgetSize: measureWidgetSize(worker), secondaryColor: colors.purple, colorName: "blue", colors: colors.blue } });
    //                 });
    //             })
    //         })
    //     });
    // }, [themeColorName.get({ noproxy: true })])
    useEffect(() => {
        api.sigma.services?.topics.onPacketReceive((data: any) => {
            if (data.type === 'get/widget') {
                if (!desktop.appletExists(data.workerId)) {
                    let gridData = cachedWorkers.filter(w => w.id === data.workerId)[0]?.secret?.grid
                    if (gridData) {
                        desktop.addWidget({ id: data.workerId, jsxCode: data.code, gridData: gridData[sizeKey] })
                    }
                } else {
                    desktop.updateWidget(data.workerId, data.code)
                }
            }
        });
        api.sigma.services?.spaces.readMembers({ spaceId: props.room.spaceId }).then((body: any) => {
            cachedWorkers = body.data.members.map((m: any) => m.member);
            desktop.fill(buildLayoutOfWorkers())
            cachedWorkers.forEach(worker => {
                api.sigma.store.db.collections.members.findOne({ selector: { userId: { $eq: api.sigma.store.myUserId }, spaceId: { $eq: props.room.spaceId } } }).exec().then((member: any) => {
                    api.sigma.services?.topics.send({ type: "single", spaceId: props.room.spaceId, topicId: props.room.id, memberId: member.id, recvId: worker.member.id, data: { tag: 'get/widget', widgetSize: measureWidgetSize(worker), secondaryColor: colors.purple, colorName: "blue", colors: colors.blue } });
                });
            })
        })
        setTimeout(() => {
            setLoadDesktop(true)
        }, 750);
        return () => {
            // switchSwipeable(true)
            cachedWorkers = []
        }
    }, [])

    let wd: { [id: string]: any } = {}
    cachedWorkers.forEach(worker => wd[worker.id] = worker)
    return (
        <div
            style={{ width: '100%', height: '100%', position: 'relative' }}
        >
            <div
                ref={desktopWrapperRef}
                style={{ width: '100%', height: '100%', position: 'relative', overflowY: 'auto' }}
            >
                <Desktop.Host
                    workersDict={wd}
                    room={props.room}
                    showDesktop={loadDesktop}
                    editMode={editMode}
                    style={{ width: window.innerWidth, marginTop: 32 }}
                    desktopKey={desktop.key}
                    onWidgetClick={(workerId: string) => {
                        // let onClickOfMetadata = metadataRef.current[workerId]?.onClick
                        // if (onClickOfMetadata) {
                        //     overlaySafezoneData.set({ code: onClickOfMetadata.code, workerId, room: props.room })
                        // } else {
                        //     openAppletSheet(props.room, workerId)
                        // }
                    }}
                    onWidgetRemove={(workerId: string) => {
                        if (window.confirm('do you to delete this widget ?')) {
                            // api.services.worker.remove({ towerId: props.room.towerId, roomId: props.room.id, workerId }).then((body: any) => {
                            //     cachedWorkers = cachedWorkers.filter(w => w.id !== workerId)
                            //     desktop.removeWidget(workerId)
                            // })
                        }
                    }}
                />
                {
                    loadDesktop ?
                        null : (
                            <div style={{ width: '100%', height: '100%', position: 'absolute', left: '50%', top: 'calc(50% - 32px)', transform: 'translate(-50%, -50%)' }}>
                                <CircularProgress style={{
                                    width: 40,
                                    height: 40,
                                    position: 'absolute',
                                    left: 'calc(50% - 16px)',
                                    top: 'calc(50% - 16px)',
                                    transform: 'translate(-50%, -50%)'
                                }} />
                            </div>
                        )
                }
            </div>
        </div>
    )
}

export default Desk
