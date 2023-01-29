import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse<any>
) {
	if (req.method === 'POST') {
		const { matchId } = req.body;
		const checkRecord = await prisma.matchPool.findFirst({
			where: {
				matchId: matchId,
			},
		});

		if (!checkRecord) {
			const matchPool = await prisma.matchPool.create({
				data: {
					matchId: matchId,
					totalAmount: 0,
				},
			});
		}
		res.status(200).json({ status: 'OK' });
	} else if (req.method === 'PUT') {
		const { data } = req.body;
		const updateRecord = await prisma.matchPool.update({
			where: {
				id: data.id,
			},
			data: {
				totalAmount: {
					increment: data.userAmount,
				},
			},
		});
		res.status(200).json({ status: 'OK' });
	} else {
		res.status(400).send('Method not allowed');
	}
}
