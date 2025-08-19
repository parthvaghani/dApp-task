"use client";

import { Toaster } from "react-hot-toast";

export default function ToasterProvider() {
	return (
		<Toaster
			position="top-right"
			toastOptions={{
				duration: 4000,
				style: {
					background: '#363636',
					color: '#fff',
					borderRadius: '8px',
					fontSize: '14px',
				},
				success: {
					style: {
						background: '#10B981',
					},
				},
				error: {
					style: {
						background: '#EF4444',
					},
				},
			}}
		/>
	);
}


