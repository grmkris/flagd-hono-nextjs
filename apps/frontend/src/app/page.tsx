'use client';

import Image from 'next/image';
import { useBooleanFlagValue, useWhenProviderReady } from '@openfeature/react-sdk';

export default function Home() {


	const isReady = useWhenProviderReady();
	const booleanFlag = useBooleanFlagValue('feature1', false, {
		updateOnContextChanged: true,
	});

	if (!isReady) {
		return <div>Loading...</div>;
	}

	return (
		<div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
			<main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
				<Image
					className="dark:invert"
					src="https://nextjs.org/icons/next.svg"
					alt="Next.js logo"
					width={180}
					height={38}
					priority
				/>
				<ol className="list-inside list-decimal text-sm text-center sm:text-left font-[family-name:var(--font-geist-mono)]">
					<li className="mb-2">
						Get started by editing{' '}
						<code className="bg-black/[.05] dark:bg-white/[.06] px-1 py-0.5 rounded font-semibold">
							src/app/page.tsx
						</code>
						.
					</li>
					<li>Save and see your changes instantly.</li>
				</ol>

				{booleanFlag && (
					<div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
						<strong className="font-bold">New Message!</strong>
						<span className="block sm:inline">
							{' '}
							This message is controlled by a feature flag.
						</span>
					</div>
				)}

				<div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded relative">
					<strong className="font-bold">Feature Flag Details:</strong>
					<ul className="list-disc list-inside mt-2">
						<li>Enabled: {booleanFlag ? 'Yes' : 'No'}</li>
					</ul>
				</div>

				<div className="flex gap-4 items-center flex-col sm:flex-row">
					<a
						className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
						href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
						target="_blank"
						rel="noopener noreferrer"
					>
						<Image
							className="dark:invert"
							src="https://nextjs.org/icons/vercel.svg"
							alt="Vercel logomark"
							width={20}
							height={20}
						/>
						Deploy now
					</a>
					<a
						className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:min-w-44"
						href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
						target="_blank"
						rel="noopener noreferrer"
					>
						Read our docs
					</a>
				</div>
			</main>
			<footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
				{/* ... (footer content remains unchanged) ... */}
			</footer>
		</div>
	);
}
