import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse<any>
) {
	if (req.method === 'POST') {
		const { matchId, indexId } = req.body;
		const checkRecord = await prisma.matchPool.findFirst({
			where: {
				matchId: matchId,
			},
		});

		if (!checkRecord) {
			const createPool = await prisma.matchPool.create({
				data: {
					matchId: matchId,
					indexId: indexId,
					totalAmount: 0,
					homeTeam: [],
					awayTeam: [],
				},
			});
		}
		res.status(200).json({});
	} else if (req.method === 'PUT') {
		const { data } = req.body;
		const getJson = await prisma.matchPool.findFirst({
			where: {
				id: data.id,
			},
		});
		const homeTeam = getJson?.homeTeam as Prisma.JsonArray;
		const awayTeam = getJson?.awayTeam as Prisma.JsonArray;

		const addressArray = homeTeam
			.map((item: any) => item[0])
			.concat(awayTeam.map((item: any) => item[0]));

		if (!addressArray.includes(data.userAddress)) {
			if (data.team === 'homeTeam') {
				homeTeam.push([data.userAddress, data.userAmount]);
				const updateHomeTeam = await prisma.matchPool.update({
					where: {
						id: data.id,
					},
					data: {
						homeTeam: homeTeam,
					},
				});
			} else if (data.team === 'awayTeam') {
				awayTeam.push([data.userAddress, data.userAmount]);
				const updateAwayTeam = await prisma.matchPool.update({
					where: {
						id: data.id,
					},
					data: {
						awayTeam: awayTeam,
					},
				});
			}
		}
		res.status(200).json({});
	} else {
		res.status(400).send('Method not allowed');
	}
}
