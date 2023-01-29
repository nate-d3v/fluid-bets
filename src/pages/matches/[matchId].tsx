import {
	Text,
	Button,
	FormControl,
	FormLabel,
	FormErrorMessage,
	NumberInput,
	NumberInputField,
} from '@chakra-ui/react';
import { PrismaClient } from '@prisma/client';
import { useProvider, useSigner } from 'wagmi';
import { useState } from 'react';

const prisma = new PrismaClient();
const apiKeyFootball = process.env.NEXT_PUBLIC_FOOTBALL_DATA_API_KEY;

export async function getServerSideProps({ query }: any) {
	try {
		const [apiRes, dbData] = await Promise.all([
			fetch(`https://api.football-data.org/v4/matches/${query.matchId}`, {
				method: 'GET',
				headers: {
					'X-Auth-Token': apiKeyFootball!,
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
	const provider = useProvider();
	const { data: signer } = useSigner();
	const [amount, setAmount] = useState('10');
	const [isError, setIsError] = useState(false);

	const sendTokens = () => {
		if (Number.isNaN(amount) || Number(amount) > 100 || Number(amount) < 10) {
			setIsError(true);
		} else {
			setIsError(false);
			console.log(amount);
		}
	};

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
			<FormControl isInvalid={isError}>
				<FormLabel>Amount</FormLabel>
				<NumberInput
					defaultValue={10}
					max={100}
					min={10}
					clampValueOnBlur={false}
				>
					<NumberInputField
						value={amount}
						onChange={e => setAmount(e.target.value)}
					/>
				</NumberInput>
				<FormErrorMessage>Min: 10 & Max: 100</FormErrorMessage>
				<Button
					onClick={() => {
						sendTokens();
					}}
				>
					Send
				</Button>
			</FormControl>
			{dbData.map((pool: any) => (
				<Text key={pool.id}>{pool.id}</Text>
			))}
		</>
	);
}
