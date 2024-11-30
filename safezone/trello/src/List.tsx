import * as React from 'react';
import Card from '@mui/material/Card';
import { Paper } from '@mui/material';
import { fetchCards } from './api/cards';
import { cards as cardsState } from './api/cards';
import { useHookstate } from '@hookstate/core';

const Trello = (window as any).Trello
const maxListHeight = window.innerHeight - 300

export default function List(props: { themeColor: any, list: any, onSelect: () => void }) {
    const cards = useHookstate(cardsState).get({ noproxy: true })
    React.useEffect(() => {
        fetchCards(props.list.id).catch(() => { })
    }, [])
    return (
        <Card
            style={{
                minWidth: window.innerWidth - 64,
                maxWidth: window.innerWidth - 64,
                margin: 16,
                borderRadius: 16,
                position: 'relative',
                backgroundColor: props.themeColor[100],
                maxHeight: maxListHeight + 48
            }}
            onClick={props.onSelect}
        >
            <Paper style={{
                padding: 8, width: '100%', height: 'auto', borderRadius: '16px 16px 0px 0px',
                backgroundColor: props.themeColor[200], color: props.themeColor['activeText']
            }} elevation={0}>
                {props.list.name}
            </Paper>
            <div style={{
                width: 'calc(100% - 8px)',
                height: 'auto',
                padding: 4,
                paddingTop: 12,
                maxHeight: maxListHeight,
                overflowY: 'auto'
            }}>
                {
                    cards[props.list.id]?.map((card: any) => {
                        return (
                            <Paper key={`card-${card.id}`} style={{ backgroundColor: props.themeColor[50], width: 'calc(100% - 48px)', margin: 8, padding: 16, borderRadius: 8, color: props.themeColor['activeText'] }}>
                                {card.name}
                            </Paper>
                        )
                    })
                }
            </div>
        </Card >
    );
}
