const Child = () => {
    let [obj, setObj] = useState(0);
    useEffect(() => {
        setInterval(() => {
            setObj(obj.value + 1);
        }, 1000)
    }, []);
    return (
        <div style={'background-color: red;'}>{obj.value}</div>
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
            {
                show.value ? <Child /> : null
            }
            <Child />
        </div>
    )
}

React.init(<Main />);
