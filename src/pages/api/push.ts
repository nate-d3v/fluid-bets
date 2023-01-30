import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import * as PushAPI from '@pushprotocol/restapi';
import * as ethers from 'ethers';

const PKey = process.env.PRIVATE_KEY;
const signer = new ethers.Wallet(PKey!);

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse<any>
) {
	if (req.method === 'POST') {
		const { title, body } = req.body;
		const apiResponse = await PushAPI.payloads.sendNotification({
			signer,
			type: 1,
			identityType: 2,
			notification: {
				title: 'Fluid Bets',
				body: 'You received a new notification',
			},
			payload: {
				title: title,
				body: body,
				cta: '',
				img: '',
			},
			channel: 'eip155:5:0x85317a021541263540bFe56A665239Db71e17026',
			env: 'staging',
		});
		res.status(200).json({});
	} else {
		res.status(400).send('Method not allowed');
	}
}
