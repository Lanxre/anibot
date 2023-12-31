export const ANILIBRIA_URL = "https://www.anilibria.tv/";
export const ANILIBRIA_SCHEDULE = "https://www.anilibria.tv/pages/schedule.php";
export const ANILIBRIA_CATALOG = "https://www.anilibria.tv/pages/catalog.php#page-";

export const weekdays = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];
export const weekdayGenitive = ['Понедельник', 'Вторник', 'Среду', 'Четверг', 'Пятницу', 'Субботу', 'Воскресенье'];

export const shortWeekdays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

type ShortWeekDay = typeof shortWeekdays[number];

export const getTodayStrignDay = (weekday: 'short' | 'long') : string => {
    const dayName = new Date().toLocaleString('ru-RU', {  weekday: weekday })
    return dayName.charAt(0).toUpperCase() + dayName.slice(1);
}

export const getWeekDayFromShort = (weekDay: ShortWeekDay): string =>{
    const shortIndex = shortWeekdays.indexOf(weekDay);
    return weekdays[shortIndex];
}