import { Text, Button } from '@chakra-ui/react';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const apiKey = process.env.NEXT_PUBLIC_FOOTBALL_DATA_API_KEY;

export async function getServerSideProps({ query }: any) {
	try {
		const [apiRes, dbData] = await Promise.all([
			fetch(`https://api.football-data.org/v4/matches/${query.matchId}`, {
				method: 'GET',
				headers: {
					'X-Auth-Token': apiKey as string,
				},
			}),
			prisma.matchPool.findMany({
				where: {
					matchId: Number(query.matchId),
				},
			}),
		]);
		const apiData = await apiRes.json();

		return { props: { apiData, dbData } };
	} catch (err) {
		console.log(err);
	}
}

export async function postData(data: any) {
	const request = await fetch('/api/db', {
		method: 'POST',
		body: JSON.stringify(data),
		headers: {
			'Content-Type': 'application/json',
		},
	});
	return await request.json();
}

export default function Match({ apiData, dbData }: any) {
	return (
		<>
			<Text>{apiData.id}</Text>
			<Button onClick={() => postData({ matchId: apiData.id })}>
				Create pool
			</Button>
			{dbData.map((pool: any) => (
				<Text key={pool.id}>{pool.id}</Text>
			))}
		</>
	);
}
