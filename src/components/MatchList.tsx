import NextLink from 'next/link';
import { Flex, Text, Link, Image } from '@chakra-ui/react';
import { CalendarIcon, CheckIcon, TimeIcon } from '@chakra-ui/icons';

export default function MatchList({ data }: any) {
	return (
		<>
			{data.matches.slice(0, 9).map((match: any) => (
				<Link
					key={match.id}
					as={NextLink}
					href={`/matches/${match.id}`}
					_focus={{ textDecoration: 'none' }}
					_hover={{ textDecoration: 'none' }}
					minW="45%"
				>
					<Flex justify="space-between" align="center" p={2} boxShadow="md">
						<Flex align="center">
							<Flex minW="100px" justify="center" mr={4}>
								<Image src={match.homeTeam.crest} maxH="100px" />
							</Flex>
							<Flex flexDir="column">
								<Text fontSize="lg" fontWeight="bold">
									{match.homeTeam.shortName} vs {match.awayTeam.shortName}
								</Text>
								<Flex align="center">
									<Text mr={2}>{match.utcDate.slice(0, 10)}</Text>
									<Text mr={2}>{match.utcDate.slice(-9, -1)}</Text>
									<Text pb={1}>
										{match.status === 'TIMED' ? (
											<CalendarIcon />
										) : match.status === 'FINISHED' ? (
											<CheckIcon />
										) : (
											<TimeIcon />
										)}
									</Text>
								</Flex>
							</Flex>
						</Flex>
						<Flex minW="100px" justify="center">
							<Image src={match.awayTeam.crest} maxH="100px" />
						</Flex>
					</Flex>
				</Link>
			))}
		</>
	);
}
