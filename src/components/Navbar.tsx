import NextLink from 'next/link';
import { Flex, Text, Link } from '@chakra-ui/react';
import '@fontsource/raleway';

export default function Navbar() {
	return (
		<Flex justify="center" align="center" mb={10}>
			<Link
				as={NextLink}
				href="/matches"
				_focus={{ textDecoration: 'none' }}
				_hover={{ textDecoration: 'none' }}
			>
				<Flex p={2} rounded="xl" minW="7rem" justify="center" bgColor="#E9237A">
					<Text fontSize="xl" color="white">
						Matches
					</Text>
				</Flex>
			</Link>
			<Flex
				flexDir="column"
				justify="center"
				align="center"
				rounded="full"
				bgGradient="linear(to-r, #963CFF 0%, #FB2988 100%)"
				p={4}
				mx={5}
			>
				<Text
					fontFamily="Raleway"
					fontSize="5xl"
					fontWeight={600}
					color="white"
					mb={-8}
				>
					Fluid
				</Text>
				<Text
					fontFamily="Raleway"
					fontSize="5xl"
					fontWeight={600}
					color="white"
				>
					Bets
				</Text>
			</Flex>
			<Link
				as={NextLink}
				href="/profile"
				_focus={{ textDecoration: 'none' }}
				_hover={{ textDecoration: 'none' }}
			>
				<Flex p={2} rounded="xl" minW="7rem" justify="center" bgColor="#E9237A">
					<Text fontSize="xl" color="white">
						Profile
					</Text>
				</Flex>
			</Link>
		</Flex>
	);
}
