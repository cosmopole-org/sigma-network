"use client"

import { Card, CircularProgress } from "@nextui-org/react";
import { useRouter } from "next/navigation"
import { useEffect } from "react";

export default function Main() {
	const router = useRouter();
	useEffect(() => {
		router.push('/app/home/spaces');
	}, [])
	return (
		<div className="w-full h-full">
			<Card shadow="none" radius="none" className="w-full h-full fixed left-0 top-0" style={{ zIndex: 50 }}>
				<Card className="w-24 h-24 fixed left-[50%] top-[50%] -translate-x-1/2 -translate-y-1/2 items-center justify-center">
					<CircularProgress />
				</Card>
			</Card>
		</div>
	)
}
