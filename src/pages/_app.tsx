import type { AppProps } from 'next/app';
import { ChakraProvider } from '@chakra-ui/react';
import '@rainbow-me/rainbowkit/styles.css';
import {
	getDefaultWallets,
	RainbowKitProvider,
	lightTheme,
} from '@rainbow-me/rainbowkit';
import { configureChains, createClient, WagmiConfig } from 'wagmi';
import { goerli } from 'wagmi/chains';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { publicProvider } from 'wagmi/providers/public';
import customTheme from '@/styles/theme';

const apiKeyAlchemy = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;

const { chains, provider } = configureChains(
	[goerli],
	[alchemyProvider({ apiKey: apiKeyAlchemy! }), publicProvider()]
);

const { connectors } = getDefaultWallets({
	appName: 'Fluid Bets',
	chains,
});

const wagmiClient = createClient({
	autoConnect: true,
	connectors,
	provider,
});

export default function App({ Component, pageProps }: AppProps) {
	return (
		<>
			<WagmiConfig client={wagmiClient}>
				<RainbowKitProvider
					chains={chains}
					theme={lightTheme({
						accentColor: '#FE015B',
					})}
				>
					<ChakraProvider resetCSS theme={customTheme}>
						<Component {...pageProps} />
					</ChakraProvider>
				</RainbowKitProvider>
			</WagmiConfig>
		</>
	);
}
