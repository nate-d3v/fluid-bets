import { Flex } from '@chakra-ui/react';
import MatchList from '../../components/MatchList';

const apiKeyFootball = process.env.NEXT_PUBLIC_FOOTBALL_DATA_API_KEY;

const fromDate = new Date().toISOString();
const toDate = new Date(
	new Date().setDate(new Date().getDate() + 10)
).toISOString();

export async function getServerSideProps() {
	try {
		const res = await fetch(
			`https://api.football-data.org/v4/competitions/PL/matches?dateFrom=${fromDate.slice(
				0,
				10
			)}&dateTo=${toDate.slice(0, 10)}`,
			{
				method: 'GET',
				headers: {
					'X-Auth-Token': apiKeyFootball!,
				},
			}
		);
		const data = await res.json();

		return { props: { data } };
	} catch (err) {
		console.log(err);
	}
}

export default function Matches({ data }: any) {
	return (
		<>
			<Flex flexDir="column">
				<MatchList data={data} />
			</Flex>
		</>
	);
}
