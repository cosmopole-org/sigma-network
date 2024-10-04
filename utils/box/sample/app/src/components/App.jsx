import React from "react";

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

let kCounter = 1;
const generateKey = () => {
    return "a_" + (kCounter++);
}

const Test = () => {
    const [list, setList] = React.useState([]);
    let onClick = () => {
        setList((l) => {
            l.push(generateKey());
            return l;
        });
    };
    let onClick2 = () => {
        setList((l) => {
            l.splice(0, 1);
            return l;
        });
    };
    return (
        <div key={"container"} style={`background-color: blue;`}>
            <button
                key={"adderBtn"}
                style="width: 200px; height: 200px; background-color: yellow;"
                onClick={onClick}
            >
                add
            </button>
            <button
                key={"adderBtn2"}
                style="width: 200px; height: 200px; background-color: green;"
                onClick={onClick2}
            >
                remove
            </button>
            {
                list().map((d) => <div key={d}><div><Counter /></div></div>)
            }
        </div>
    )
}

const TestTest = () => {
    return <Test />
}

const App = () => {
    return <TestTest />
}

export default App;
