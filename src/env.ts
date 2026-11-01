import { defineEnvVars } from '@sveltejs/kit/env';

// Optional on purpose: without them the site still runs and the admin login just refuses every password
export const variables = defineEnvVars({
	ADMIN_PASSWORD: {
		schema: (value) => value,
		description: 'Shared password for the /admin area'
	},
	ADMIN_SESSION_SECRET: {
		schema: (value) => value,
		description: 'Secret for signing the admin session cookie'
	}
});
