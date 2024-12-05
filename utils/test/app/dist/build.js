/******/ (() => { // webpackBootstrap
var __webpack_exports__ = {};
const Child = props => {
  let [obj, setObj] = useState(0);
  useEffect(() => {
    setTimeout(() => {
      setObj(obj.value + 1);
    }, 1000);
  }, [obj.value]);
  return /*#__PURE__*/React.createElement("div", {
    style: 'background-color: red;'
  }, props.name, " ", obj.value);
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
  }, show.value ? /*#__PURE__*/React.createElement(Child, {
    key: 'keyhan',
    name: 'keyhan'
  }) : /*#__PURE__*/React.createElement(Child, {
    key: 'mamad',
    name: "mamad"
  }));
};
React.init( /*#__PURE__*/React.createElement(Main, null));
/******/ })()
;