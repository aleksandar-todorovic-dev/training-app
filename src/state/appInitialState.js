/**
 * Initial runtime state for the local-first MVP.
 *
 * Runtime note:
 * Progress is created lazily per plan. The app does not pre-create workout
 * logs for Bulk Pro or Cut Pro before the user starts using a plan.
 */
export const appInitialState = {
  selectedPlanId: null,
  progressByPlan: {},
};
