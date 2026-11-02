import { getDayKey } from '../dateUtils';

type HeroCtaEdition = {
	eventDate: Date;
	isCurrent: boolean;
	registrationOpen: boolean;
	resultsUrl: string | null;
};

type HeroCta = { label: string; href: string };

// Registration belongs to the current edition only; older editions never show it
// Registration stays open through the event day; results link from the next day on
export function getHeroCta(edition: HeroCtaEdition, now: Date): HeroCta | null {
	if (getDayKey(now) > getDayKey(edition.eventDate)) {
		return edition.resultsUrl ? { label: 'Výsledky', href: edition.resultsUrl } : null;
	}

	return edition.isCurrent && edition.registrationOpen
		? { label: 'Registrovať sa', href: '/registracia' }
		: null;
}
