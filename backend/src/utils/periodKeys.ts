const todayKey = (date: Date = new Date()): string => {
	return date.toISOString().slice(0, 10);
};

const isoWeekKey = (date: Date = new Date()): string => {
	const d = new Date(
		Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
	);
	const dayNum = d.getUTCDay() || 7;
	d.setUTCDate(d.getUTCDate() + 4 - dayNum);
	const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
	const weekNum = Math.ceil(
		((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7,
	);
	return `${d.getUTCFullYear()}-W${weekNum.toString().padStart(2, "0")}`;
};

const secondsUntilNextUtcDay = (): number => {
	const now = new Date();
	const nextMidnight = new Date(
		Date.UTC(
			now.getUTCFullYear(),
			now.getUTCMonth(),
			now.getUTCDate() + 1,
			0,
			0,
			0,
		),
	);
	return Math.floor((nextMidnight.getTime() - now.getTime()) / 1000);
};

const secondsUntilNextUtcWeek = (): number => { 
    const now = new Date();
    const day = now.getUTCDay() || 7;
    const nextWeek = new Date(
        Date.UTC(
            now.getUTCFullYear(),
            now.getUTCMonth(),
            now.getUTCDate() + (8 - day),
            0,
            0,
            0
        )
    );
    return Math.floor((nextWeek.getTime() - now.getTime()) / 1000);
};

export { todayKey, isoWeekKey, secondsUntilNextUtcDay, secondsUntilNextUtcWeek };