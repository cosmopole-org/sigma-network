"use client"

import { Card, CircularProgress } from "@nextui-org/react";
import { useRouter } from "next/navigation"
import {useEffect, useState} from "react";
import {AppletWasm} from '@/libs/wrappers';

export default function Main() {
	const [result, setResult] = useState(0);
	//const router = useRouter();
	useEffect(() => {
		(async () => {
			AppletWasm.add(1, 2);
		})();
	}, []);
	return (
		<div className="w-full h-full">
			{result}
		</div>
	)
}
