'use client'
import { Provider } from "react-redux";
import React from 'react'
import store from "./store";

function ReduxProvider({ children }: { children: React.ReactNode }) {
    return (
        <Provider store={store}>
            <main>
                {children}
            </main>
        </Provider>
    )
}

export default ReduxProvider
