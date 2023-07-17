export function getTimeDiffString(previousDate: Date): string {
    const currentDate = new Date();
    const diffInMilliseconds = currentDate.getTime() - previousDate.getTime();
    const diffInSeconds = Math.floor(diffInMilliseconds / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);
    const diffInMonths = Math.floor(diffInDays / 30);
    const diffInWeeks = Math.floor(diffInDays / 7);
    
    if (diffInMonths > 0) {
      return `вышла ${diffInMonths} месяцев, ${diffInWeeks % 4} недель назад`;
    } else if (diffInWeeks > 0) {
      return diffInWeeks >= 5 ? `вышла ${diffInWeeks} недель, ${diffInDays % 7} дней назад` : `вышла ${diffInWeeks} недели, ${diffInDays % 7} дней назад`;
    } else if (diffInDays > 0) {
      return  diffInDays >= 5 ? `вышла ${diffInDays} дней, ${diffInHours % 24} часов назад` : `вышла ${diffInDays} дня, ${diffInHours % 24} часов назад`;
    } else {
      return `вышла ${diffInHours} часов, ${diffInMinutes % 60} минут назад`;
    }
}