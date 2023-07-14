import axios, { AxiosError } from "axios";
import * as cheerio from 'cheerio';
import { IAnimeDescription, IAnimeWeekDescription, IScrapperServce, WEB_URL } from "./scrapper.interface";
import { ANILIBRIA_SCHEDULE, ANILIBRIA_URL, getTodayStrignDay, weekdays } from "../constants/constants";

export class WebScrapper implements IScrapperServce{

    getPage(url: WEB_URL): Promise<string | undefined> {
        const HTMLData = axios
        .get(url)
        .then(res => res.data)
        .catch((error: AxiosError) => {
          console.error(error.toJSON());
        });
    
      return HTMLData;
    }

    async loadPage(page: Promise<string | undefined>): Promise<cheerio.CheerioAPI>{
        const resolvedPage = await page;
        if (resolvedPage) {
          return cheerio.load(resolvedPage);
        }
        throw new Error('Failed to load page');
      
    }

    async getScheduleWeek(url: WEB_URL){
        const weekdaysGenerator = this.generateWeekdays();
        const schedules: IAnimeWeekDescription[] = [];
        const page = this.getPage(url);
        const $ = await this.loadPage(page);
        const $selected = $('table.test');
        for(const $tabel of $selected){
            const $a = $($tabel).find('td.goodcell').find('a');
            const scheduleDay: IAnimeDescription[] = [];

            for(const $link of $a){
                const $descriptions = $($link).find('div.schedule-anime-desc');
                const $image = $($link).find('img');

                const animeName = String($($descriptions).find('span.schedule-runame').text());
                const animeSeries = Number($($descriptions).find('span.schedule-series').text().split(' ')[1].split('-')[1]);
                const animeDescription = String($($descriptions).find('span.schedule-description').text());
                const animeImage = String($($image).attr('src'));
                const animeLink = String($($link).attr('href'));


                scheduleDay.push({
                    link: this.getFullLink(url, animeLink),
                    name: animeName,
                    series: isNaN(animeSeries) ? $($descriptions).find('span.schedule-series').text() : animeSeries,
                    description: animeDescription,
                    img: animeImage
                })
            }
            schedules.push({
                day: weekdaysGenerator.next().value,
                scheduleDay: scheduleDay
            })
        }

        return schedules;
    }

    async getScheduleDay(url: WEB_URL){
        const schedules: IAnimeWeekDescription = {
            day: getTodayStrignDay('long'),
            scheduleDay: []
        }
        const page = this.getPage(url);
        const $ = await this.loadPage(page);
        const $selected = $('table.test');
        const numToday = weekdays.indexOf(schedules.day);
        const todaySchedule = $selected[numToday];
        const $a = $(todaySchedule).find('td.goodcell').find('a');
        const scheduleDay: IAnimeDescription[] = [];

        for(const $link of $a){
            const $descriptions = $($link).find('div.schedule-anime-desc');
            const $image = $($link).find('img');

            const animeName = String($($descriptions).find('span.schedule-runame').text());
            const animeSeries = Number($($descriptions).find('span.schedule-series').text().split(' ')[1].split('-')[1]);
            const animeDescription = String($($descriptions).find('span.schedule-description').text());
            const animeImage = String($($image).attr('src'));
            const animeLink = String($($link).attr('href'));


            scheduleDay.push({
                link: this.getFullLink(url, animeLink),
                name: animeName,
                series: isNaN(animeSeries) ? $($descriptions).find('span.schedule-series').text() : animeSeries,
                description: animeDescription,
                img: this.getFullLink(url, animeImage.slice(1)),
            })
        }

        schedules.scheduleDay = scheduleDay;
        return schedules;
    }

    getFullLink(url: WEB_URL, animeLink: string): string{
        switch(url){
            case ANILIBRIA_SCHEDULE:
                return ANILIBRIA_URL + animeLink
            default:
                return url
        }
    }

    *generateWeekdays() : Generator<string> {
        for (let i = 0; i < weekdays.length; i++) {
            yield weekdays[i];
        }
    }
    
}
