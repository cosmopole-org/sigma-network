'use client'

import TextMessage from "./message/text";
import React, { ReactNode } from 'react';
import { List, AutoSizer, CellMeasurer, CellMeasurerCache } from 'react-virtualized';
import PhotoMessage from "./message/photo";
import VideoMessage from "./message/video";
import AudioMessage from "./message/audio";

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
    switch (rem) {
        case 0: {
            comp = <TextMessage key={index} rightSide={index % 2 === 0} />
            break;
        }
        case 1: {
            comp = <PhotoMessage key={index} rightSide={index % 2 === 0} />
            break;
        }
        case 2: {
            comp = <VideoMessage key={index} rightSide={index % 2 === 0} />
            break;
        }
        case 3: {
            comp = <AudioMessage key={index} rightSide={index % 2 === 0} />
            break;
        }
    }
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
                            width={width}
                            height={height}
                            deferredMeasurementCache={cache}
                            rowHeight={cache.rowHeight}
                            rowRenderer={renderRow}
                            rowCount={list.length}
                            overscanRowCount={3}
                            className={'px-2 pb-36'}
                        />
                    )
                }
            </AutoSizer>
        </div>
    );
}
