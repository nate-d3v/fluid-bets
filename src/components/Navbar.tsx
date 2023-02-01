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
				<Flex
					bgGradient="linear(to-r, #09EDFE 0%, #9540FB 100%)"
					p={2}
					rounded="xl"
					minW="7rem"
					justify="center"
				>
					<Text fontSize="xl" color="#37003C">
						Matches
					</Text>
				</Flex>
			</Link>
			<Flex
				flexDir="column"
				justify="center"
				align="center"
				rounded="full"
				bgColor="#36003C"
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
				<Flex
					bgGradient="linear(to-r, #09EDFE 0%, #9540FB 100%)"
					p={2}
					rounded="xl"
					minW="7rem"
					justify="center"
				>
					<Text fontSize="xl" color="#37003C">
						Profile
					</Text>
				</Flex>
			</Link>
		</Flex>
	);
}
