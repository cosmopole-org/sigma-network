import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import { Provider } from "./provider.tsx";
import "@/styles/globals.css";
import Api from "./api/index.ts";
import { Actions, RouteSys, States } from "./api/offline/states.tsx";

window.addEventListener('error', e => {
  if (e.message === 'ResizeObserver loop limit exceeded') {
    const resizeObserverErrDiv = document.getElementById(
      'webpack-dev-server-client-overlay-div'
    );
    const resizeObserverErr = document.getElementById(
      'webpack-dev-server-client-overlay'
    );
    if (resizeObserverErr) {
      resizeObserverErr.setAttribute('style', 'display: none');
    }
    if (resizeObserverErrDiv) {
      resizeObserverErrDiv.setAttribute('style', 'display: none');
    }
  }
});

export let api: Api;

Api.load().then((a) => {
  api = a;
  const loadauth = () => {
    setTimeout(() => {
      RouteSys.push("/app/auth");
    }, 2000);
  }
  if (States.getToken().length > 0) {
    api.services.auth.authenticate().then(res => {
      Actions.updateAuthenticated(res);
      if (!res) loadauth();
    }).catch(e => {
      console.log(e);
      Actions.updateAuthenticated(false);
      loadauth();
    });
  } else {
    Actions.updateAuthenticated(false);
    loadauth();
  }
  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <BrowserRouter>
        <Provider>
          <App />
        </Provider>
      </BrowserRouter>
    </React.StrictMode>,
  );
})
