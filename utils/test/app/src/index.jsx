const Child = (props) => {
    let [obj, setObj] = useState(0);
    useEffect(() => {
        setTimeout(() => {
            setObj(obj.value + 1);
        }, 1000);
    }, [obj.value]);
    return (
        <div style={'background-color: red;'}>{props.name} {obj.value}</div>
    )
}
const Main = () => {
    let [show, setShow] = useState(false);
    useEffect(() => {
        setTimeout(() => {
            setShow(true);
            setTimeout(() => {
                setShow(false);
            }, 3000);
        }, 3000);
    }, []);
    return (
        <div style={'background-color: blue;'}>
            {show.value ? <Child key={'keyhan'} name={'keyhan'} /> : <Child key={'mamad'} name={"mamad"} />}
        </div>
    )
}

React.init(<Main />);
