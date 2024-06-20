import { React } from "../runtime/react";

const Counter = () => {
    const [count, setCount] = React.useState(0);
    let onClick = () => {
        setCount((c) => (c + 1));
    };
    return (
        <button
            style="width: 200px; height: 200px;"
            onClick={onClick}
        >
            {count()}
        </button>
    );
}

const Test = () => {
    const [flag, setFlag] = React.useState(false);
    const [list, setList] = React.useState([]);
    let onClick = () => {
        setFlag((c) => (!c));
        setList((l) => {
            l.push(Math.random().toString());
            return l;
        });
    };
    return (
        <div style={`background-color: ${flag() ? "blue" : "red"};`}>
            <button
                style="width: 200px; height: 200px; background-color: green;"
                onClick={onClick}
            >
                {flag()}
            </button>
            {
                list().map(d => <div key={d}><Counter /></div>)
            }
        </div>
    )
}

const App = () => {
    const [flag, setFlag] = React.useState(false);
    let onClick = () => {
        setFlag((c) => (!c));
    };
    return (
       <div style={`background-color: ${flag() ? "blue" : "red"};`}>
            <button
                style="width: 200px; height: 200px; background-color: yellow;"
                onClick={onClick}
            >
                {flag()}
            </button>
            <Test />
        </div>
    )
}

export default App;
