"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function Main() {
	const router = useRouter();
	useEffect(() => {
		router.replace('/app/main');
	}, []);
	return (
		<div className="w-full h-full">
			
		</div>
	)
}
