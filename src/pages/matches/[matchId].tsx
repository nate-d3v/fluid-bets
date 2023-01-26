import { Text, Button } from '@chakra-ui/react';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const apiKeyFootball = process.env.NEXT_PUBLIC_FOOTBALL_DATA_API_KEY;

export async function getServerSideProps({ query }: any) {
	try {
		const [apiRes, dbData] = await Promise.all([
			fetch(`https://api.football-data.org/v4/matches/${query.matchId}`, {
				method: 'GET',
				headers: {
					'X-Auth-Token': apiKeyFootball as string,
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
	return request;
}

export async function sendNotification(data: any) {
	const request = await fetch('/api/push', {
		method: 'POST',
		body: JSON.stringify(data),
		headers: {
			'Content-Type': 'application/json',
		},
	});
	return request;
}

export default function Match({ apiData, dbData }: any) {
	return (
		<>
			<Text>{apiData.id}</Text>
			<Button onClick={() => postData({ matchId: apiData.id })}>
				Create pool
			</Button>
			<Button
				onClick={() =>
					sendNotification({ title: 'Hey', body: 'This is a test' })
				}
			>
				Send notification
			</Button>
			{dbData.map((pool: any) => (
				<Text key={pool.id}>{pool.id}</Text>
			))}
		</>
	);
}
