"use client"

import { RouteSys } from '@/api/offline/states';
import { Logo } from '@/components/icons';
import { useEffect } from 'react';

export default function Main() {
	useEffect(() => {
		RouteSys.push('/app', { changePath: true });
	}, []);
	return (
		<div className="relative flex flex-col" style={{ height: window.innerHeight + 'px' }
		}>
			<main className="w-full h-full">
				<Logo size={88} className="fixed left-2/4 top-2/4 -translate-x-2/4 -translate-y-2/4" />
			</main>
		</div >
	)
}
