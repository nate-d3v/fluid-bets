import * as PushAPI from '@pushprotocol/restapi';
import { useAccount } from 'wagmi';
import { Flex, Text } from '@chakra-ui/react';
import { useEffect, useState } from 'react';

export default function Profile() {
	const { address } = useAccount();
	const [isSubscribed, setIsSubscribed] = useState(false);

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
	}, [address]);

	return (
		<>
			<Flex flexDir="column">
				<Text>{address}</Text>
				<Text>{isSubscribed ? 'Subscribed' : 'Not Subscribed'}</Text>
			</Flex>
		</>
	);
}
