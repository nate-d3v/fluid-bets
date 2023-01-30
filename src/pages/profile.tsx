import * as PushAPI from '@pushprotocol/restapi';
import { useAccount, useSigner } from 'wagmi';
import { Flex, Text, Button } from '@chakra-ui/react';
import { useEffect, useState } from 'react';

export default function Profile() {
	const { address } = useAccount();
	const { data: signer } = useSigner();
	const [isSubscribed, setIsSubscribed] = useState(false);
	const [profileAddress, setProfileAddress] = useState('');
	const [notificationsArray, setNotificationsArray] = useState([]);
	const [subscriptionsArray, setSubscriptionsArray] = useState<string[]>([]);

	useEffect(() => {
		setProfileAddress(address!);
	}, []);

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
		const interval = setInterval(() => {
			getNotifications();
		}, 10000);
		return () => clearInterval(interval);
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
			<Flex flexDir="column">
				<Text>
					{isSubscribed ? (
						<Button
							onClick={() => {
								unsubscribeToChannel();
							}}
						>
							Unsubscribe
						</Button>
					) : (
						<Button
							onClick={() => {
								subscribeToChannel();
							}}
						>
							Subscribe
						</Button>
					)}
				</Text>
				{notificationsArray.length > 0 &&
					notificationsArray.map((item: any) => (
						<Flex flexDir="column" key={item.sid}>
							<Text>{item.title}</Text>
							<Text>{item.message}</Text>
						</Flex>
					))}
			</Flex>
		</>
	);
}
