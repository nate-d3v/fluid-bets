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
				},
			});
		}
		res.status(200).json({ status: 'OK' });
	} else {
		res.status(400).send('Method not allowed');
	}
}
