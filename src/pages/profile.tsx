import * as PushAPI from '@pushprotocol/restapi';
import { useAccount, useSigner, useBalance } from 'wagmi';
import { Flex, Text, Button, VStack, Image, Box } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { Navbar } from '@/components';

export default function Profile() {
	const { address } = useAccount();
	const { data: signer } = useSigner();
	const { data } = useBalance({
		address: address,
		chainId: 5,
		token: '0xF2d68898557cCb2Cf4C10c3Ef2B034b2a69DAD00',
	});
	const [isSubscribed, setIsSubscribed] = useState(false);
	const [profileAddress, setProfileAddress] =
		useState<typeof address>(undefined);
	const [notificationsArray, setNotificationsArray] = useState([]);
	const [subscriptionsArray, setSubscriptionsArray] = useState<string[]>([]);
	const [balance, setBalance] = useState(0);

	useEffect(() => {
		if (address) {
			setProfileAddress(address);
		} else {
			setProfileAddress(undefined);
		}
	}, [address]);

	useEffect(() => {
		if (data) {
			setBalance(Number(data?.formatted));
		}
	});

	useEffect(() => {
		const checkSubscription = async () => {
			const subscriptions = await PushAPI.user.getSubscriptions({
				user: `eip155:5:${address}`,
				env: 'staging',
			});

			if (subscriptions) {
				let arr = subscriptions.map((obj: any) => obj.channel);
				setSubscriptionsArray(arr);

				if (
					subscriptionsArray.includes(
						'0x85317a021541263540bfe56a665239db71e17026'
					)
				) {
					setIsSubscribed(true);
				}
			}
		};

		checkSubscription();
	}, [isSubscribed]);

	useEffect(() => {
		const getNotifications = async () => {
			const notifications = await PushAPI.user.getFeeds({
				user: `eip155:5:${address}`,
				env: 'staging',
			});

			if (notifications) {
				let arr = notifications.filter((obj: any) => obj.app === 'Fluid Bets');

				if (arr.length !== notificationsArray.length) {
					setNotificationsArray(arr);
				}
			}
		};

		getNotifications();
		/* const interval = setInterval(() => {
			getNotifications();
		}, 10000);
		return () => clearInterval(interval); */
	}, [notificationsArray]);

	const subscribeToChannel = async () => {
		const subscribe = await PushAPI.channels.subscribe({
			//@ts-ignore
			signer: signer,
			channelAddress: 'eip155:5:0x85317a021541263540bFe56A665239Db71e17026',
			userAddress: `eip155:5:${profileAddress}`,
			onSuccess: () => {
				setIsSubscribed(true);
			},
			env: 'staging',
		});
	};

	const unsubscribeToChannel = async () => {
		const unsubscribe = await PushAPI.channels.unsubscribe({
			//@ts-ignore
			signer: signer,
			channelAddress: 'eip155:5:0x85317a021541263540bFe56A665239Db71e17026',
			userAddress: `eip155:5:${profileAddress}`,
			onSuccess: () => {
				setIsSubscribed(false);
			},
			env: 'staging',
		});
	};

	return (
		<>
			<Flex minH={'100vh'} flexDir="column" align="center" bgImg="url(/bg.jpg)">
				<Navbar />
				<Flex
					flexDir="column"
					bgColor="white"
					minW="60%"
					align="center"
					boxShadow="md"
					rounded="xl"
					p={14}
				>
					<Flex justify="space-between" minW="40%" align="center" mb={10}>
						<VStack>
							<Image src="/channel.jpg" rounded="2xl" />
							{isSubscribed ? (
								<Button
									onClick={() => {
										unsubscribeToChannel();
									}}
									bgColor="#09EDFE"
									_hover={{
										bgColor: '#09EDFE',
									}}
								>
									<Text fontWeight="normal">Unsubscribe</Text>
								</Button>
							) : (
								<Button
									onClick={() => {
										subscribeToChannel();
									}}
									bgColor="#09EDFE"
									_hover={{
										bgColor: '#09EDFE',
									}}
								>
									<Text fontWeight="normal">Subscribe</Text>
								</Button>
							)}
						</VStack>
						<VStack>
							<Text fontWeight="bold" fontSize="6xl">
								{balance.toFixed(0)}
							</Text>
							<Flex alignItems="center">
								<Box boxSize="20px" mr={2}>
									<Image src="/dai.png" />
								</Box>
								<Text fontSize="2xl">DAIx</Text>
							</Flex>
						</VStack>
					</Flex>
					<Text fontWeight="bold" fontSize="3xl" mb={4}>
						Notifications
					</Text>
					<Flex flexDir="column" minW="90%">
						{notificationsArray.length > 0 &&
							notificationsArray.map((item: any) => (
								<Flex flexDir="column" key={item.sid} boxShadow="md" mb={4}>
									<Text
										bgGradient="linear(to-r, #963CFF 0%, #09EDFE 100%)"
										pl={2}
										py={1}
										color="white"
										fontSize="xl"
									>
										{item.title}
									</Text>
									<Text px={2} py={4}>
										{item.message}
									</Text>
								</Flex>
							))}
					</Flex>
				</Flex>
			</Flex>
		</>
	);
}
