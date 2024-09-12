"use client"

import { ThemeSwitch } from "../theme-switch"

export default function HomeSettings() {
    return (
        <div className="w-full h-auto pl-4 pr-4 pb-20">
            <div className="mt-4 m-h-16 w-full bg-transparent" key={'home'}>
                <div className="flex flex-col relative w-full">
                    <span className="text-lg text-left">App theme</span>
                    <span className="text-md text-default-400 text-left">swtich theme between light and dark</span>
                    <ThemeSwitch className="absolute right-2 top-3" />
                </div>
            </div>
        </div>
    )
}
