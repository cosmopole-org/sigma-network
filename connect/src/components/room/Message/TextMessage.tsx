
import { Card, colors } from '@nextui-org/react';
import './bubble.css'
import Icon from '@/components/elements/icon';
import { useTheme } from '@/api/offline/states';

const TextMessage = (props: { message: any, side?: string, lastOfSection?: boolean, firstOfSection?: boolean, isQuote?: boolean }) => {
    const { theme } = useTheme();
    return (
        <div
            style={{
                height: 'auto',
                width: 'auto',
                minWidth: 100,
                maxWidth: props.lastOfSection ? 214 : 200,
                borderRadius: props.isQuote ? 0 :
                    props.side === 'left' ?
                        `${props.firstOfSection ? 16 : 8}px 16px 16px 8px` :
                        `16px ${props.firstOfSection ? 24 : 8}px 8px 16px`,
                padding: 8,
                marginBottom: 4,
                paddingTop: (props.isQuote ? 0 : 8) + (props.firstOfSection ? 4 : 0),
                marginLeft: props.side === 'left' ? props.lastOfSection ? 0 : 14 : 'auto',
                marginRight: props.side === 'left' ? 'auto' : props.lastOfSection ? 0 : 14,
                marginTop: 0,
                background: props.side === "left" ? (theme === "dark" ? "#1b2730" : "#ffffff") : `linear-gradient(135deg, ${colors.blue[600]} 0%, ${colors.purple[600]} 65%) border-box`,
            }}
            className={props.isQuote ? '' : (props.side === 'right' ? "bubble" : "bubble2") + (props.lastOfSection ? (" " + props.side) : "") +
                " shadow-medium bg-white dark:bg-content2"}
        >
            <div style={{ width: 'auto', height: '100%', position: 'relative' }}>
                {
                    props.firstOfSection ? (
                        <p
                        className={props.side === "left" ? theme === "dark" ? 'text-white' : "text-content" : "text-white"}
                            style={{
                                textAlign: "left", fontWeight: 'bold', borderRadius: 8, marginTop: 0, height: 'auto',
                                background: 'transparent'
                            }}
                        >
                            {(props.message as any).author.firstName}
                        </p>
                    ) : null
                }
                <p
                    className={props.side === "left" ? theme === "dark" ? 'text-white' : "text-content" : "text-white"}
                    style={{
                        textAlign: "left", wordWrap: 'break-word', textOverflow: props.isQuote ? 'ellipsis' : undefined,
                        whiteSpace: props.isQuote ? 'nowrap' : undefined, overflow: props.isQuote ? 'hidden' : undefined,
                        display: 'flex', wordBreak: 'break-word', fontSize: 14, height: 'auto', paddingBottom: 20,
                    }}
                >
                    {props.message.data.text}
                </p>
                {
                    props.isQuote ?
                        null :
                        (
                            <div style={{
                                width: 'auto', position: 'absolute', bottom: 0, right: 0, display: "flex",
                                paddingLeft: 0, paddingRight: 0,
                                borderRadius: "16px 16px 0px 16px"
                            }}>
                                <p
                    className={props.side === "left" ? theme === "dark" ? 'text-white' : "text-content" : "text-white"}
                                    style={{ textAlign: "right", flex: 1, fontSize: 12 }}
                                >
                                    {(new Date(props.message.time)).toTimeString().substring(0, 5)}
                                </p>
                                {
                                    // (props.message as any).isDummy ? (
                                    <Icon
                                        name='more'
                                        className='w-4 h-4 ml-[2px]'
                                        color={props.side === "left" ? theme === "dark" ? '#ffffff' : "#333333" : "#ffffff"}
                                    />
                                    // ) : props.message.authorId !== api.memory.myHumanId.get({ noproxy: true }) ?
                                    //     null :
                                    //     props.message.seen ? (
                                    //         <Icon
                                    //             name='more'
                                    //             className='w-4 h-4 ml-[2px]'
                                    //             color={'#000'}
                                    //         />
                                    //     ) : (
                                    //         <Icon
                                    //             name='more'
                                    //             className='w-4 h-4 ml-[2px]'
                                    //             color={'#000'}
                                    //         />
                                    //     )
                                }
                            </div>
                        )
                }
            </div>
        </div>
    );
}

export default TextMessage;
