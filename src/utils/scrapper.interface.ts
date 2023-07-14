import { ANILIBRIA_URL, ANILIBRIA_SCHEDULE, weekdays } from "../constants/constants";
import * as cheerio from 'cheerio';

export type WEB_URL = typeof ANILIBRIA_URL | typeof ANILIBRIA_SCHEDULE;
export type WeekDays = typeof weekdays[number];

export interface IAnimeDescription{
    name: string;
    series: number | string;
    description: string;
    img: string;
    link: string;
}

export interface IAnimeWeekDescription{
    day: WeekDays;
    scheduleDay: IAnimeDescription[];
}

export interface IScrapperServce{
    getPage(url: WEB_URL) : Promise<string | undefined>
    loadPage(page: Promise<string | undefined>): Promise<cheerio.CheerioAPI>
}