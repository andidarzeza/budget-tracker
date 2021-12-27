export enum MonthValue {
    January = 0,
    February = 1,
    March = 2,
    April = 3,
    May = 4,
    June = 5,
    July = 6,
    August = 7,
    September = 8,
    October = 9,
    November = 10,
    December = 11
}

export enum WeekValue {
    Monday = 0,
    Tuesday = 1,
    Wednesday = 2,
    Thursday = 3,
    Friday = 4,
    Satturday = 5,
    Sunday = 6
}

export class Day {
    private dayNumber: number;
    private dayOfWeek: WeekValue;

    constructor(dayNumber: number, dayOfWeek: WeekValue) {
        this.dayNumber = dayNumber;
        this.dayOfWeek = dayOfWeek
    }

    public getDayNumber(): number {
        return this.dayNumber;
    }

    public getDayOfWeek(): WeekValue {
        return this.dayOfWeek;
    }
}

export class Month {
    private days: Day[] = [];
    private month: MonthValue = MonthValue.January;
    private year = 1970;
    constructor(month: MonthValue, year: number) {
        this.month = month;
        this.year = year;
        this._getDaysInMonth();
    }

    public getDaysOfMonth(): Day[] {
        return this.days
    }

    public getMonth(): MonthValue {
        return this.month;
    }

    public getYear(): number {
        return this.year;
    }

    private _getDaysInMonth(): Day[] {
        const date = new Date(this.year, this.month, 1);
        while (date.getMonth() === this.month) {
            const date2 = new Date(date);
            this.days.push(new Day(date2.getDate(), date2.getDay()));
            date.setDate(date.getDate() + 1);
        }
        return this.days;
      }
}

export class Year {
    private year = 1100;
    private months: Month[] = [];

    constructor(year: number) {
        if(year >=1100) {
            this.year = year;
            this.populateMonths();
        }
    }

    public getYearMonths(): Month[] {
        return this.months;
    }

    public getYear(): number {
        return this.year;
    }

    public getMonthByValue(monthValue: MonthValue): Month {
        return this.months.filter(month => month.getMonth() === monthValue)[0];
    }

    private populateMonths(): void {
        this.months = [
            new Month(MonthValue.January, this.year),
            new Month(MonthValue.February, this.year),
            new Month(MonthValue.March, this.year),
            new Month(MonthValue.April, this.year),
            new Month(MonthValue.May, this.year),
            new Month(MonthValue.June, this.year),
            new Month(MonthValue.July, this.year),
            new Month(MonthValue.August, this.year),
            new Month(MonthValue.September, this.year),
            new Month(MonthValue.October, this.year),
            new Month(MonthValue.November, this.year),
            new Month(MonthValue.December, this.year)
        ];
    }

}

export class DateUtil {
    public start(): void {
        const year = new Year(1998);
        console.log(year.getMonthByValue(MonthValue.November).getDaysOfMonth());
        
    }

    public fromYear(year: number): Year {
        return new Year(year);
    }
}