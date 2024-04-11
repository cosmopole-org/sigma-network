import * as React from "react";
import { IconSvgProps } from "@/types";
import { useTheme } from "next-themes";

export const Logo: React.FC<IconSvgProps> = ({
	size = 36,
	width,
	height,
	...props
}) => (
	<svg
		fill="none"
		height={size || height}
		viewBox="0 0 32 32"
		width={size || width}
		{...props}
	>
		<path
			clipRule="evenodd"
			d="M17.6482 10.1305L15.8785 7.02583L7.02979 22.5499H10.5278L17.6482 10.1305ZM19.8798 14.0457L18.11 17.1983L19.394 19.4511H16.8453L15.1056 22.5499H24.7272L19.8798 14.0457Z"
			fill="currentColor"
			fillRule="evenodd"
		/>
	</svg>
);

export const DiscordIcon: React.FC<IconSvgProps> = ({
	size = 24,
	width,
	height,
	...props
}) => {
	return (
		<svg
			height={size || height}
			viewBox="0 0 24 24"
			width={size || width}
			{...props}
		>
			<path
				d="M14.82 4.26a10.14 10.14 0 0 0-.53 1.1 14.66 14.66 0 0 0-4.58 0 10.14 10.14 0 0 0-.53-1.1 16 16 0 0 0-4.13 1.3 17.33 17.33 0 0 0-3 11.59 16.6 16.6 0 0 0 5.07 2.59A12.89 12.89 0 0 0 8.23 18a9.65 9.65 0 0 1-1.71-.83 3.39 3.39 0 0 0 .42-.33 11.66 11.66 0 0 0 10.12 0q.21.18.42.33a10.84 10.84 0 0 1-1.71.84 12.41 12.41 0 0 0 1.08 1.78 16.44 16.44 0 0 0 5.06-2.59 17.22 17.22 0 0 0-3-11.59 16.09 16.09 0 0 0-4.09-1.35zM8.68 14.81a1.94 1.94 0 0 1-1.8-2 1.93 1.93 0 0 1 1.8-2 1.93 1.93 0 0 1 1.8 2 1.93 1.93 0 0 1-1.8 2zm6.64 0a1.94 1.94 0 0 1-1.8-2 1.93 1.93 0 0 1 1.8-2 1.92 1.92 0 0 1 1.8 2 1.92 1.92 0 0 1-1.8 2z"
				fill="currentColor"
			/>
		</svg>
	);
};

export const TwitterIcon: React.FC<IconSvgProps> = ({
	size = 24,
	width,
	height,
	...props
}) => {
	return (
		<svg
			height={size || height}
			viewBox="0 0 24 24"
			width={size || width}
			{...props}
		>
			<path
				d="M19.633 7.997c.013.175.013.349.013.523 0 5.325-4.053 11.461-11.46 11.461-2.282 0-4.402-.661-6.186-1.809.324.037.636.05.973.05a8.07 8.07 0 0 0 5.001-1.721 4.036 4.036 0 0 1-3.767-2.793c.249.037.499.062.761.062.361 0 .724-.05 1.061-.137a4.027 4.027 0 0 1-3.23-3.953v-.05c.537.299 1.16.486 1.82.511a4.022 4.022 0 0 1-1.796-3.354c0-.748.199-1.434.548-2.032a11.457 11.457 0 0 0 8.306 4.215c-.062-.3-.1-.611-.1-.923a4.026 4.026 0 0 1 4.028-4.028c1.16 0 2.207.486 2.943 1.272a7.957 7.957 0 0 0 2.556-.973 4.02 4.02 0 0 1-1.771 2.22 8.073 8.073 0 0 0 2.319-.624 8.645 8.645 0 0 1-2.019 2.083z"
				fill="currentColor"
			/>
		</svg>
	);
};

export const GithubIcon: React.FC<IconSvgProps> = ({
	size = 24,
	width,
	height,
	...props
}) => {
	return (
		<svg
			height={size || height}
			viewBox="0 0 24 24"
			width={size || width}
			{...props}
		>
			<path
				clipRule="evenodd"
				d="M12.026 2c-5.509 0-9.974 4.465-9.974 9.974 0 4.406 2.857 8.145 6.821 9.465.499.09.679-.217.679-.481 0-.237-.008-.865-.011-1.696-2.775.602-3.361-1.338-3.361-1.338-.452-1.152-1.107-1.459-1.107-1.459-.905-.619.069-.605.069-.605 1.002.07 1.527 1.028 1.527 1.028.89 1.524 2.336 1.084 2.902.829.091-.645.351-1.085.635-1.334-2.214-.251-4.542-1.107-4.542-4.93 0-1.087.389-1.979 1.024-2.675-.101-.253-.446-1.268.099-2.64 0 0 .837-.269 2.742 1.021a9.582 9.582 0 0 1 2.496-.336 9.554 9.554 0 0 1 2.496.336c1.906-1.291 2.742-1.021 2.742-1.021.545 1.372.203 2.387.099 2.64.64.696 1.024 1.587 1.024 2.675 0 3.833-2.33 4.675-4.552 4.922.355.308.675.916.675 1.846 0 1.334-.012 2.41-.012 2.737 0 .267.178.577.687.479C19.146 20.115 22 16.379 22 11.974 22 6.465 17.535 2 12.026 2z"
				fill="currentColor"
				fillRule="evenodd"
			/>
		</svg>
	);
};

export const MoonFilledIcon = ({
	size = 24,
	width,
	height,
	...props
}: IconSvgProps) => (
	<svg
		aria-hidden="true"
		focusable="false"
		height={size || height}
		role="presentation"
		viewBox="0 0 24 24"
		width={size || width}
		{...props}
	>
		<path
			d="M21.53 15.93c-.16-.27-.61-.69-1.73-.49a8.46 8.46 0 01-1.88.13 8.409 8.409 0 01-5.91-2.82 8.068 8.068 0 01-1.44-8.66c.44-1.01.13-1.54-.09-1.76s-.77-.55-1.83-.11a10.318 10.318 0 00-6.32 10.21 10.475 10.475 0 007.04 8.99 10 10 0 002.89.55c.16.01.32.02.48.02a10.5 10.5 0 008.47-4.27c.67-.93.49-1.519.32-1.79z"
			fill="currentColor"
		/>
	</svg>
);

export const SunFilledIcon = ({
	size = 24,
	width,
	height,
	...props
}: IconSvgProps) => (
	<svg
		aria-hidden="true"
		focusable="false"
		height={size || height}
		role="presentation"
		viewBox="0 0 24 24"
		width={size || width}
		{...props}
	>
		<g fill="currentColor">
			<path d="M19 12a7 7 0 11-7-7 7 7 0 017 7z" />
			<path d="M12 22.96a.969.969 0 01-1-.96v-.08a1 1 0 012 0 1.038 1.038 0 01-1 1.04zm7.14-2.82a1.024 1.024 0 01-.71-.29l-.13-.13a1 1 0 011.41-1.41l.13.13a1 1 0 010 1.41.984.984 0 01-.7.29zm-14.28 0a1.024 1.024 0 01-.71-.29 1 1 0 010-1.41l.13-.13a1 1 0 011.41 1.41l-.13.13a1 1 0 01-.7.29zM22 13h-.08a1 1 0 010-2 1.038 1.038 0 011.04 1 .969.969 0 01-.96 1zM2.08 13H2a1 1 0 010-2 1.038 1.038 0 011.04 1 .969.969 0 01-.96 1zm16.93-7.01a1.024 1.024 0 01-.71-.29 1 1 0 010-1.41l.13-.13a1 1 0 011.41 1.41l-.13.13a.984.984 0 01-.7.29zm-14.02 0a1.024 1.024 0 01-.71-.29l-.13-.14a1 1 0 011.41-1.41l.13.13a1 1 0 010 1.41.97.97 0 01-.7.3zM12 3.04a.969.969 0 01-1-.96V2a1 1 0 012 0 1.038 1.038 0 01-1 1.04z" />
		</g>
	</svg>
);

export const HeartFilledIcon = ({
	size = 24,
	width,
	height,
	...props
}: IconSvgProps) => (
	<svg
		aria-hidden="true"
		focusable="false"
		height={size || height}
		role="presentation"
		viewBox="0 0 24 24"
		width={size || width}
		{...props}
	>
		<path
			d="M12.62 20.81c-.34.12-.9.12-1.24 0C8.48 19.82 2 15.69 2 8.69 2 5.6 4.49 3.1 7.56 3.1c1.82 0 3.43.88 4.44 2.24a5.53 5.53 0 0 1 4.44-2.24C19.51 3.1 22 5.6 22 8.69c0 7-6.48 11.13-9.38 12.12Z"
			fill="currentColor"
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth={1.5}
		/>
	</svg>
);

export const SearchIcon = (props: IconSvgProps) => (
	<svg
		aria-hidden="true"
		fill="none"
		focusable="false"
		height="1em"
		role="presentation"
		viewBox="0 0 24 24"
		width="1em"
		{...props}
	>
		<path
			d="M11.5 21C16.7467 21 21 16.7467 21 11.5C21 6.25329 16.7467 2 11.5 2C6.25329 2 2 6.25329 2 11.5C2 16.7467 6.25329 21 11.5 21Z"
			stroke="currentColor"
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth="2"
		/>
		<path
			d="M22 22L20 20"
			stroke="currentColor"
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth="2"
		/>
	</svg>
);

const icons: { [key: string]: any } = {
	'project': (props: { color?: string, size?: number[] }) => {
		const { color = 'currentColor', size = [24, 24] } = props;
		return (
			<svg
				aria-hidden="true"
				focusable="false"
				height={size[1]}
				role="presentation"
				width={size[0]}
				viewBox="0 0 512 512" version="1.1" xmlns="http://www.w3.org/2000/svg" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <title>project</title> <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"> <g id="addiconCombined-Shape" fill={color} transform="translate(64.000000, 34.346667)"> <path d="M192,7.10542736e-15 L384,110.851252 L384,332.553755 L192,443.405007 L1.42108547e-14,332.553755 L1.42108547e-14,110.851252 L192,7.10542736e-15 Z M42.666,157.654 L42.6666667,307.920144 L170.666,381.82 L170.666,231.555 L42.666,157.654 Z M341.333,157.655 L213.333,231.555 L213.333,381.82 L341.333333,307.920144 L341.333,157.655 Z M192,49.267223 L66.1333333,121.936377 L192,194.605531 L317.866667,121.936377 L192,49.267223 Z"> </path> </g> </g> </g></svg>
		);
	},
	'apps': (props: { color?: string, size?: number[] }) => {
		const { color = 'currentColor', size = [24, 24] } = props;
		return (
			<svg width={size[0]} height={size[1]} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
				<g clip-path="url(#clip0_610_4755)">
					<path d="M21.81 12.74L20.99 12.11C20.99 12.02 20.99 11.98 20.99 11.89L21.79 11.26C21.95 11.14 21.99 10.92 21.89 10.75L21.04 9.27C20.97 9.14 20.83 9.07 20.69 9.07C20.64 9.07 20.59 9.08 20.54 9.1L19.59 9.48C19.51 9.43 19.48 9.41 19.4 9.37L19.25 8.36C19.22 8.15 19.05 8 18.85 8H17.14C16.94 8 16.77 8.15 16.74 8.34L16.6 9.35C16.57 9.37 16.53 9.38 16.5 9.4C16.47 9.42 16.44 9.44 16.41 9.46L15.46 9.08C15.41 9.06 15.36 9.05 15.31 9.05C15.17 9.05 15.04 9.12 14.96 9.25L14.11 10.73C14.01 10.9 14.05 11.12 14.21 11.24L15.01 11.87C15.01 11.96 15.01 12 15.01 12.1L14.21 12.73C14.05 12.85 14.01 13.07 14.11 13.24L14.96 14.72C15.03 14.85 15.17 14.92 15.31 14.92C15.36 14.92 15.41 14.91 15.46 14.89L16.41 14.52C16.49 14.57 16.53 14.59 16.61 14.63L16.76 15.64C16.79 15.84 16.96 15.98 17.16 15.98H18.87C19.07 15.98 19.24 15.83 19.27 15.64L19.42 14.63C19.45 14.61 19.49 14.6 19.52 14.58C19.55 14.56 19.58 14.54 19.61 14.52L20.56 14.9C20.61 14.92 20.66 14.93 20.71 14.93C20.85 14.93 20.98 14.86 21.06 14.73L21.91 13.25C22.01 13.08 21.97 12.86 21.81 12.74ZM18 13.5C17.17 13.5 16.5 12.83 16.5 12C16.5 11.17 17.17 10.5 18 10.5C18.83 10.5 19.5 11.17 19.5 12C19.5 12.83 18.83 13.5 18 13.5ZM17 17H19V21C19 22.1 18.1 23 17 23H7C5.9 23 5 22.1 5 21V3C5 1.9 5.9 1 7 1H17C18.1 1 19 1.9 19 3V7H17V6H7V18H17V17Z" fill={color} />
				</g>
				<defs>
					<clipPath id="clip0_610_4755">
						<rect width="24" height="24" fill="white" />
					</clipPath>
				</defs>
			</svg>

		)
	},
	'files': (props: { color?: string, size?: number[] }) => {
		const { color = 'currentColor', size = [24, 24] } = props;
		return (
			<svg fill={color} width={size[0]} height={size[1]} viewBox="0 0 256 256" id="Flat" xmlns="http://www.w3.org/2000/svg">
				<g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M213.65723,66.34326l-40-40A8.00076,8.00076,0,0,0,168,24H88A16.01833,16.01833,0,0,0,72,40V56H56A16.01833,16.01833,0,0,0,40,72V216a16.01833,16.01833,0,0,0,16,16H168a16.01833,16.01833,0,0,0,16-16V200h16a16.01833,16.01833,0,0,0,16-16V72A8.00035,8.00035,0,0,0,213.65723,66.34326ZM136,192H88a8,8,0,0,1,0-16h48a8,8,0,0,1,0,16Zm0-32H88a8,8,0,0,1,0-16h48a8,8,0,0,1,0,16Zm64,24H184V104a8.00035,8.00035,0,0,0-2.34277-5.65674l-40-40A8.00076,8.00076,0,0,0,136,56H88V40h76.68652L200,75.314Z"></path> </g>
			</svg>
		)
	},
	'storage': (props: { color?: string, size?: number[] }) => {
		const { color = 'currentColor', size = [24, 24] } = props;
		return (
			<svg viewBox="0 0 24 24" id="magicoon-Filled" xmlns="http://www.w3.org/2000/svg" fill={color} width={size[0]} height={size[1]}>
				<g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <defs> </defs> <title>folder</title> <g id="folder-Filled"> <path id="folder-Filled-2" data-name="folder-Filled" d="M21.5,12v4A4.505,4.505,0,0,1,17,20.5H7A4.505,4.505,0,0,1,2.5,16V9A4.505,4.505,0,0,1,7,4.5H9.2a2,2,0,0,1,1.664.891l1.11,1.664A1,1,0,0,0,12.8,7.5H17A4.505,4.505,0,0,1,21.5,12Z"></path> </g> </g>
			</svg>
		)
	},
	'chat': (props: { color?: string, size?: number[] }) => {
		const { color = 'currentColor', size = [24, 24] } = props;
		return (
			<svg viewBox="0 0 24 24" id="magicoon-Filled" xmlns="http://www.w3.org/2000/svg" fill={color} width={size[0]} height={size[1]}>
				<g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <defs> </defs> <title>comments</title> <g id="comments-Filled"> <path id="comments-Filled-2" data-name="comments-Filled" d="M21.5,11V21a.489.489,0,0,1-.31.46.433.433,0,0,1-.19.04.508.508,0,0,1-.36-.15L18.83,19.5H10A3.5,3.5,0,0,1,6.5,16H14a5,5,0,0,0,5-5V7.65A3.507,3.507,0,0,1,21.5,11Zm-4,0V6A3.5,3.5,0,0,0,14,2.5H6A3.5,3.5,0,0,0,2.5,6V16a.489.489,0,0,0,.31.46A.433.433,0,0,0,3,16.5a.508.508,0,0,0,.36-.15L5.17,14.5H14A3.5,3.5,0,0,0,17.5,11Z"></path> </g> </g>
			</svg>
		)
	},
	'board': (props: { color?: string, size?: number[] }) => {
		const { color = 'currentColor', size = [24, 24] } = props;
		return (
			<svg viewBox="0 0 24 24" id="magicoon-Filled" xmlns="http://www.w3.org/2000/svg" fill={color} width={size[0]} height={size[1]}>
				<g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><title>ic_fluent_board_24_filled</title> <desc>Created with Sketch.</desc> <g id="🔍-Product-Icons" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"> <g id="ic_fluent_board_24_filled" fill={color} fill-rule="nonzero"> <path d="M11.499,9.49917736 L11.5,21.0011774 L6.25005624,21.0018356 C4.51701151,21.0018356 3.10075697,19.6455145 3.00514494,17.9363661 L3,17.7519391 L3,9.49917736 L11.499,9.49917736 Z M12.999,15.4991774 L21.5,15.4991774 L21.5008077,17.7519229 C21.5005988,19.5467519 20.0455893,21.0018356 18.2507042,21.0018356 L13,21.0011774 L12.999,15.4991774 Z M18.2513521,2.49817736 C19.9843968,2.49817736 21.4006513,3.85452629 21.4962634,5.56367469 L21.5014083,5.74810161 L21.5,13.9991774 L12.999,13.9991774 L13,2.49817736 L18.2513521,2.49817736 Z M11.5,2.49817736 L11.499,7.99917736 L3,7.99917736 L3.00060063,5.74811784 C3.00080955,3.9532889 4.45581897,2.49817736 6.25064792,2.49817736 L11.5,2.49817736 Z" id="🎨-Color"> </path> </g> </g> </g>
			</svg>
		)
	},
	'tick': (props: { color?: string, size?: number[] }) => {
		const { color = 'currentColor', size = [24, 24] } = props;
		return (
			<svg width={size[0]} height={size[1]} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <title></title> <g id="Complete"> <g id="tick"> <polyline fill="none" points="3.7 14.3 9.6 19 20.3 5" stroke={color} stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></polyline> </g> </g> </g></svg>
		)
	},
	'dropdown': (props: { color?: string, size?: number[] }) => {
		const { color = 'currentColor', size = [24, 24] } = props;
		return (
			<svg width={size[0]} height={size[1]} viewBox="0 0 84 48" fill="none" xmlns="http://www.w3.org/2000/svg">
				<path d="M1.6258 1.63131C-0.541843 3.79895 -0.541843 7.29372 1.6258 9.46136L38.3873 46.2228C40.1125 47.9481 42.8995 47.9481 44.6248 46.2228L81.3862 9.46136C83.5539 7.29372 83.5539 3.79895 81.3862 1.63131C79.2186 -0.536338 75.7238 -0.536338 73.5562 1.63131L41.4839 33.6593L9.41162 1.58707C7.28822 -0.536339 3.74921 -0.536338 1.6258 1.63131V1.63131Z" fill={color} />
			</svg>

		)
	},
	'more-horiz': (props: { color?: string, size?: number[] }) => {
		const { color = 'currentColor', size = [24, 24] } = props;
		return (
			<svg width={size[0]} height={size[1]} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <circle cx="18" cy="12" r="1.5" transform="rotate(90 18 12)" fill={color}></circle> <circle cx="12" cy="12" r="1.5" transform="rotate(90 12 12)" fill={color}></circle> <circle cx="6" cy="12" r="1.5" transform="rotate(90 6 12)" fill={color}></circle> </g></svg>
		)
	},
	'code': (props: { color?: string, size?: number[] }) => {
		const { color = 'currentColor', size = [24, 24] } = props;
		return (
			<svg width={size[0]} height={size[1]} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M7 8L3 11.6923L7 16M17 8L21 11.6923L17 16M14 4L10 20" stroke={color} stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
		)
	},
	'file-search': (props: { color?: string, size?: number[] }) => {
		const { color = 'currentColor', size = [24, 24] } = props;
		return (
			<svg width={size[0]} height={size[1]} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M13 3H8.2C7.0799 3 6.51984 3 6.09202 3.21799C5.71569 3.40973 5.40973 3.71569 5.21799 4.09202C5 4.51984 5 5.0799 5 6.2V17.8C5 18.9201 5 19.4802 5.21799 19.908C5.40973 20.2843 5.71569 20.5903 6.09202 20.782C6.51984 21 7.0799 21 8.2 21H12M13 3L19 9M13 3V7.4C13 7.96005 13 8.24008 13.109 8.45399C13.2049 8.64215 13.3578 8.79513 13.546 8.89101C13.7599 9 14.0399 9 14.6 9H19M19 9V11M9 17H11M9 13H13M9 9H10M19.2686 19.2686L21 21M20 17.5C20 18.8807 18.8807 20 17.5 20C16.1193 20 15 18.8807 15 17.5C15 16.1193 16.1193 15 17.5 15C18.8807 15 20 16.1193 20 17.5Z" stroke={color} stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
		)
	},
	'file-data': (props: { color?: string, size?: number[] }) => {
		const { color = 'currentColor', size = [24, 24] } = props;
		return (
			<svg width={size[0]} height={size[1]} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M2 12C2 15.7712 2 17.6569 3.17157 18.8284C4.34315 20 6.22876 20 10 20H14C17.7712 20 19.6569 20 20.8284 18.8284C22 17.6569 22 15.7712 22 12C22 8.22876 22 6.34315 20.8284 5.17157C19.6569 4 17.7712 4 14 4H10C6.22876 4 4.34315 4 3.17157 5.17157C2.51839 5.82475 2.22937 6.69989 2.10149 8" stroke={color} stroke-width="1.5" stroke-linecap="round"></path> <path d="M10 16H6" stroke={color} stroke-width="1.5" stroke-linecap="round"></path> <path d="M14 13H18" stroke={color} stroke-width="1.5" stroke-linecap="round"></path> <path d="M14 16H12.5" stroke={color} stroke-width="1.5" stroke-linecap="round"></path> <path d="M9.5 13H11.5" stroke={color} stroke-width="1.5" stroke-linecap="round"></path> <path d="M18 16H16.5" stroke={color} stroke-width="1.5" stroke-linecap="round"></path> <path d="M6 13H7" stroke={color} stroke-width="1.5" stroke-linecap="round"></path> </g></svg>
		)
	},
	'add': (props: { color?: string, size?: number[] }) => {
		const { color = 'currentColor', size = [24, 24] } = props;
		return (
			<svg width={size[0]} height={size[1]} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill-rule="evenodd" clip-rule="evenodd" d="M11.25 12.75V18H12.75V12.75H18V11.25H12.75V6H11.25V11.25H6V12.75H11.25Z" fill={color}></path> </g></svg>
		)
	},
	'back': (props: { color?: string, size?: number[] }) => {
		let { color = 'currentColor', size = [24, 24] } = props;
		return (
			<svg width={size[0]} height={size[1]} viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" fill={color}><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path fill={color} d="M224 480h640a32 32 0 1 1 0 64H224a32 32 0 0 1 0-64z"></path><path fill={color} d="m237.248 512 265.408 265.344a32 32 0 0 1-45.312 45.312l-288-288a32 32 0 0 1 0-45.312l288-288a32 32 0 1 1 45.312 45.312L237.248 512z"></path></g></svg>
		)
	},
	'video': ({ size = [24, 24], ...props }: any) => {
		return (
			<svg
				aria-hidden="true"
				focusable="false"
				height={size[1]}
				role="presentation"
				viewBox="0 0 24 24"
				width={size[0]}
				fill="none"
				{...props}
			>
				<path d="M14.7295 2H9.26953V6.36H14.7295V2Z" fill="currentColor" />
				<path d="M16.2305 2V6.36H21.8705C21.3605 3.61 19.3305 2.01 16.2305 2Z" fill="currentColor" />
				<path d="M2 7.85938V16.1894C2 19.8294 4.17 21.9994 7.81 21.9994H16.19C19.83 21.9994 22 19.8294 22 16.1894V7.85938H2ZM14.44 16.1794L12.36 17.3794C11.92 17.6294 11.49 17.7594 11.09 17.7594C10.79 17.7594 10.52 17.6894 10.27 17.5494C9.69 17.2194 9.37 16.5394 9.37 15.6594V13.2594C9.37 12.3794 9.69 11.6994 10.27 11.3694C10.85 11.0294 11.59 11.0894 12.36 11.5394L14.44 12.7394C15.21 13.1794 15.63 13.7994 15.63 14.4694C15.63 15.1394 15.2 15.7294 14.44 16.1794Z" fill="currentColor" />
				<path d="M7.76891 2C4.66891 2.01 2.63891 3.61 2.12891 6.36H7.76891V2Z" fill="currentColor" />
			</svg>
		)
	},
	'search': ({ size = [24, 24], ...props }: any) => (
		<svg
			aria-hidden="true"
			focusable="false"
			height={size[1]}
			role="presentation"
			viewBox="0 0 24 24"
			width={size[0]}
			fill="none"
			{...props}
		>
			<path
				d="M11.5 21C16.7467 21 21 16.7467 21 11.5C21 6.25329 16.7467 2 11.5 2C6.25329 2 2 6.25329 2 11.5C2 16.7467 6.25329 21 11.5 21Z"
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={1.5}
			/>
			<path
				d="M22 22L20 20"
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={1.5}
			/>
		</svg>
	),
	'gallery': ({ size = [24, 24], ...props }: any) => (
		<svg
			aria-hidden="true"
			focusable="false"
			height={size[1]}
			role="presentation"
			viewBox="0 0 24 24"
			width={size[0]}
			fill="none"
			{...props}
		>
			<path d="M2.58078 19.0112L2.56078 19.0312C2.29078 18.4413 2.12078 17.7713 2.05078 17.0312C2.12078 17.7613 2.31078 18.4212 2.58078 19.0112Z" fill="currentColor" />
			<path d="M9.00109 10.3811C10.3155 10.3811 11.3811 9.31553 11.3811 8.00109C11.3811 6.68666 10.3155 5.62109 9.00109 5.62109C7.68666 5.62109 6.62109 6.68666 6.62109 8.00109C6.62109 9.31553 7.68666 10.3811 9.00109 10.3811Z" fill="currentColor" />
			<path d="M16.19 2H7.81C4.17 2 2 4.17 2 7.81V16.19C2 17.28 2.19 18.23 2.56 19.03C3.42 20.93 5.26 22 7.81 22H16.19C19.83 22 22 19.83 22 16.19V13.9V7.81C22 4.17 19.83 2 16.19 2ZM20.37 12.5C19.59 11.83 18.33 11.83 17.55 12.5L13.39 16.07C12.61 16.74 11.35 16.74 10.57 16.07L10.23 15.79C9.52 15.17 8.39 15.11 7.59 15.65L3.85 18.16C3.63 17.6 3.5 16.95 3.5 16.19V7.81C3.5 4.99 4.99 3.5 7.81 3.5H16.19C19.01 3.5 20.5 4.99 20.5 7.81V12.61L20.37 12.5Z" fill="currentColor" />
		</svg>
	),
	'music': ({ size = [24, 24], ...props }: any) => (
		<svg
			aria-hidden="true"
			focusable="false"
			height={size[1]}
			role="presentation"
			viewBox="0 0 24 24"
			width={size[0]}
			fill="none"
			{...props}
		>
			<path d="M9.66984 13.9219C8.92984 13.9219 8.33984 14.5219 8.33984 15.2619C8.33984 16.0019 8.93984 16.5919 9.66984 16.5919C10.4098 16.5919 11.0098 15.9919 11.0098 15.2619C11.0098 14.5219 10.4098 13.9219 9.66984 13.9219Z" fill="currentColor" />
			<path d="M16.19 2H7.81C4.17 2 2 4.17 2 7.81V16.18C2 19.83 4.17 22 7.81 22H16.18C19.82 22 21.99 19.83 21.99 16.19V7.81C22 4.17 19.83 2 16.19 2ZM17.12 9.8C17.12 10.41 16.86 10.95 16.42 11.27C16.14 11.47 15.8 11.58 15.44 11.58C15.23 11.58 15.02 11.54 14.8 11.47L12.51 10.71C12.5 10.71 12.48 10.7 12.47 10.69V15.25C12.47 16.79 11.21 18.05 9.67 18.05C8.13 18.05 6.87 16.79 6.87 15.25C6.87 13.71 8.13 12.45 9.67 12.45C10.16 12.45 10.61 12.59 11.01 12.8V8.63V8.02C11.01 7.41 11.27 6.87 11.71 6.55C12.16 6.23 12.75 6.15 13.33 6.35L15.62 7.11C16.48 7.4 17.13 8.3 17.13 9.2V9.8H17.12Z" fill="currentColor" />
		</svg>
	),
	'home': ({ size = [24, 24], color = "currentColor", ...props }: any) => (
		<svg
			aria-hidden="true"
			focusable="false"
			height={size[1]}
			role="presentation"
			viewBox="0 0 24 24"
			width={size[0]}
			fill="none"
			stroke={color}
			{...props}
		>
			<g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M15 18H9" stroke={color} stroke-width="1.5" stroke-linecap="round"></path> <path d="M21.6359 12.9579L21.3572 14.8952C20.8697 18.2827 20.626 19.9764 19.451 20.9882C18.2759 22 16.5526 22 13.1061 22H10.8939C7.44737 22 5.72409 22 4.54903 20.9882C3.37396 19.9764 3.13025 18.2827 2.64284 14.8952L2.36407 12.9579C1.98463 10.3208 1.79491 9.00229 2.33537 7.87495C2.87583 6.7476 4.02619 6.06234 6.32691 4.69181L7.71175 3.86687C9.80104 2.62229 10.8457 2 12 2C13.1543 2 14.199 2.62229 16.2882 3.86687L17.6731 4.69181C19.9738 6.06234 21.1242 6.7476 21.6646 7.87495" stroke={color} stroke-width="1.5" stroke-linecap="round"></path> </g>
		</svg>
	),
	'dbl-tick': ({ size = [24, 24], color = "currentColor", ...props }: any) => (
		<svg
			viewBox="0 0 16 16"
			xmlns="http://www.w3.org/2000/svg"
			version="1.1"
			fill="none"
			stroke={color}
			stroke-linecap="round"
			stroke-linejoin="round"
			stroke-width="1.5"
			aria-hidden="true"
			focusable="false"
			height={size[1]}
			role="presentation"
			width={size[0]}
			{...props}
		>
			<g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="m1.75 9.75 2.5 2.5m3.5-4 2.5-2.5m-4.5 4 2.5 2.5 6-6.5"></path> </g>
		</svg>
	),
	'notification': ({ size = [24, 24], color = "currentColor", ...props }: any) => (
		<svg
			viewBox="0 0 24 24"
			xmlns="http://www.w3.org/2000/svg"
			version="1.1"
			fill="none"
			stroke={color}
			stroke-linecap="round"
			stroke-linejoin="round"
			stroke-width="1.5"
			aria-hidden="true"
			focusable="false"
			height={size[1]}
			role="presentation"
			width={size[0]}
			{...props}
		>
			<g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M12.02 2.90991C8.70997 2.90991 6.01997 5.59991 6.01997 8.90991V11.7999C6.01997 12.4099 5.75997 13.3399 5.44997 13.8599L4.29997 15.7699C3.58997 16.9499 4.07997 18.2599 5.37997 18.6999C9.68997 20.1399 14.34 20.1399 18.65 18.6999C19.86 18.2999 20.39 16.8699 19.73 15.7699L18.58 13.8599C18.28 13.3399 18.02 12.4099 18.02 11.7999V8.90991C18.02 5.60991 15.32 2.90991 12.02 2.90991Z" stroke={color} stroke-width="2" stroke-miterlimit="10" stroke-linecap="round"></path> <path d="M13.87 3.19994C13.56 3.10994 13.24 3.03994 12.91 2.99994C11.95 2.87994 11.03 2.94994 10.17 3.19994C10.46 2.45994 11.18 1.93994 12.02 1.93994C12.86 1.93994 13.58 2.45994 13.87 3.19994Z" stroke={color} stroke-width="2" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M15.02 19.0601C15.02 20.7101 13.67 22.0601 12.02 22.0601C11.2 22.0601 10.44 21.7201 9.90002 21.1801C9.36002 20.6401 9.02002 19.8801 9.02002 19.0601" fill="#fff" stroke={color} stroke-width="2" stroke-miterlimit="10"></path> </g>
		</svg>
	),
	'invite': ({ size = [24, 24], color = "currentColor", ...props }: any) => (
		<svg
			viewBox="0 0 24 24"
			xmlns="http://www.w3.org/2000/svg"
			version="1.1"
			fill="none"
			stroke={color}
			stroke-linecap="round"
			stroke-linejoin="round"
			stroke-width="1.5"
			aria-hidden="true"
			focusable="false"
			height={size[1]}
			role="presentation"
			width={size[0]}
			{...props}
		>
			<g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <title>invite_fill</title> <g id="页面-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"> <g id="Contact" transform="translate(-864.000000, -48.000000)" fill-rule="nonzero"> <g id="invite_fill" transform="translate(864.000000, 48.000000)"> <path d="M24,0 L24,24 L0,24 L0,0 L24,0 Z M12.5934901,23.257841 L12.5819402,23.2595131 L12.5108777,23.2950439 L12.4918791,23.2987469 L12.4918791,23.2987469 L12.4767152,23.2950439 L12.4056548,23.2595131 C12.3958229,23.2563662 12.3870493,23.2590235 12.3821421,23.2649074 L12.3780323,23.275831 L12.360941,23.7031097 L12.3658947,23.7234994 L12.3769048,23.7357139 L12.4804777,23.8096931 L12.4953491,23.8136134 L12.4953491,23.8136134 L12.5071152,23.8096931 L12.6106902,23.7357139 L12.6232938,23.7196733 L12.6232938,23.7196733 L12.6266527,23.7031097 L12.609561,23.275831 C12.6075724,23.2657013 12.6010112,23.2592993 12.5934901,23.257841 L12.5934901,23.257841 Z M12.8583906,23.1452862 L12.8445485,23.1473072 L12.6598443,23.2396597 L12.6498822,23.2499052 L12.6498822,23.2499052 L12.6471943,23.2611114 L12.6650943,23.6906389 L12.6699349,23.7034178 L12.6699349,23.7034178 L12.678386,23.7104931 L12.8793402,23.8032389 C12.8914285,23.8068999 12.9022333,23.8029875 12.9078286,23.7952264 L12.9118235,23.7811639 L12.8776777,23.1665331 C12.8752882,23.1545897 12.8674102,23.1470016 12.8583906,23.1452862 L12.8583906,23.1452862 Z M12.1430473,23.1473072 C12.1332178,23.1423925 12.1221763,23.1452606 12.1156365,23.1525954 L12.1099173,23.1665331 L12.0757714,23.7811639 C12.0751323,23.7926639 12.0828099,23.8018602 12.0926481,23.8045676 L12.108256,23.8032389 L12.3092106,23.7104931 L12.3186497,23.7024347 L12.3186497,23.7024347 L12.3225043,23.6906389 L12.340401,23.2611114 L12.337245,23.2485176 L12.337245,23.2485176 L12.3277531,23.2396597 L12.1430473,23.1473072 Z" id="MingCute" fill-rule="nonzero"> </path> <path d="M17,3 C18.597725,3 19.903664,4.24892392 19.9949075,5.82372764 L20,6 L20,10.3501 L20.5939,10.0862 C21.2076,9.813435 21.9162954,10.2366962 21.9931452,10.8836127 L22,11 L22,19 C22,20.0543909 21.18415,20.9181678 20.1492661,20.9945144 L20,21 L4,21 C2.94563773,21 2.08183483,20.18415 2.00548573,19.1492661 L2,19 L2,11 C2,10.3284056 2.6746366,9.85267997 3.29700147,10.045194 L3.40614,10.0862 L4,10.3501 L4,6 C4,4.40232321 5.24892392,3.09633941 6.82372764,3.00509271 L7,3 L17,3 Z M17,5 L7,5 C6.44772,5 6,5.44772 6,6 L6,11.239 L12,13.9057 L18,11.239 L18,6 C18,5.44772 17.5523,5 17,5 Z M12,8 C12.5523,8 13,8.44772 13,9 C13,9.51283143 12.613973,9.93550653 12.1166239,9.9932722 L12,10 L10,10 C9.44772,10 9,9.55228 9,9 C9,8.48716857 9.38604429,8.06449347 9.88337975,8.0067278 L10,8 L12,8 Z" id="形状" fill={color}> </path> </g> </g> </g> </g>
		</svg>
	),
	'settings': ({ size = [24, 24], color = "currentColor", ...props }: any) => (
		<svg
			viewBox="0 0 1920 1920"
			xmlns="http://www.w3.org/2000/svg"
			version="1.1"
			fill={color}
			stroke={color}
			stroke-linecap="round"
			stroke-linejoin="round"
			stroke-width="1.5"
			aria-hidden="true"
			focusable="false"
			height={size[1]}
			role="presentation"
			width={size[0]}
			{...props}
		>
			<g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M1703.534 960c0-41.788-3.84-84.48-11.633-127.172l210.184-182.174-199.454-340.856-265.186 88.433c-66.974-55.567-143.323-99.389-223.85-128.415L1158.932 0h-397.78L706.49 269.704c-81.43 29.138-156.423 72.282-223.962 128.414l-265.073-88.32L18 650.654l210.184 182.174C220.39 875.52 216.55 918.212 216.55 960s3.84 84.48 11.633 127.172L18 1269.346l199.454 340.856 265.186-88.433c66.974 55.567 143.322 99.389 223.85 128.415L761.152 1920h397.779l54.663-269.704c81.318-29.138 156.424-72.282 223.963-128.414l265.073 88.433 199.454-340.856-210.184-182.174c7.793-42.805 11.633-85.497 11.633-127.285m-743.492 395.294c-217.976 0-395.294-177.318-395.294-395.294 0-217.976 177.318-395.294 395.294-395.294 217.977 0 395.294 177.318 395.294 395.294 0 217.976-177.317 395.294-395.294 395.294" fill-rule="evenodd"></path> </g>
		</svg>
	),
	'send': ({ size = [24, 24], color = "currentColor", ...props }: any) => (
		<svg
			viewBox="0 0 24 24"
			xmlns="http://www.w3.org/2000/svg"
			version="1.1"
			fill="none"
			stroke={color}
			stroke-linecap="round"
			stroke-linejoin="round"
			stroke-width="1.5"
			aria-hidden="true"
			focusable="false"
			height={size[1]}
			role="presentation"
			width={size[0]}
			{...props}>
			<g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M11.5003 12H5.41872M5.24634 12.7972L4.24158 15.7986C3.69128 17.4424 3.41613 18.2643 3.61359 18.7704C3.78506 19.21 4.15335 19.5432 4.6078 19.6701C5.13111 19.8161 5.92151 19.4604 7.50231 18.7491L17.6367 14.1886C19.1797 13.4942 19.9512 13.1471 20.1896 12.6648C20.3968 12.2458 20.3968 11.7541 20.1896 11.3351C19.9512 10.8529 19.1797 10.5057 17.6367 9.81135L7.48483 5.24303C5.90879 4.53382 5.12078 4.17921 4.59799 4.32468C4.14397 4.45101 3.77572 4.78336 3.60365 5.22209C3.40551 5.72728 3.67772 6.54741 4.22215 8.18767L5.24829 11.2793C5.34179 11.561 5.38855 11.7019 5.407 11.8459C5.42338 11.9738 5.42321 12.1032 5.40651 12.231C5.38768 12.375 5.34057 12.5157 5.24634 12.7972Z" stroke={color} stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g>
		</svg>
	),
	'attachment': ({ size = [24, 24], color = "currentColor", ...props }: any) => (
		<svg
			viewBox="0 0 28 28"
			xmlns="http://www.w3.org/2000/svg"
			version="1.1"
			fill={color}
			stroke={color}
			stroke-linecap="round"
			stroke-linejoin="round"
			stroke-width="1.5"
			aria-hidden="true"
			focusable="false"
			height={size[1]}
			role="presentation"
			width={size[0]}
			{...props}>
			<g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <title>attachment 2</title> <desc>Created with Sketch Beta.</desc> <defs> </defs> <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"> <g id="Icon-Set-Filled" transform="translate(-260.000000, -156.000000)" fill={color}> <path d="M286.562,166.181 L272.325,180.26 C269.966,182.593 266.141,182.593 263.782,180.26 C261.423,177.928 261.423,174.146 263.782,171.813 L276.596,159.141 C278.168,157.586 280.718,157.586 282.291,159.141 C283.863,160.696 283.863,163.218 282.291,164.772 L269.477,177.444 C268.691,178.222 267.416,178.222 266.629,177.444 C265.843,176.667 265.843,175.406 266.629,174.628 L278.02,163.365 L276.596,161.957 L265.206,173.221 C263.633,174.775 263.633,177.297 265.206,178.853 C266.778,180.407 269.328,180.407 270.901,178.852 L283.714,166.181 C286.073,163.849 286.074,160.065 283.715,157.733 C281.355,155.4 277.531,155.4 275.172,157.733 L261.646,171.108 L261.696,171.157 C259.238,174.281 259.455,178.797 262.358,181.668 C265.262,184.539 269.828,184.754 272.987,182.323 L273.036,182.372 L287.986,167.589 L286.562,166.181" id="attachment-2"> </path> </g> </g> </g>
		</svg>
	),
	'play': ({ size = [24, 24], color = "currentColor", ...props }: any) => (
		<svg
			viewBox="0 0 24 24"
			xmlns="http://www.w3.org/2000/svg"
			version="1.1"
			fill={'none'}
			stroke={color}
			stroke-linecap="round"
			stroke-linejoin="round"
			stroke-width="1.5"
			aria-hidden="true"
			focusable="false"
			height={size[1]}
			role="presentation"
			width={size[0]}
			{...props}>
			<g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M16.6582 9.28638C18.098 10.1862 18.8178 10.6361 19.0647 11.2122C19.2803 11.7152 19.2803 12.2847 19.0647 12.7878C18.8178 13.3638 18.098 13.8137 16.6582 14.7136L9.896 18.94C8.29805 19.9387 7.49907 20.4381 6.83973 20.385C6.26501 20.3388 5.73818 20.0469 5.3944 19.584C5 19.053 5 18.1108 5 16.2264V7.77357C5 5.88919 5 4.94701 5.3944 4.41598C5.73818 3.9531 6.26501 3.66111 6.83973 3.6149C7.49907 3.5619 8.29805 4.06126 9.896 5.05998L16.6582 9.28638Z" stroke={color} stroke-width="2" stroke-linejoin="round"></path> </g>
		</svg>
	),
	'pause': ({ size = [24, 24], color = "currentColor", ...props }: any) => (
		<svg
			aria-hidden="true"
			fill="none"
			focusable="false"
			height={size[1]}
			role="presentation"
			viewBox="0 0 24 24"
			width={size[0]}
			{...props}
		>
			<path
				d="M11.9688 2C6.44875 2 1.96875 6.48 1.96875 12C1.96875 17.52 6.44875 22 11.9688 22C17.4888 22 21.9688 17.52 21.9688 12C21.9688 6.48 17.4988 2 11.9688 2ZM10.7188 15.03C10.7188 15.51 10.5188 15.7 10.0087 15.7H8.70875C8.19875 15.7 7.99875 15.51 7.99875 15.03V8.97C7.99875 8.49 8.19875 8.3 8.70875 8.3H9.99875C10.5087 8.3 10.7087 8.49 10.7087 8.97V15.03H10.7188ZM15.9987 15.03C15.9987 15.51 15.7987 15.7 15.2887 15.7H13.9987C13.4887 15.7 13.2887 15.51 13.2887 15.03V8.97C13.2887 8.49 13.4887 8.3 13.9987 8.3H15.2887C15.7987 8.3 15.9987 8.49 15.9987 8.97V15.03Z"
				fill={color}
			/>
		</svg>
	),
	'next': ({ size = [24, 24], color = "currentColor", ...props }: any) => (
		<svg
			aria-hidden="true"
			fill="none"
			focusable="false"
			height={size[1]}
			role="presentation"
			viewBox="0 0 24 24"
			width={size[0]}
			{...props}
		>
			<path
				d="M3.76172 7.21957V16.7896C3.76172 18.7496 5.89172 19.9796 7.59172 18.9996L11.7417 16.6096L15.8917 14.2096C17.5917 13.2296 17.5917 10.7796 15.8917 9.79957L11.7417 7.39957L7.59172 5.00957C5.89172 4.02957 3.76172 5.24957 3.76172 7.21957Z"
				fill={color}
			/>
			<path
				d="M20.2383 18.9303C19.8283 18.9303 19.4883 18.5903 19.4883 18.1803V5.82031C19.4883 5.41031 19.8283 5.07031 20.2383 5.07031C20.6483 5.07031 20.9883 5.41031 20.9883 5.82031V18.1803C20.9883 18.5903 20.6583 18.9303 20.2383 18.9303Z"
				fill={color}
			/>
		</svg>
	),
	'prev': ({ size = [24, 24], color = "currentColor", ...props }: any) => (
		<svg
			aria-hidden="true"
			fill="none"
			focusable="false"
			height={size[1]}
			role="presentation"
			viewBox="0 0 24 24"
			width={size[0]}
			{...props}
		>
			<path
				d="M20.2409 7.21957V16.7896C20.2409 18.7496 18.1109 19.9796 16.4109 18.9996L12.2609 16.6096L8.11094 14.2096C6.41094 13.2296 6.41094 10.7796 8.11094 9.79957L12.2609 7.39957L16.4109 5.00957C18.1109 4.02957 20.2409 5.24957 20.2409 7.21957Z"
				fill={color}
			/>
			<path
				d="M3.76172 18.9303C3.35172 18.9303 3.01172 18.5903 3.01172 18.1803V5.82031C3.01172 5.41031 3.35172 5.07031 3.76172 5.07031C4.17172 5.07031 4.51172 5.41031 4.51172 5.82031V18.1803C4.51172 18.5903 4.17172 18.9303 3.76172 18.9303Z"
				fill={color}
			/>
		</svg>
	),
	'folder': ({ size = [24, 24], color = "currentColor", ...props }: any) => (
		<svg
			aria-hidden="true"
			fill="none"
			focusable="false"
			height={size[1]}
			role="presentation"
			viewBox="0 0 24 24"
			width={size[0]}
			{...props}
		>
			<g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M18 10L13 10" stroke={color} stroke-width="1.5" stroke-linecap="round"></path> <path d="M10 3H16.5C16.9644 3 17.1966 3 17.3916 3.02567C18.7378 3.2029 19.7971 4.26222 19.9743 5.60842C20 5.80337 20 6.03558 20 6.5" stroke={color} stroke-width="1.5"></path> <path d="M22 11.7979C22 9.16554 22 7.84935 21.2305 6.99383C21.1598 6.91514 21.0849 6.84024 21.0062 6.76946C20.1506 6 18.8345 6 16.2021 6H15.8284C14.6747 6 14.0979 6 13.5604 5.84678C13.2651 5.7626 12.9804 5.64471 12.7121 5.49543C12.2237 5.22367 11.8158 4.81578 11 4L10.4497 3.44975C10.1763 3.17633 10.0396 3.03961 9.89594 2.92051C9.27652 2.40704 8.51665 2.09229 7.71557 2.01738C7.52976 2 7.33642 2 6.94975 2C6.06722 2 5.62595 2 5.25839 2.06935C3.64031 2.37464 2.37464 3.64031 2.06935 5.25839C2 5.62595 2 6.06722 2 6.94975M21.9913 16C21.9554 18.4796 21.7715 19.8853 20.8284 20.8284C19.6569 22 17.7712 22 14 22H10C6.22876 22 4.34315 22 3.17157 20.8284C2 19.6569 2 17.7712 2 14V11" stroke={color} stroke-width="1.5" stroke-linecap="round"></path> </g>
		</svg>
	),
	'connect': ({ size = [24, 24], color = "currentColor", ...props }: any) => (
		<svg
			aria-hidden="true"
			fill={color}
			focusable="false"
			height={size[1]}
			role="presentation"
			viewBox="0 0 45.902 45.902"
			width={size[0]}
			{...props}
		>
			<g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <g> <path d="M43.162,26.681c-1.564-1.578-3.631-2.539-5.825-2.742c1.894-1.704,3.089-4.164,3.089-6.912 c0-5.141-4.166-9.307-9.308-9.307c-4.911,0-8.932,3.804-9.281,8.625c4.369,1.89,7.435,6.244,7.435,11.299 c0,1.846-0.42,3.65-1.201,5.287c1.125,0.588,2.162,1.348,3.066,2.26c2.318,2.334,3.635,5.561,3.61,8.851l-0.002,0.067 l-0.002,0.057l-0.082,1.557h11.149l0.092-12.33C45.921,30.878,44.936,28.466,43.162,26.681z"></path> <path d="M23.184,34.558c1.893-1.703,3.092-4.164,3.092-6.912c0-5.142-4.168-9.309-9.309-9.309c-5.142,0-9.309,4.167-9.309,9.309 c0,2.743,1.194,5.202,3.084,6.906c-4.84,0.375-8.663,4.383-8.698,9.318l-0.092,1.853h14.153h15.553l0.092-1.714 c0.018-2.514-0.968-4.926-2.741-6.711C27.443,35.719,25.377,34.761,23.184,34.558z"></path> <path d="M6.004,11.374v3.458c0,1.432,1.164,2.595,2.597,2.595c1.435,0,2.597-1.163,2.597-2.595v-3.458h3.454 c1.433,0,2.596-1.164,2.596-2.597c0-1.432-1.163-2.596-2.596-2.596h-3.454V2.774c0-1.433-1.162-2.595-2.597-2.595 c-1.433,0-2.597,1.162-2.597,2.595V6.18H2.596C1.161,6.18,0,7.344,0,8.776c0,1.433,1.161,2.597,2.596,2.597H6.004z"></path> </g> </g> </g>
		</svg>
	),
	'message': ({ size = [24, 24], color = "currentColor", ...props }: any) => (
		<svg
			aria-hidden="true"
			fill="none"
			focusable="false"
			height={size[1]}
			role="presentation"
			viewBox="0 0 24 24"
			width={size[0]}
			{...props}
		>
			<g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M19.4003 18C19.7837 17.2499 20 16.4002 20 15.5C20 12.4624 17.5376 10 14.5 10C11.4624 10 9 12.4624 9 15.5C9 18.5376 11.4624 21 14.5 21L21 21C21 21 20 20 19.4143 18.0292M18.85 12C18.9484 11.5153 19 11.0137 19 10.5C19 6.35786 15.6421 3 11.5 3C7.35786 3 4 6.35786 4 10.5C4 11.3766 4.15039 12.2181 4.42676 13C5.50098 16.0117 3 18 3 18H9.5" stroke={color} stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g>
		</svg>
	),
	'block': ({ size = [24, 24], color = "currentColor", ...props }: any) => (
		<svg
			aria-hidden="true"
			fill="none"
			focusable="false"
			height={size[1]}
			role="presentation"
			viewBox="0 0 24 24"
			width={size[0]}
			{...props}
		>
			<g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M5.63604 5.63604L18.364 18.364M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke={color} stroke-width="1.5"></path> </g>
		</svg>
	),
	'call': ({ size = [24, 24], color = "currentColor", ...props }: any) => (
		<svg
			aria-hidden="true"
			fill="none"
			focusable="false"
			height={size[1]}
			role="presentation"
			viewBox="0 0 24 24"
			width={size[0]}
			{...props}
		>
			<g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill-rule="evenodd" clip-rule="evenodd" d="M17.3545 22.2323C15.3344 21.7262 11.1989 20.2993 7.44976 16.5502C3.70065 12.8011 2.2738 8.66559 1.76767 6.6455C1.47681 5.48459 2.00058 4.36434 2.88869 3.72997L5.21694 2.06693C6.57922 1.09388 8.47432 1.42407 9.42724 2.80051L10.893 4.91776C11.5152 5.8165 11.3006 7.0483 10.4111 7.68365L9.24234 8.51849C9.41923 9.1951 9.96939 10.5846 11.6924 12.3076C13.4154 14.0306 14.8049 14.5807 15.4815 14.7576L16.3163 13.5888C16.9517 12.6994 18.1835 12.4847 19.0822 13.1069L21.1995 14.5727C22.5759 15.5257 22.9061 17.4207 21.933 18.783L20.27 21.1113C19.6356 21.9994 18.5154 22.5232 17.3545 22.2323ZM8.86397 15.136C12.2734 18.5454 16.0358 19.8401 17.8405 20.2923C18.1043 20.3583 18.4232 20.2558 18.6425 19.9488L20.3056 17.6205C20.6299 17.1665 20.5199 16.5348 20.061 16.2171L17.9438 14.7513L17.0479 16.0056C16.6818 16.5182 16.0047 16.9202 15.2163 16.7501C14.2323 16.5378 12.4133 15.8569 10.2782 13.7218C8.1431 11.5867 7.46219 9.7677 7.24987 8.7837C7.07977 7.9953 7.48181 7.31821 7.99439 6.95208L9.24864 6.05618L7.78285 3.93893C7.46521 3.48011 6.83351 3.37005 6.37942 3.6944L4.05117 5.35744C3.74413 5.57675 3.64162 5.89565 3.70771 6.15943C4.15989 7.96418 5.45459 11.7266 8.86397 15.136Z" fill={color}></path> </g>
		</svg>
	),
	'city': ({ size = [24, 24], color = "currentColor", ...props }: any) => (
		<svg
			aria-hidden="true"
			fill="none"
			focusable="false"
			height={size[1]}
			role="presentation"
			viewBox="0 0 24 24"
			width={size[0]}
			{...props}
		>
			<g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M9.70711 4.79289C9.41421 4.5 8.94281 4.5 8 4.5H7.75V3C7.75 2.58579 7.41421 2.25 7 2.25C6.58579 2.25 6.25 2.58579 6.25 3V4.5H6C5.05719 4.5 4.58579 4.5 4.29289 4.79289C4 5.08579 4 5.55719 4 6.5V6.7038C4.20249 6.65059 4.40564 6.61348 4.60559 6.5866C5.25121 6.4998 6.04487 6.49989 6.9105 6.49999H7.0895C7.95513 6.49989 8.74879 6.4998 9.39441 6.5866C9.59436 6.61348 9.79751 6.65059 9.99999 6.7038L10 6.5C10 5.55719 10 5.08579 9.70711 4.79289Z" fill={color}></path> <path fill-rule="evenodd" clip-rule="evenodd" d="M2 21.25C1.58579 21.25 1.25 21.5858 1.25 22C1.25 22.4142 1.58579 22.75 2 22.75H22C22.4142 22.75 22.75 22.4142 22.75 22C22.75 21.5858 22.4142 21.25 22 21.25H21V7.77195C21 6.4311 21 5.76068 20.6439 5.24676C20.2877 4.73283 19.66 4.49743 18.4045 4.02663C15.9492 3.10591 14.7216 2.64555 13.8608 3.2421C13 3.83864 13 5.14974 13 7.77195V10.5L13.0895 10.5C13.9551 10.4999 14.7488 10.4998 15.3944 10.5866C16.1054 10.6822 16.8568 10.9071 17.4749 11.5251C18.0929 12.1432 18.3178 12.8946 18.4134 13.6056C18.5002 14.2512 18.5001 15.0449 18.5 15.9105L18.5 16V21.25H17V16C17 14.1144 17 13.1716 16.4142 12.5858C15.8284 12 14.8856 12 13 12H11C9.11438 12 8.17157 12 7.58579 12.5858C7 13.1716 7 14.1144 7 16V21.25H5.5V16L5.49999 15.9105C5.49989 15.0449 5.4998 14.2512 5.5866 13.6056C5.68219 12.8946 5.90708 12.1432 6.52513 11.5251C7.14317 10.9071 7.89462 10.6822 8.60558 10.5866C9.25121 10.4998 10.0449 10.4999 10.9105 10.5L10.9825 10.5C10.9436 9.56385 10.8183 8.98987 10.4142 8.58579C9.82843 8 8.88562 8 7 8C5.11438 8 4.17157 8 3.58579 8.58579C3 9.17157 3 10.1144 3 12V21.25H2ZM9.25 15C9.25 14.5858 9.58579 14.25 10 14.25H14C14.4142 14.25 14.75 14.5858 14.75 15C14.75 15.4142 14.4142 15.75 14 15.75H10C9.58579 15.75 9.25 15.4142 9.25 15ZM9.25 18C9.25 17.5858 9.58579 17.25 10 17.25H14C14.4142 17.25 14.75 17.5858 14.75 18C14.75 18.4142 14.4142 18.75 14 18.75H10C9.58579 18.75 9.25 18.4142 9.25 18Z" fill={color}></path> </g>
		</svg>
	),
	'people': ({ size = [24, 24], color = "currentColor", ...props }: any) => (
		<svg
			aria-hidden="true"
			fill={color}
			focusable="false"
			height={size[1]}
			role="presentation"
			viewBox="0 0 24 24"
			width={size[0]}
			{...props}
		>
			<g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <title>contacts_fill</title> <g id="页面-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"> <g id="User" transform="translate(-528.000000, -48.000000)" fill-rule="nonzero"> <g id="contacts_fill" transform="translate(528.000000, 48.000000)"> <path d="M24,0 L24,24 L0,24 L0,0 L24,0 Z M12.5934901,23.257841 L12.5819402,23.2595131 L12.5108777,23.2950439 L12.4918791,23.2987469 L12.4918791,23.2987469 L12.4767152,23.2950439 L12.4056548,23.2595131 C12.3958229,23.2563662 12.3870493,23.2590235 12.3821421,23.2649074 L12.3780323,23.275831 L12.360941,23.7031097 L12.3658947,23.7234994 L12.3769048,23.7357139 L12.4804777,23.8096931 L12.4953491,23.8136134 L12.4953491,23.8136134 L12.5071152,23.8096931 L12.6106902,23.7357139 L12.6232938,23.7196733 L12.6232938,23.7196733 L12.6266527,23.7031097 L12.609561,23.275831 C12.6075724,23.2657013 12.6010112,23.2592993 12.5934901,23.257841 L12.5934901,23.257841 Z M12.8583906,23.1452862 L12.8445485,23.1473072 L12.6598443,23.2396597 L12.6498822,23.2499052 L12.6498822,23.2499052 L12.6471943,23.2611114 L12.6650943,23.6906389 L12.6699349,23.7034178 L12.6699349,23.7034178 L12.678386,23.7104931 L12.8793402,23.8032389 C12.8914285,23.8068999 12.9022333,23.8029875 12.9078286,23.7952264 L12.9118235,23.7811639 L12.8776777,23.1665331 C12.8752882,23.1545897 12.8674102,23.1470016 12.8583906,23.1452862 L12.8583906,23.1452862 Z M12.1430473,23.1473072 C12.1332178,23.1423925 12.1221763,23.1452606 12.1156365,23.1525954 L12.1099173,23.1665331 L12.0757714,23.7811639 C12.0751323,23.7926639 12.0828099,23.8018602 12.0926481,23.8045676 L12.108256,23.8032389 L12.3092106,23.7104931 L12.3186497,23.7024347 L12.3186497,23.7024347 L12.3225043,23.6906389 L12.340401,23.2611114 L12.337245,23.2485176 L12.337245,23.2485176 L12.3277531,23.2396597 L12.1430473,23.1473072 Z" id="MingCute" fill-rule="nonzero"> </path> <path d="M15,14 C17.6887316,14 19.8818169,16.1223292 19.9953804,18.7831122 L20,19 L20,20 C20,21.0543909 19.18415,21.9181678 18.1492661,21.9945144 L18,22 L4,22 C2.94563773,22 2.08183483,21.18415 2.00548573,20.1492661 L2,20 L2,19 C2,16.3112684 4.12231026,14.1181831 6.78311066,14.0046196 L7,14 L15,14 Z M21,13 C21.5523,13 22,13.4477 22,14 C22,14.5523 21.5523,15 21,15 L20,15 C19.4477,15 19,14.5523 19,14 C19,13.4477 19.4477,13 20,13 L21,13 Z M11,2 C13.7614,2 16,4.23858 16,7 C16,9.76142 13.7614,12 11,12 C8.23858,12 6,9.76142 6,7 C6,4.23858 8.23858,2 11,2 Z M21,10 C21.5523,10 22,10.4477 22,11 C22,11.5523 21.5523,12 21,12 L19,12 C18.4477,12 18,11.5523 18,11 C18,10.4477 18.4477,10 19,10 L21,10 Z M21,7 C21.5523,7 22,7.44772 22,8 C22,8.51283143 21.613973,8.93550653 21.1166239,8.9932722 L21,9 L18,9 C17.4477,9 17,8.55228 17,8 C17,7.48716857 17.386027,7.06449347 17.8833761,7.0067278 L18,7 L21,7 Z" id="形状" fill={color}> </path> </g> </g> </g> </g>
		</svg>
	),
	'endCall': ({ size = [24, 24], color = "currentColor", ...props }: any) => (
		<svg
			aria-hidden="true"
			fill={color}
			focusable="false"
			height={size[1]}
			role="presentation"
			viewBox="0 0 24 24"
			width={size[0]}
			{...props}
		>
			<g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M8 13.4782L8 12.8617C8 12.8617 8 11.3963 12 11.3963C16 11.3963 16 12.8617 16 12.8617V13.25C16 14.2064 16.7227 15.0192 17.7004 15.1625L19.7004 15.4556C20.9105 15.6329 22 14.7267 22 13.5429V11.4183C22 10.8313 21.8162 10.2542 21.3703 9.85601C20.2296 8.83732 17.4208 7 12 7C6.25141 7 3.44027 9.58269 2.44083 10.7889C2.1247 11.1704 2 11.6525 2 12.1414L2 14.0643C2 15.3623 3.29561 16.292 4.57997 15.9156L6.57997 15.3295C7.42329 15.0823 8 14.3305 8 13.4782Z" fill={color}></path> </g>
		</svg>
	),
	'toggleCam': ({ size = [24, 24], color = "currentColor", ...props }: any) => (
		<svg
			aria-hidden="true"
			fill={color}
			focusable="false"
			height={size[1]}
			role="presentation"
			viewBox="0 0 24 24"
			width={size[0]}
			{...props}
		>
			<g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M21.5 6.1c-.3-.2-.7-.2-1 0l-4.4 3V7c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2v-2.1l4.4 3c.2.1.4.2.6.2.2 0 .3 0 .5-.1.3-.2.5-.5.5-.9V7c0-.4-.2-.7-.5-.9zM14 17H4V7h10v10zm6-1.9l-4-2.7v-.9l4-2.7v6.3z" fill={color}></path></g>
		</svg>
	),
	'toggleMic': ({ size = [24, 24], color = "currentColor", ...props }: any) => (
		<svg
			aria-hidden="true"
			fill={color}
			focusable="false"
			height={size[1]}
			role="presentation"
			viewBox="0 0 24 24"
			width={size[0]}
			{...props}
		>
			<g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill-rule="evenodd" clip-rule="evenodd" d="M14.5 10.5V5.5C14.5 4.11929 13.3807 3 12 3C10.6193 3 9.5 4.11929 9.5 5.5V10.5C9.5 11.8807 10.6193 13 12 13C13.3807 13 14.5 11.8807 14.5 10.5ZM12 1C9.51472 1 7.5 3.01472 7.5 5.5V10.5C7.5 12.9853 9.51472 15 12 15C14.4853 15 16.5 12.9853 16.5 10.5V5.5C16.5 3.01472 14.4853 1 12 1Z" fill={color}></path> <path d="M12 17C5.49999 17 5.99999 12 5.99999 12C5.99999 12 6.00001 11 5.00001 11C4.00001 11 3.99999 12 3.99999 12C3.99999 12 3.54013 18.4382 11 18.9657V22C11 22.5523 11.4477 23 12 23C12.5523 23 13 22.5523 13 22V18.9657C20.4599 18.4382 20 12 20 12C20 12 20 11 19 11C18 11 18 12 18 12C18 12 18.5 17 12 17Z" fill={color}></path> </g>
		</svg>
	),
	'more': ({ size = [24, 24], color = "currentColor", ...props }: any) => (
		<svg
			aria-hidden="true"
			fill={color}
			focusable="false"
			height={size[1]}
			role="presentation"
			viewBox="0 0 24 24"
			width={size[0]}
			{...props}
		>
			<g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g id="Menu / More_Vertical"> <g id="Vector"> <path d="M11 18C11 18.5523 11.4477 19 12 19C12.5523 19 13 18.5523 13 18C13 17.4477 12.5523 17 12 17C11.4477 17 11 17.4477 11 18Z" stroke={color} stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M11 12C11 12.5523 11.4477 13 12 13C12.5523 13 13 12.5523 13 12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12Z" stroke={color} stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M11 6C11 6.55228 11.4477 7 12 7C12.5523 7 13 6.55228 13 6C13 5.44772 12.5523 5 12 5C11.4477 5 11 5.44772 11 6Z" stroke={color} stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g> </g> </g>
		</svg>
	),
}

export default icons;

export const NextUILogo: React.FC<IconSvgProps> = (props) => {
	const { width, height = 40 } = props;

	return (
		<svg
			fill="none"
			height={height}
			viewBox="0 0 161 32"
			width={width}
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<path
				className="fill-black dark:fill-white"
				d="M55.6827 5V26.6275H53.7794L41.1235 8.51665H40.9563V26.6275H39V5H40.89L53.5911 23.1323H53.7555V5H55.6827ZM67.4831 26.9663C66.1109 27.0019 64.7581 26.6329 63.5903 25.9044C62.4852 25.185 61.6054 24.1633 61.0537 22.9582C60.4354 21.5961 60.1298 20.1106 60.1598 18.6126C60.132 17.1113 60.4375 15.6228 61.0537 14.2563C61.5954 13.0511 62.4525 12.0179 63.5326 11.268C64.6166 10.5379 65.8958 10.16 67.1986 10.1852C68.0611 10.1837 68.9162 10.3468 69.7187 10.666C70.5398 10.9946 71.2829 11.4948 71.8992 12.1337C72.5764 12.8435 73.0985 13.6889 73.4318 14.6152C73.8311 15.7483 74.0226 16.9455 73.9968 18.1479V19.0773H63.2262V17.4194H72.0935C72.1083 16.4456 71.8952 15.4821 71.4714 14.6072C71.083 13.803 70.4874 13.1191 69.7472 12.6272C68.9887 12.1348 68.1022 11.8812 67.2006 11.8987C66.2411 11.8807 65.3005 12.1689 64.5128 12.7223C63.7332 13.2783 63.1083 14.0275 62.6984 14.8978C62.2582 15.8199 62.0314 16.831 62.0352 17.8546V18.8476C62.009 20.0078 62.2354 21.1595 62.6984 22.2217C63.1005 23.1349 63.7564 23.9108 64.5864 24.4554C65.4554 24.9973 66.4621 25.2717 67.4831 25.2448C68.1676 25.2588 68.848 25.1368 69.4859 24.8859C70.0301 24.6666 70.5242 24.3376 70.9382 23.919C71.3183 23.5345 71.6217 23.0799 71.8322 22.5799L73.5995 23.1604C73.3388 23.8697 72.9304 24.5143 72.4019 25.0506C71.8132 25.6529 71.1086 26.1269 70.3314 26.4434C69.4258 26.8068 68.4575 26.9846 67.4831 26.9663V26.9663ZM78.8233 10.4075L82.9655 17.325L87.1076 10.4075H89.2683L84.1008 18.5175L89.2683 26.6275H87.103L82.9608 19.9317L78.8193 26.6275H76.6647L81.7711 18.5169L76.6647 10.4062L78.8233 10.4075ZM99.5142 10.4075V12.0447H91.8413V10.4075H99.5142ZM94.2427 6.52397H96.1148V22.3931C96.086 22.9446 96.2051 23.4938 96.4597 23.9827C96.6652 24.344 96.9805 24.629 97.3589 24.7955C97.7328 24.9548 98.1349 25.0357 98.5407 25.0332C98.7508 25.0359 98.9607 25.02 99.168 24.9857C99.3422 24.954 99.4956 24.9205 99.6283 24.8853L100.026 26.5853C99.8062 26.6672 99.5805 26.7327 99.3511 26.7815C99.0274 26.847 98.6977 26.8771 98.3676 26.8712C97.6854 26.871 97.0119 26.7156 96.3973 26.4166C95.7683 26.1156 95.2317 25.6485 94.8442 25.0647C94.4214 24.4018 94.2097 23.6242 94.2374 22.8363L94.2427 6.52397ZM118.398 5H120.354V19.3204C120.376 20.7052 120.022 22.0697 119.328 23.2649C118.644 24.4235 117.658 25.3698 116.477 26.0001C115.168 26.6879 113.708 27.0311 112.232 26.9978C110.759 27.029 109.302 26.6835 107.996 25.9934C106.815 25.362 105.827 24.4161 105.141 23.2582C104.447 22.0651 104.092 20.7022 104.115 19.319V5H106.08V19.1831C106.061 20.2559 106.324 21.3147 106.843 22.2511C107.349 23.1459 108.094 23.8795 108.992 24.3683C109.993 24.9011 111.111 25.1664 112.242 25.139C113.373 25.1656 114.493 24.9003 115.495 24.3683C116.395 23.8815 117.14 23.1475 117.644 22.2511C118.16 21.3136 118.421 20.2553 118.402 19.1831L118.398 5ZM128 5V26.6275H126.041V5H128Z"
			/>
			<path
				className="fill-black dark:fill-white"
				d="M23.5294 0H8.47059C3.79241 0 0 3.79241 0 8.47059V23.5294C0 28.2076 3.79241 32 8.47059 32H23.5294C28.2076 32 32 28.2076 32 23.5294V8.47059C32 3.79241 28.2076 0 23.5294 0Z"
			/>
			<path
				className="fill-white dark:fill-black"
				d="M17.5667 9.21729H18.8111V18.2403C18.8255 19.1128 18.6 19.9726 18.159 20.7256C17.7241 21.4555 17.0968 22.0518 16.3458 22.4491C15.5717 22.8683 14.6722 23.0779 13.6473 23.0779C12.627 23.0779 11.7286 22.8672 10.9521 22.4457C10.2007 22.0478 9.5727 21.4518 9.13602 20.7223C8.6948 19.9705 8.4692 19.1118 8.48396 18.2403V9.21729H9.72854V18.1538C9.71656 18.8298 9.88417 19.4968 10.2143 20.0868C10.5362 20.6506 11.0099 21.1129 11.5814 21.421C12.1689 21.7448 12.8576 21.9067 13.6475 21.9067C14.4374 21.9067 15.1272 21.7448 15.7169 21.421C16.2895 21.1142 16.7635 20.6516 17.0844 20.0868C17.4124 19.4961 17.5788 18.8293 17.5667 18.1538V9.21729ZM23.6753 9.21729V22.845H22.4309V9.21729H23.6753Z"
			/>
		</svg>
	);
};
