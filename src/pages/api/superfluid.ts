import type { NextApiRequest, NextApiResponse } from 'next';
import { Framework } from '@superfluid-finance/sdk-core';
import { ethers } from 'ethers';

const apiKeyAlchemy = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;
const PKey = process.env.PRIVATE_KEY;
const provider = new ethers.providers.AlchemyProvider('goerli', apiKeyAlchemy);

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse<any>
) {
	if (req.method === 'POST') {
		const { action } = req.query;
		const { data } = req.body;

		const sf = await Framework.create({
			chainId: 5,
			provider,
		});
		const signer = sf.createSigner({ privateKey: PKey, provider: provider });
		const daix = await sf.loadSuperToken(
			'0xF2d68898557cCb2Cf4C10c3Ef2B034b2a69DAD00'
		);

		switch (action) {
			case 'createIndex':
				const id = Math.floor(Math.random() * 1000000000).toString();
				const createIndexOperation = daix.createIndex({
					indexId: id,
				});
				const createIndexResponse = await createIndexOperation.exec(signer);
				const createIndexReceipt = await createIndexResponse.wait();

				res.status(200).json({ index: id });
				break;
			case 'updateSubscription':
				for (const item of data.array) {
					const updateSubscriptionOperation = daix.updateSubscriptionUnits({
						indexId: data.indexId,
						subscriber: item[0],
						units: item[1],
					});
					const updateSubscriptionResponse =
						await updateSubscriptionOperation.exec(signer);
					const updateSubscriptionReceipt =
						await updateSubscriptionResponse.wait();
				}

				res.status(200).json({});
				break;
			case 'distributeFunds':
				const distributeOperation = daix.distribute({
					indexId: data.indexId,
					amount: data.totalAmount.toString(),
				});

				const distributeOperationResponse = await distributeOperation.exec(
					signer
				);
				const distributeOperationReceipt =
					await distributeOperationResponse.wait();

				res.status(200).json({});
				break;
			default:
				res.status(500).send('Wrong action');
		}
	} else {
		res.status(400).send('Method not allowed');
	}
}
