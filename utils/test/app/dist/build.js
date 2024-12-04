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
  let [show, setShow] = useState(false);
  useEffect(() => {
    setTimeout(() => {
      setShow(true);
      setTimeout(() => {
        setShow(false);
      }, 3000);
    }, 3000);
  }, []);
  return /*#__PURE__*/React.createElement("div", {
    style: 'background-color: blue;'
  }, show.value ? /*#__PURE__*/React.createElement(Child, null) : null, /*#__PURE__*/React.createElement(Child, null));
};
React.init( /*#__PURE__*/React.createElement(Main, null));
/******/ })()
;