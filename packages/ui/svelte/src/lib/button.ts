import type { Snippet } from 'svelte';
import type { HTMLButtonAttributes } from 'svelte/elements';
import type { CSSProperties } from '../types/css';

export type ButtonProps = {
	headless?: boolean;
	className?: string;
	disabled?: boolean;
	endIcon?: Snippet | string;
	onclick?: (
		e: MouseEvent & {
			currentTarget: EventTarget & HTMLButtonElement;
		}
	) => void;
	startIcon?: Snippet | string;
	style?: CSSProperties;
	tabIndex?: number;
	children?: Snippet;
} & Omit<HTMLButtonAttributes, 'style'>;
