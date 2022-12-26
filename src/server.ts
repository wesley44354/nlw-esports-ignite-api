import { PrismaClient } from '@prisma/client';
import express, { json } from "express";
import cors from 'cors'
import { convertHourStringToMinutes } from './utils/convert-hour-string-to-minutes';
import { convertMinutesToHourString } from './utils/convert-minutes-to-hour-string';

const app = express()

app.use(express.json())
app.use(cors())

const prisma = new PrismaClient()

app.get('/games', async(request, response) =>{
    const games = await prisma.game.findMany({
        include: {
            _count: {
                select: {
                    ads: true,
                }
            }
        }
    });
    return response.json(games);
});

app.post('/games/:id/ads', async(request, response) =>{
    const gameId = request.params.id;
    const body: any = request.body;

    const ad = await prisma.ad.create({
        data: {
            gameId,
            name: body.name,
            weekDays: body.weekDays.join(','),
            hourEnd: convertHourStringToMinutes(body.hourEnd),
            hourStart: convertHourStringToMinutes(body.hourStart),
            discord: body.discord,
            useVoiceChannel: body.useVoiceChannel,
            yearsPlaying: body.yearsPlaying
        }
    })

    return response.status(201).json(ad);
});

app.get('/games/:id/ads', async (request, response) => {
    const gameId = request.params.id;

    const ads = await prisma.ad.findMany({
        select:{
            id: true,
            name: true,
            weekDays: true,
            hourEnd: true,
            hourStart: true,
            useVoiceChannel: true,
            yearsPlaying: true
        },
        where: {
            gameId,
        },
        orderBy: {
            createdAt: 'desc',
        }
    })

     return response.json(ads.map(ad => {
        return{
            ...ad,
            weekDays: ad.weekDays.split(','),
            hourEnd: convertMinutesToHourString(ad.hourEnd),
            hourStart: convertMinutesToHourString(ad.hourStart)
        }
     }))
})

app.get('/ads/:id/discord', async (request, response) => {
    const adID = request.params.id;

    const ad = await prisma.ad.findFirstOrThrow({

        select: {
            discord: true,
        },
        where: {
            id: adID,
        }
    })

    return response.json({
        discord: ad
    })
})

app.listen("3333")