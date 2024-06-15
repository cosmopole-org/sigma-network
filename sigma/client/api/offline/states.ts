"use client"

import { hookstate } from "@hookstate/core";

export const showRoomLoading = hookstate(true);
export const switchRoomLoading = (v: boolean) => {
	showRoomLoading.set(v);
}

export const roomSliderView = hookstate(false);
export const swtichRoomSlider = (v: boolean) => {
	roomSliderView.set(v);
}

export const showLoading = hookstate(true);
export const switchLoading = (v: boolean) => {
	showLoading.set(v);
}

export const showMainLoading = hookstate(false);
export const switchMainLoading = (v: boolean) => {
	showMainLoading.set(v);
}

export const draggingId = hookstate<string | undefined>(undefined);
export const switchDraggingId = (v: string) => {
	draggingId.set(v);
}
