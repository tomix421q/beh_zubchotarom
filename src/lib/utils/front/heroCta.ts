import { getDayKey } from '../dateUtils';

type HeroCtaEdition = {
	eventDate: Date;
	registrationOpen: boolean;
	resultsUrl: string | null;
};

type HeroCta = { label: string; href: string };

// Registration stays open through the event day; results link from the next day on
export function getHeroCta(edition: HeroCtaEdition, now: Date): HeroCta | null {
	if (getDayKey(now) > getDayKey(edition.eventDate)) {
		return edition.resultsUrl ? { label: 'Výsledky', href: edition.resultsUrl } : null;
	}

	return edition.registrationOpen ? { label: 'Registrovať sa', href: '/registracia' } : null;
}
