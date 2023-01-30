import {
	Text,
	Button,
	FormControl,
	FormLabel,
	FormErrorMessage,
	NumberInput,
	NumberInputField,
	RadioGroup,
	Radio,
	HStack,
} from '@chakra-ui/react';
import { PrismaClient } from '@prisma/client';
import { useProvider, useSigner, useAccount } from 'wagmi';
import { useEffect, useState } from 'react';
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
	return request.json();
}

export async function sendNotification(data: any) {
	const request = await fetch('/api/push', {
		method: 'POST',
		body: JSON.stringify(data),
		headers: {
			'Content-Type': 'application/json',
		},
	});
	return request.json();
}

export default function Match({ apiData, dbData }: any) {
	const provider = useProvider();
	const { data: signer } = useSigner();
	const { address } = useAccount();
	const [amount, setAmount] = useState('10');
	const [isError, setIsError] = useState(false);
	const [profileAddress, setProfileAddress] =
		useState<typeof address>(undefined);
	const [selectedTeam, setSelectedTeam] = useState('homeTeam');

	useEffect(() => {
		if (address) {
			setProfileAddress(address);
		}
	}, []);

	const sendTokens = async () => {
		if (Number.isNaN(amount) || Number(amount) > 100 || Number(amount) < 10) {
			setIsError(true);
		} else {
			setIsError(false);
			try {
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
					receiver: '0x85317a021541263540bFe56A665239Db71e17026',
					amount: adjustedAmount.toString(),
				});
				const txnResponse = await transferOperation.exec(signerSf);
				const txnReceipt = await txnResponse.wait();
				return txnReceipt;
			} catch (err) {
				console.log(err);
			}
		}
	};

	const superfluidRequest = async (action: any, data?: any) => {
		const request = await fetch(`/api/superfluid?action=${action}`, {
			method: 'POST',
			body: JSON.stringify(data),
			headers: {
				'Content-Type': 'application/json',
			},
		});
		return request.json();
	};

	return (
		<>
			<Text>{apiData.id}</Text>
			<Button
				onClick={async () => {
					const res = await superfluidRequest('createIndex');
					dbRequest({ matchId: apiData.id, indexId: res.index }, 'POST');
					sendNotification({
						title: `${apiData.homeTeam.tla} - ${apiData.awayTeam.tla}`,
						body: 'A new betting pool was created',
					});
				}}
			>
				Create pool
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
					onClick={async () => {
						const tx = await sendTokens();
						if (tx?.confirmations === 1) {
							dbRequest(
								{
									data: {
										id: dbData.id,
										userAmount: Number(amount),
										userAddress: profileAddress,
										team: selectedTeam,
									},
								},
								'PUT'
							);
							sendNotification({
								title: `${apiData.homeTeam.tla} - ${apiData.awayTeam.tla}`,
								body: `A new participant has bet ${amount} DAIx on ${
									selectedTeam === 'homeTeam'
										? apiData.homeTeam.shortName
										: apiData.awayTeam.shortName
								}`,
							});
						}
					}}
				>
					Deposit
				</Button>
			</FormControl>
			<RadioGroup onChange={setSelectedTeam} value={selectedTeam}>
				<HStack>
					<Radio value="homeTeam">Home Team</Radio>
					<Radio value="awayTeam">Away Team</Radio>
				</HStack>
			</RadioGroup>
		</>
	);
}
