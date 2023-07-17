import axios, { AxiosError } from "axios";
import * as cheerio from 'cheerio';
import { IAnimeDescription, IAnimeDetails, IAnimeType, IAnimeWeekDescription, IScrapperServce, WEB_URL } from "./scrapper.interface";
import { ANILIBRIA_SCHEDULE, ANILIBRIA_URL, getTodayStrignDay, weekdays } from "../constants/constants";
import { regexFind } from "./regex.util";

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

    async getScheduleWeek(url: WEB_URL) : Promise<IAnimeWeekDescription[]>{
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
                const seriesMatch = $($descriptions).find('span.schedule-series').text().match(/\d+$/)
                const animeSeries = seriesMatch ? parseInt(seriesMatch[0]) : 1 ;
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

    async getScheduleDay(url: WEB_URL, weekDay?: string): Promise<IAnimeWeekDescription>{
        const schedules: IAnimeWeekDescription = {
            day: weekDay || getTodayStrignDay('long'),
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
            const seriesMatch = $($descriptions).find('span.schedule-series').text().match(/\d+$/)
            const animeSeries = seriesMatch ? parseInt(seriesMatch[0]) : 1 ;
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

    async parseAnimePage(url: WEB_URL): Promise<IAnimeDetails> {
        const page = this.getPage(url);
        const $ = await this.loadPage(page);
        const animeDescription = $('#xreleaseInfo').text();
        const animeDateText = $('#publicTorrentTable').find('td').eq(2).attr('data-datetime');
        const animeDate = animeDateText ? new Date(animeDateText) : new Date();
        const animeType = this.findAnimeType(animeDescription);

        return {
            detailType: animeType,
            date: animeDate
        } satisfies IAnimeDetails;
    }

    private findAnimeType(text: string){
        const animeRegex = regexFind(text, new RegExp(`Тип:([^\n]*)`));
        const animeType = animeRegex.split(' ')[0];
        const animeTime = regexFind(animeRegex, /(\d+\s*мин)/);
        const animeCount = regexFind(animeRegex,  /(\d+\s*эп.)/)

        return {
            type: animeType.replace(',', ''),
            count: animeCount == animeRegex ? 'no info' : animeCount ,
            time: animeTime == animeRegex ? 'no info' : animeTime ,
        } as IAnimeType
    }

    getFullLink(url: WEB_URL, animeLink: string): string {
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
    
    test(){
        return '123'
    }
}
