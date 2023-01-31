import type { NextApiRequest, NextApiResponse } from 'next';
import * as PushAPI from '@pushprotocol/restapi';
import * as ethers from 'ethers';

const PKey = process.env.PRIVATE_KEY;
const signer = new ethers.Wallet(PKey!);

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse<any>
) {
	if (req.method === 'POST') {
		const { action } = req.query;
		const { data } = req.body;

		switch (action) {
			case 'broadcast':
				const broadcastRes = await PushAPI.payloads.sendNotification({
					signer,
					type: 1,
					identityType: 2,
					notification: {
						title: 'Fluid Bets',
						body: 'You received a new notification',
					},
					payload: {
						title: data.title,
						body: data.body,
						cta: '',
						img: '',
					},
					channel: 'eip155:5:0x85317a021541263540bFe56A665239Db71e17026',
					env: 'staging',
				});
				res.status(200).json({});
				break;
			case 'subset':
				const subsetResponse = await PushAPI.payloads.sendNotification({
					signer,
					type: 4,
					identityType: 2,
					notification: {
						title: 'Fluid Bets',
						body: 'You received a new notification',
					},
					payload: {
						title: data.title,
						body: data.body,
						cta: '',
						img: '',
					},
					recipients: data.array,
					channel: 'eip155:5:0x85317a021541263540bFe56A665239Db71e17026',
					env: 'staging',
				});
				res.status(200).json({});
				break;
		}
	} else {
		res.status(400).send('Method not allowed');
	}
}
