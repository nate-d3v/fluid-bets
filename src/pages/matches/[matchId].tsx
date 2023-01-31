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
import { PrismaClient, Prisma } from '@prisma/client';
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

export async function sendNotification(action: any, data: any) {
	const request = await fetch(`/api/push?action=${action}`, {
		method: 'POST',
		body: JSON.stringify(data),
		headers: {
			'Content-Type': 'application/json',
		},
	});
	return request.json();
}

export async function superfluidRequest(action: any, data?: any) {
	const request = await fetch(`/api/superfluid?action=${action}`, {
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
	const [poolCreated, setPoolCreated] = useState(false);
	const [matchStatus, setMatchStatus] = useState<
		'TIMED' | 'FINISHED' | 'OTHER'
	>('FINISHED');
	const [userHasDeposited, setUserHasDeposited] = useState(false);

	useEffect(() => {
		if (address) {
			setProfileAddress(address);
		} else {
			setProfileAddress(undefined);
		}
	}, [address]);

	//comment this useEffect block to simulate match ending without db query
	/* useEffect(() => {
		if (apiData.status === 'TIMED') {
			setMatchStatus('TIMED');
		} else if (apiData.status === 'FINISHED') {
			setMatchStatus('FINISHED');
		} else {
			setMatchStatus('OTHER');
		}
	}, [matchStatus]); */

	useEffect(() => {
		if (dbData) {
			if (dbData.id) {
				setPoolCreated(true);
			}
		}
	}, [poolCreated]);

	useEffect(() => {
		if (dbData) {
			const homeTeam = dbData.homeTeam as Prisma.JsonArray;
			const awayTeam = dbData.awayTeam as Prisma.JsonArray;
			let usersArray = homeTeam.concat(awayTeam).map((arr: any) => arr[0]);
			setUserHasDeposited(usersArray.includes(address));
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

	const buildDistributionArray = () => {
		let arr: any[] = [];
		//change manually to simulate match ending and create winners array
		arr = dbData.homeTeam as Prisma.JsonArray;
		if (apiData.score === 'HOME_TEAM') {
		} else if (apiData.score === 'AWAY_TEAM') {
			arr = dbData.awayTeam as Prisma.JsonArray;
		} else if (apiData.score === 'DRAW') {
			const homeTeam = dbData.homeTeam as Prisma.JsonArray;
			const awayTeam = dbData.awayTeam as Prisma.JsonArray;
			arr = homeTeam.concat(awayTeam);
		}
		return arr;
	};

	const claimFunds = async () => {
		try {
			const sf = await Framework.create({
				chainId: 5,
				provider,
			});
			const signerSf = sf.createSigner({ signer: signer! });
			const daix = await sf.loadSuperToken(
				'0xF2d68898557cCb2Cf4C10c3Ef2B034b2a69DAD00'
			);
			const claimOperation = daix.claim({
				indexId: dbData.indexId,
				subscriber: address!,
				publisher: '0x85317a021541263540bFe56A665239Db71e17026',
			});
			const txnResponse = await claimOperation.exec(signerSf);
			const txnReceipt = await txnResponse.wait();
		} catch (err) {
			console.log(err);
		}
	};

	return (
		<>
			<Button
				onClick={async () => {
					const resSF = await superfluidRequest('createIndex');
					const resDB = await dbRequest(
						{ matchId: apiData.id, indexId: resSF.index },
						'POST'
					);
					sendNotification('broadcast', {
						data: {
							title: `${apiData.homeTeam.tla} - ${apiData.awayTeam.tla}`,
							body: 'A new betting pool was created',
						},
					});
					if (resDB) {
						setPoolCreated(true);
					}
				}}
				isDisabled={poolCreated || matchStatus !== 'TIMED'}
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
				<FormErrorMessage>Min: 10 DAIx & Max: 100 DAIx</FormErrorMessage>
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
							setUserHasDeposited(true);
							sendNotification('broadcast', {
								data: {
									title: `${apiData.homeTeam.tla} - ${apiData.awayTeam.tla}`,
									body: `A new participant has bet ${amount} DAIx on ${
										selectedTeam === 'homeTeam'
											? apiData.homeTeam.shortName
											: apiData.awayTeam.shortName
									}`,
								},
							});
						}
					}}
					isDisabled={
						!poolCreated || matchStatus !== 'TIMED' || userHasDeposited
					}
				>
					Deposit
				</Button>
				{userHasDeposited && (
					<Text>You already deposited funds in this pool</Text>
				)}
			</FormControl>
			<RadioGroup onChange={setSelectedTeam} value={selectedTeam}>
				<HStack>
					<Radio value="homeTeam">{apiData.homeTeam.shortName}</Radio>
					<Radio value="awayTeam">{apiData.awayTeam.shortName}</Radio>
				</HStack>
			</RadioGroup>
			<Button
				onClick={async () => {
					const arr = buildDistributionArray();
					let modArr = arr.map((item: any) => `eip155:5:${item[0]}`);
					console.log(arr);
					/* const subscriptions = await superfluidRequest('updateSubscription', {
						data: {
							indexId: dbData.indexId,
							array: arr,
						},
					}); */
					/* const distribution = await superfluidRequest('distributeFunds', {
						data: {
							indexId: dbData.indexId,
							totalAmount: dbData.totalAmount * 1e18,
						},
					}); */
					/* sendNotification('subset', {
						data: {
							title: `${apiData.homeTeam.tla} - ${apiData.awayTeam.tla}`,
							body: 'The match has ended and funds have been sent to your address',
							array: modArr,
						},
					}); */
				}}
				isDisabled={!poolCreated || matchStatus !== 'FINISHED'}
			>
				Request Distribution
			</Button>
			<Button
				onClick={() => {
					claimFunds();
				}}
			>
				Claim Funds
			</Button>
		</>
	);
}
