import type { SubmitFunction } from '$app/forms';

export type SaveStatus = 'idle' | 'saving' | 'saved';

const SAVED_MS = 2500;

// Tracks a form's save for SaveButton: "saving" while the request runs, "saved" for a moment after success.
// Only a submit from a SaveButton counts, so other buttons in the same form (move, delete) show nothing.
// Forms in a list share one tracker and tell themselves apart with data-save-key; read it with statusOf(key)
export function saveStatus() {
	let status = $state<SaveStatus>('idle');
	let key = $state<string | undefined>();
	let timer: ReturnType<typeof setTimeout> | undefined;

	const submit: SubmitFunction = ({ formElement, submitter }) => {
		if (!(submitter instanceof HTMLElement) || !('saveButton' in submitter.dataset)) return;

		clearTimeout(timer);
		key = formElement.dataset.saveKey;
		status = 'saving';

		return async ({ result, update }) => {
			await update();

			if (result.type === 'success') {
				status = 'saved';
				timer = setTimeout(() => (status = 'idle'), SAVED_MS);
			} else status = 'idle';
		};
	};

	return {
		get status() {
			return status;
		},
		statusOf(formKey: string | number): SaveStatus {
			return key === String(formKey) ? status : 'idle';
		},
		submit
	};
}
