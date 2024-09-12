
import Icon from "./icon"

export default function Tick(props: Readonly<{ text: any }>) {
    const { text } = props
    return (
        <div style={{ display: 'flex', marginTop: 8 }}>
            <Icon name={'tick'} size={[12, 12]} />
            <p className="text-xs ml-1">
                {text}
            </p>
        </div>
    )
}