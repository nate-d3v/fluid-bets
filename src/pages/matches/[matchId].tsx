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
import { Framework } from '@superfluid-finance/sdk-core';

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
			prisma.matchPool.findFirst({
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

export async function dbRequest(data: any, method: any) {
	const request = await fetch('/api/db', {
		method: method,
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

	const sendTokens = async () => {
		if (Number.isNaN(amount) || Number(amount) > 100 || Number(amount) < 10) {
			setIsError(true);
		} else {
			setIsError(false);
			const adjustedAmount = Number(amount) * 1e18;
			const sf = await Framework.create({
				chainId: 5,
				provider,
			});
			const signerSf = sf.createSigner({ signer: signer! });
			const daix = await sf.loadSuperToken(
				'0xF2d68898557cCb2Cf4C10c3Ef2B034b2a69DAD00'
			);
			const transferOperation = daix.transfer({
				receiver: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
				amount: adjustedAmount.toString(),
			});
			const txnResponse = await transferOperation.exec(signerSf);
			const txnReceipt = await txnResponse.wait();
		}
	};

	return (
		<>
			<Text>{apiData.id}</Text>
			<Button onClick={() => dbRequest({ matchId: apiData.id }, 'POST')}>
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
						dbRequest(
							{ data: { id: dbData.id, userAmount: Number(amount) } },
							'PUT'
						);
					}}
				>
					Send
				</Button>
			</FormControl>
			<Text>{dbData.id}</Text>
		</>
	);
}
