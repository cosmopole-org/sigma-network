import { useRef, useEffect, useState, useCallback } from 'react';
import waveformAvgChunker from './waveformAvgChunker';
import useSetTrackProgress from './useSetTrackProgress'
import React from 'react';

const pointCoordinates = (props: {
    index: number, pointWidth: number, pointMargin: number, canvasHeight: number, amplitude: any,
}) => {
    let { index, pointWidth, pointMargin, canvasHeight, amplitude } = props
    const pointHeight = Math.round((amplitude / 25) * canvasHeight)
    const verticalCenter = Math.round((canvasHeight - pointHeight) / 2)
    return [
        index * (pointWidth + pointMargin), // x starting point
        (canvasHeight - pointHeight) - verticalCenter, // y starting point
        pointWidth, // width
        pointHeight, // height
    ]
}

const paintCanvas = (props: {
    canvasRef: any, waveformData: any, canvasHeight: number, pointWidth: number, pointMargin: number,
    playingPoint: any, hoverXCoord: any
}) => {
    let {
        canvasRef, waveformData, canvasHeight, pointWidth, pointMargin,
        playingPoint, hoverXCoord
    } = props
    const ref = canvasRef.current
    if (ref) {
        const ctx = ref.getContext('2d')
        // On every canvas update, erase the canvas before painting
        // If you don't do this, you'll end up stacking waveforms and waveform
        // colors on top of each other
        ctx.clearRect(0, 0, ref.width, ref.height)
        waveformData.forEach(
            (p: any, i: any) => {
                ctx.beginPath()
                const coordinates = pointCoordinates({
                    index: i,
                    pointWidth,
                    pointMargin,
                    canvasHeight,
                    amplitude: p,
                })
                ctx.rect(...coordinates)
                const withinHover = hoverXCoord >= coordinates[0]
                const alreadyPlayed = i < playingPoint
                if (withinHover) {
                    ctx.fillStyle = alreadyPlayed ? '#ddd' : '#ccc'
                } else if (alreadyPlayed) {
                    ctx.fillStyle = '#ddd'
                } else {
                    ctx.fillStyle = '#ccc'
                }
                ctx.fill()
            })
    }
}

const Waveform = (props: { isPreview: boolean, style?: any }) => {
    const [waveformData, setWaveformData] = useState([
        3, 9, 5, 5, 1, 5, 7, -1, 5, 1, 3, 3, -1, 3, 3, 7, 1, 7, 3, 3, 3, -1, 3, 7, 3, 5, 5, 3, 5, 3, 3, 1, 3, 5, 5, 1, 1, 3, 3, 9, 5, 3, 7, 3, 1, 5, 7, 1, 3, 7, 5, 3, 3, 5, 7, -1, 1, 13, 3, 5, 3, 1, 5, 1, 3, 9, 7, 3, 5, 1, 3, 5, 1, 1, 3, 5, 3, 3, 5, 3, 3, 3, 3, 1, 3, 5, 3, 3, 5, 5, 7, 1, 1, 5, 1, 1, 3, 3, 3, 3
    ])
    const [trackProgress, setTrackProgress] = useState(0)
    const canvasRef = useRef(null)
    const chunkedData = waveformAvgChunker(waveformData)
    const waveformWidth = props.style?.width ? props.style.width : 100
    const canvasHeight = 56
    const pointWidth = 4
    const pointMargin = 1
    const [trackPlaying, setTrackPlaying] = useState(true)
    const [hoverXCoord, setHoverXCoord]: [any, any] = useState()
    const playingPoint = (
        (trackProgress * waveformWidth / 100)
        / (pointWidth + pointMargin)
    )
    useEffect(() => {
        setTimeout(() => {
            paintWaveform()
        });
    }, [waveformData])
    const paintWaveform = useCallback(() => {
        paintCanvas({
            canvasRef,
            waveformData: chunkedData,
            canvasHeight,
            pointWidth,
            pointMargin,
            playingPoint,
            hoverXCoord
        })
    }, [playingPoint, waveformData])

    useSetTrackProgress({
        trackProgress, setTrackProgress,
        trackPlaying
    })

    useEffect(() => {
        if (canvasRef.current) {
            paintWaveform()
        }
    }, [canvasRef])

    useEffect(() => {
        paintWaveform()
    }, [playingPoint])

    const setDefaultX = useCallback(() => {
        setHoverXCoord(undefined)
    }, [])

    const handleMouseMove = useCallback((e: any) => {
        if (canvasRef.current) {
            setHoverXCoord(
                e.clientX - (canvasRef.current as HTMLCanvasElement).getBoundingClientRect().left,
            )
        }
    }, [])

    const seekTrack = (e: any) => {
        e.stopPropagation();
        if (canvasRef.current) {
            const xCoord = e.clientX - (canvasRef.current as HTMLCanvasElement).getBoundingClientRect().left
            const seekPerc = xCoord * 100 / waveformWidth 
            setTrackProgress(seekPerc)
        }
    }

    return (
        <div>
            {
                waveformData.length > 0 ? (
                    <canvas
                        style={{ ...props.style, height: canvasHeight, display: 'block' }}
                        ref={canvasRef}
                        height={canvasHeight}
                        width={waveformWidth}
                        onBlur={setDefaultX}
                        onMouseOut={setDefaultX}
                        onMouseMove={handleMouseMove}
                        onClick={seekTrack}
                    />
                ) : (
                    <div
                        style={{
                            width: 120, height: 0, position: 'absolute', left: 60, top: 40,
                            borderStyle: 'dashed', borderWidth: 2
                        }}
                    />
                )
            }
        </div>
    )
}

export default Waveform
