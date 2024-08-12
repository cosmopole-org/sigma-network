'use client'

import TextMessage from "./Message/TextMessage";
import React, { ReactNode } from 'react';
import { List, AutoSizer, CellMeasurer, CellMeasurerCache } from 'react-virtualized';

const rowCount = 20;

const list = Array.from(Array(rowCount).keys()).map((val, idx) => {
    return {
        id: idx,
        name: 'John Doe',
        image: 'http://via.placeholder.com/40',
        text: 'dfgdgfdgdfgdfgdgf4ybryrbynrtnybrtbrstbbsetdbtbtst.'
    }
});


const cache = new CellMeasurerCache({
    fixedWidth: true,
    defaultHeight: 100
});

function renderRow({ index, key, style, parent }: { index: number, key: any, style: any, parent: any }) {
    const rem = index % 4;
    let comp: ReactNode = null;
    // switch (rem) {
    //     case 0: {
    //         comp = <TextMessage lastOfSection={index === 9} firstOfSection={index === 0} message={{data: {text: "hello world !"}, author: { firstName: "keyhan", lastName: "kasperian" }, authorId: 123, time: 1 }} key={index} side={'right'} />
    //         break;
    //     }
    // case 1: {
    //     comp = <PhotoMessage key={index} rightSide={index % 2 === 0} />
    //     break;
    // }
    // case 2: {
    //     comp = <VideoMessage key={index} rightSide={index % 2 === 0} />
    //     break;
    // }
    // case 3: {
    //     comp = <AudioMessage key={index} rightSide={index % 2 === 0} />
    //     break;
    // }
    // }
    const text = index === 1 ? "hello world ! \n hello world ! \n hello world ! \n hello world !" : "hello world !";
    comp = <TextMessage lastOfSection={index === 4 || index === 19} firstOfSection={index === 0 || index === 5} message={{ data: { text: text }, author: { firstName: "keyhan", lastName: "kasperian" }, authorId: 123, time: 1 }} key={index} side={index < 5 ? 'right' : 'left'} />
    return (
        <CellMeasurer
            key={key}
            cache={cache}
            parent={parent}
            columnIndex={0}
            rowIndex={index}>
            {({ registerChild, measure }: any) => (
                <div style={style} ref={registerChild}>
                    {comp}
                </div>
            )}
        </CellMeasurer>
    );
}

export default function MessageList() {
    return (
        <div className="h-full">
            <AutoSizer>
                {
                    ({ width, height }: any) => (
                        <List
                            id="messages-list"
                            width={width}
                            height={height}
                            deferredMeasurementCache={cache}
                            rowHeight={cache.rowHeight}
                            rowRenderer={renderRow}
                            rowCount={list.length}
                            overscanRowCount={3}
                            className={'px-2 pb-36 pt-4'}
                        />
                    )
                }
            </AutoSizer>
        </div>
    );
}
