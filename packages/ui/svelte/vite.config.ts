// import { sveltekit } from '@sveltejs/kit/vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
// import { nodePolyfills } from 'vite-plugin-node-polyfills';
// import tailwindcss from 'tailwindcss';
import scopeTailwind from 'vite-plugin-scope-tailwind';

import { defineConfig } from 'vite';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
	plugins: [
		sveltekit()
		// scopeTailwind({
		// 	react: 'false'
		// })
		// nodePolyfills()],
	],
	// css: {
	// 	postcss: {
	// 		plugins: [tailwindcss()]
	// 	}
	// },
	build: {
		lib: {
			name: '@bewinxed/wallet-adapter-svelte-ui',
			entry: 'src/lib/index.ts',
			fileName: 'index',
			formats: ['es']
		},
		rollupOptions: {
			external: [
				'@solana/web3.js',
				'@solana/wallet-adapter-base',
				'@solana/wallet-adapter-base-ui',
				'@solana/wallet-adapter-wallets',
				'@bewinxed/wallet-adapter-svelte'
			]
		}
	}
});
