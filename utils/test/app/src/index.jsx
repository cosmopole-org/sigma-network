const Child = (props) => {
    let [obj, setObj] = useState(0);
    useEffect(() => {
        setTimeout(() => {
            setObj(obj.value + 1);
        }, 1000);
    }, [obj.value]);
    return (
        <div style={'background-color: red; font-size: 20px;'}>{props.name} {obj.value}</div>
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
        <div style={'background-color: blue; width: 300px; transition: transform 3000ms; transform: ' + (!show.value ? 'translateX(1000px);' : 'translateX(0px);')}>
            {show.value ? <Child key={'keyhan'} name={'keyhan'} /> : <Child key={'Mohammad'} name={"Mohammad"} />}
        </div>
    )
}

React.init(<Main />);
