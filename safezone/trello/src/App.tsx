
import { useEffect, useState } from "react";
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { AppBar, IconButton, Toolbar, Typography } from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import Board from "./Board";
import List from "./List";
import { boards as boardsState } from "./api/boards";
import { authorize } from "./api/auth";
import { useHookstate } from "@hookstate/core";
import { fetchLists } from "./api/lists";
import { lists as listsState } from './api/lists';

const App = () => {
    const [settings, setSettings]: [any, any] = useState({
        ready: false,
        theme: undefined,
        myId: undefined,
        themeColor: undefined
    })
    const [needLogin, setNeedLogin] = useState(false)
    const [authed, setAuthed] = useState(false)
    const boards = useHookstate(boardsState).get({ noproxy: true })
    const lists = useHookstate(listsState).get({ noproxy: true })
    let [route, setRoute] = useState('boards')
    let [selectedBoard, setSelectedBoard]: [any, any] = useState(undefined)
    useEffect(() => {
        window.onmessage = (e: any) => {
            const key = e.message ? 'message' : 'data';
            const data = e[key];
            if (data.key === 'setup') {
                setSettings({
                    ready: true,
                    theme: data.colorName === 'night' ? 'dark' : 'light',
                    myId: data.myHumanId,
                    themeColor: data.themeColor
                })
                setTimeout(() => {
                    window.parent.postMessage({ key: 'ready' }, '*')
                    window.parent.postMessage({ key: 'onAuthorize' }, '*')
                });
            }
        }
        window.parent.postMessage({ key: 'onLoad' }, '*')
        setTimeout(() => {
            let token = localStorage.getItem('trello_token')
            if (token === null) {
                setNeedLogin(true)
            } else {
                authorize().then(() => {
                    setAuthed(true)
                }).catch(() => {
                    setNeedLogin(true);
                });
            }
        });
    }, [])
    return settings.theme ? (
        <div style={{ width: '100%', height: '100%', backgroundColor: settings.themeColor[50], position: 'absolute', left: 0, top: 0, overflowY: 'auto' }}>
            {
                needLogin ? (
                    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                        <button
                            onClick={() => {
                                setNeedLogin(false);
                                setTimeout(() => {
                                    authorize().then(() => {
                                        setAuthed(true)
                                    }).catch(() => {
                                        setNeedLogin(true);
                                    });
                                });
                            }}
                            style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', borderRadius: 16, padding: 16, background: '#fff', color: settings.themeColor['activeText'], border: 'none' }}>
                            Authorize Trello
                        </button>
                    </div>
                ) : null
            }
            {
                authed ?
                    route === 'boards' ? (
                        <div style={{ width: '100%', height: '100%' }}>
                            <div style={{
                                alignItems: 'center', justifyContent: 'center', textAlign: 'center', alignContent: 'flex-start', padding: 4,
                                width: 'calc(100% - 8px)', height: 'auto', overflowY: 'auto', display: 'flex', flexWrap: 'wrap', paddingTop: 72
                            }}>
                                {
                                    boards.map((board: any) => {
                                        return (
                                            <Board
                                                themeColor={settings.themeColor}
                                                key={`board-${board.id}`}
                                                board={board}
                                                onSelect={() => {
                                                    fetchLists(board.id).then(() => {
                                                        setSelectedBoard(board)
                                                        setRoute('lists')
                                                    }).catch(() => alert("failed to fetch lists of selected board."))
                                                }}
                                            />
                                        )
                                    })
                                }
                            </div>
                            <AppBar elevation={0} position="fixed" style={{ borderRadius: 24, margin: 16, backgroundColor: 'transparent', width: 'calc(100% - 32px)', height: 48 }}>
                                <Toolbar style={{ padding: 0, marginTop: -4 }}>
                                    <img src={'/trello/logo192.png'} style={{ width: 24, height: 24 }} />
                                    <Typography variant="h6" style={{ color: settings.themeColor['activeText'], marginLeft: 8 }}>
                                        Pick a Board from below
                                    </Typography>
                                </Toolbar>
                            </AppBar>
                        </div>
                    ) :
                        (route === 'lists' && selectedBoard) ? (
                            <div style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
                                <div style={{
                                    width: '100%', height: '100%', overflowX: 'auto', display: 'flex', padding: 4,
                                    paddingTop: 72
                                }}>
                                    {
                                        lists[selectedBoard.id]?.map((list: any) => {
                                            return (
                                                <List
                                                    key={`list-${list.id}`}
                                                    themeColor={settings.themeColor}
                                                    list={list}
                                                    onSelect={() => {

                                                    }}
                                                />
                                            )
                                        })
                                    }
                                </div>
                                <AppBar elevation={0} position="fixed" style={{ backgroundColor: 'transparent', margin: 16, width: 'calc(100% - 32px)', height: 48 }}>
                                    <Toolbar style={{ padding: 0, marginTop: -4 }}>
                                        <IconButton onClick={() => setRoute('boards')}>
                                            <ArrowBack style={{ fill: settings.themeColor['activeText'] }} />
                                        </IconButton>
                                        <Typography variant="h6" style={{ color: '#00' }}>
                                            {selectedBoard.name}
                                        </Typography>
                                    </Toolbar>
                                </AppBar>
                            </div>
                        ) : null
                    : null
            }
        </div>
    ) : null
}

export default App
