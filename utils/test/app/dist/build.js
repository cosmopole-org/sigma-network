/******/ (() => { // webpackBootstrap
var __webpack_exports__ = {};
const Child = () => {
  let [obj, setObj] = useState(0);
  useEffect(() => {
    setInterval(() => {
      setObj(obj.value + 1);
    }, 1000);
  }, []);
  return /*#__PURE__*/React.createElement("div", {
    style: 'background-color: red;'
  }, obj.value);
};
const Main = () => {
  let [arr, setArr] = useState([Math.random().toString(), Math.random().toString()]);
  let [b, setB] = useState(false);
  useEffect(() => {
    setInterval(() => {
      if (arr.value.length > 5) setB(true);
      if (!b.value) setArr([...arr.value, Math.random().toString()]);else if (arr.value.length > 0) setArr(arr.value.slice(1, arr.value.length));
    }, 3000);
  }, []);
  return /*#__PURE__*/React.createElement("div", {
    style: 'background-color: blue;'
  }, arr.value.map(i => /*#__PURE__*/React.createElement(Child, {
    key: i
  })));
};
React.init( /*#__PURE__*/React.createElement(Main, null));
/******/ })()
;