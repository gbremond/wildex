import type { Component } from 'svelte';
import ShieldCheckIcon from '@lucide/svelte/icons/shield-check';
import EyeIcon from '@lucide/svelte/icons/eye';
import TriangleAlertIcon from '@lucide/svelte/icons/triangle-alert';
import ShieldAlertIcon from '@lucide/svelte/icons/shield-alert';
import SirenIcon from '@lucide/svelte/icons/siren';
import GhostIcon from '@lucide/svelte/icons/ghost';
import SkullIcon from '@lucide/svelte/icons/skull';
import CircleQuestionMarkIcon from '@lucide/svelte/icons/circle-question-mark';
import type { BadgeVariant } from '$lib/components/ui/badge';
import type { IucnCategory } from './species.model';

const VARIANT_BY_CATEGORY: Record<IucnCategory, BadgeVariant> = {
	LEAST_CONCERN: 'success',
	NEAR_THREATENED: 'success',
	VULNERABLE: 'warning',
	ENDANGERED: 'warning',
	CRITICALLY_ENDANGERED: 'destructive',
	EXTINCT_IN_THE_WILD: 'destructive',
	EXTINCT: 'destructive',
	DATA_DEFICIENT: 'secondary'
};

// Distinct per category, not per variant: success/warning collapse under
// protanopia simulation, so color alone can't carry the severity distinction.
const ICON_BY_CATEGORY: Record<IucnCategory, Component> = {
	LEAST_CONCERN: ShieldCheckIcon,
	NEAR_THREATENED: EyeIcon,
	VULNERABLE: TriangleAlertIcon,
	ENDANGERED: ShieldAlertIcon,
	CRITICALLY_ENDANGERED: SirenIcon,
	EXTINCT_IN_THE_WILD: GhostIcon,
	EXTINCT: SkullIcon,
	DATA_DEFICIENT: CircleQuestionMarkIcon
};

export function iucnBadgeVariant(category: IucnCategory): BadgeVariant {
	return VARIANT_BY_CATEGORY[category];
}

export function iucnIcon(category: IucnCategory): Component {
	return ICON_BY_CATEGORY[category];
}
