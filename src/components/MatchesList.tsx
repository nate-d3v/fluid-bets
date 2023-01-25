import NextLink from 'next/link';
import { Flex, Text, Link } from '@chakra-ui/react';

export default function MatchesList({ data }: any) {
	return (
		<>
			{data.matches.slice(0, 9).map((match: any) => (
				<Link key={match.id} as={NextLink} href={`/matches/${match.id}`}>
					<Flex flexDir="column">
						<Text>{match.utcDate.slice(0, 10)}</Text>
						<Text>{match.utcDate.slice(-9, -1)}</Text>
						<Text>
							{match.homeTeam.shortName} vs {match.awayTeam.shortName}
						</Text>
					</Flex>
				</Link>
			))}
		</>
	);
}
