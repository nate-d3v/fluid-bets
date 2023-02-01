import Head from 'next/head';
import { useRouter } from 'next/router';
import { Flex, Text } from '@chakra-ui/react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import '@fontsource/raleway';
import { useAccount } from 'wagmi';
import { useEffect } from 'react';

export default function Home() {
	const { isConnected } = useAccount();
	const router = useRouter();

	useEffect(() => {
		if (isConnected) {
			router.push('/matches');
		}
	}, [isConnected]);

	return (
		<>
			<Head>
				<title>Fluid Bets</title>
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<link rel="icon" href="/favicon.ico" />
			</Head>
			<Flex
				minH={'100vh'}
				flexDir="column"
				bgImg="url(/bg.jpg)"
				justify="center"
				align="center"
			>
				<Flex
					flexDir="column"
					justify="center"
					align="center"
					rounded="full"
					bgColor="#36003C"
					p={6}
					mb={16}
				>
					<Text
						fontFamily="Raleway"
						fontSize="7xl"
						fontWeight={600}
						color="white"
						mb={-12}
					>
						Fluid
					</Text>
					<Text
						fontFamily="Raleway"
						fontSize="7xl"
						fontWeight={600}
						color="white"
					>
						Bets
					</Text>
				</Flex>{' '}
				<ConnectButton />
			</Flex>
		</>
	);
}
