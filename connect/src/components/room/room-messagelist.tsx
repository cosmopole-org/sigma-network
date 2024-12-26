import { api } from "@/index";
import TextMessage from "./Message/TextMessage";
import { ReactNode, useEffect, useRef, useState } from 'react';
import { List, AutoSizer, CellMeasurer, CellMeasurerCache } from 'react-virtualized';
import { Message } from "@/api/sigma/models";

const cache = new CellMeasurerCache({
    fixedWidth: true,
    defaultHeight: 100
});

export default function MessageList(props: Readonly<{ className?: string, topicId: string }>) {

    const [msgs, setMsgs] = useState<any[]>([]);
    const myHumanId = api.sigma.store.myUserId

    function renderRow({ index, key, style, parent }: { index: number, key: any, style: any, parent: any }) {
        let comp: ReactNode = null;
        let message = msgs[index]
        if (!message) {
            comp = <div className="w-full h-[88px]" />
        } else {
            let nextMessage: Message = msgs[index + 1]
            let isLastOfSection = (nextMessage && (nextMessage.authorId !== message.authorId)) || !nextMessage
            let prevMessage: Message = msgs[index - 1]
            let isFirstOfSection = (prevMessage && (prevMessage.authorId !== message.authorId)) || !prevMessage
            comp = <TextMessage
                lastOfSection={isLastOfSection} firstOfSection={isFirstOfSection} message={message} key={message.id}
                side={myHumanId === message.authorId ? "right" : "left"}
            />
        }
        return (
            <CellMeasurer
                key={key}
                cache={cache}
                parent={parent}
                columnIndex={0}
                rowIndex={index}>
                {({ registerChild }: any) => (
                    <div style={style} ref={registerChild}>
                        {comp}
                    </div>
                )}
            </CellMeasurer>
        );
    }

    useEffect(() => {
        cache.clearAll();
        const msgsObservable = api.sigma.store.db.messages.find({
            selector: { topicId: { $eq: props.topicId } },
            sort: [
                { time: 'asc' }
            ]
        }).$;
        let msgsSub = msgsObservable.subscribe(ms => {
            setMsgs(ms);
        });
        setTimeout(() => {
            listRef.current?.scrollToRow(msgs.length);
        }, 250);
        return () => {
            msgsSub.unsubscribe();
        }
    }, [props.topicId]);

    const oldLength = useRef(0);

    useEffect(() => {
        if (oldLength.current < msgs.length) {
            cache.clear(msgs.length - 1, 0);
        }
        oldLength.current = msgs.length;
        listRef.current?.scrollToRow(msgs.length);
    }, [msgs]);

    const listRef = useRef<List>(null);

    return (
        <div className="h-full">
            <AutoSizer>
                {
                    ({ width, height }: any) => (
                        <List
                            id="messages-list"
                            ref={listRef}
                            width={width}
                            height={height}
                            deferredMeasurementCache={cache}
                            rowHeight={cache.rowHeight}
                            rowRenderer={renderRow}
                            rowCount={msgs.length + 1}
                            overscanRowCount={3}
                            className={'px-2 pt-10 ' + (props.className ?? "")}
                        />
                    )
                }
            </AutoSizer>
        </div>
    );
}
