import Head from 'next/head';
import { Flex } from '@chakra-ui/react';
import { MatchList, Navbar } from '../../components';

const apiKeyFootball = process.env.NEXT_PUBLIC_FOOTBALL_DATA_API_KEY;

const fromDate = new Date(
	new Date().setDate(new Date().getDate() - 3)
).toISOString();
const toDate = new Date(
	new Date().setDate(new Date().getDate() + 7)
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
			<Head>
				<title>Fluid Bets</title>
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<link rel="icon" href="/favicon.ico" />
			</Head>
			<Flex minH={'100vh'} flexDir="column" align="center" bgImg="url(/bg.jpg)">
				<Navbar />
				<MatchList data={data} />
			</Flex>
		</>
	);
}
