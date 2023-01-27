import * as PushAPI from '@pushprotocol/restapi';
import { useAccount } from 'wagmi';
import { Flex, Text } from '@chakra-ui/react';
import { useEffect, useState } from 'react';

export default function Profile() {
	const { address } = useAccount();
	const [isSubscribed, setIsSubscribed] = useState(false);
	const [profileAddress, setProfileAddress] = useState('');
	const [notificationsArray, setNotificationsArray] = useState([]);

	useEffect(() => {
		setProfileAddress(address!);
	}, []);

	useEffect(() => {
		const checkSubscription = async () => {
			const subscriptions = await PushAPI.user.getSubscriptions({
				user: `eip155:5:${address}`,
				env: 'staging',
			});

			let arr = subscriptions
				.map((obj: any) => obj.channel)
				.includes('0x85317a021541263540bfe56a665239db71e17026');

			if (arr) {
				setIsSubscribed(true);
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

			let arr = notifications.filter((obj: any) => obj.app === 'Fluid Bets');

			if (arr.length > 0) {
				setNotificationsArray(arr);
			}
		};

		getNotifications();
	}, [notificationsArray]);

	return (
		<>
			<Flex flexDir="column">
				<Text>{profileAddress}</Text>
				<Text>{isSubscribed ? 'Subscribed' : 'Not Subscribed'}</Text>
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
