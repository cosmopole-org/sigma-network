import React, { useState, useEffect } from 'react';

const Child = (props) => {
  let [obj, setObj] = useState(0);
  useEffect(() => {
    setTimeout(() => {
      setObj(obj + 1);
    }, 1000)
  }, [obj]);
  return (
    <div style={{ backgroundColor: 'red' }}>{obj}</div>
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
    <div style={{ backgroundColor: 'blue' }}>
      {
        show ? <Child /> : null
      }
      <Child />
    </div>
  )
}

export default Main;
