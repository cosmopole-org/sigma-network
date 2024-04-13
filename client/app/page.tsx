"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react";

export default function Main() {
	const router = useRouter();
	useEffect(() => {
		router.push('/app/home/spaces');
	}, [])
	return (
		<div className="w-full h-full" />
	)
}
