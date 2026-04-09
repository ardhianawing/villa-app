import type { PricingRule, Unit, DailyPriceOverride } from '../types';

/**
 * Calculates the total price for a stay based on base price and dynamic pricing rules.
 */
export function calculateStayPrice(
    unit: Unit,
    checkIn: string,
    checkOut: string,
    rules: PricingRule[],
    overrides: DailyPriceOverride[] = []
): { total: number; breakdown: { date: string; price: number; ruleLabel?: string }[] } {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const nights: { date: string; price: number; ruleLabel?: string }[] = [];
    let totalPrice = 0;

    // Loop through each night (check-out date is not included in the stay)
    const current = new Date(start);
    while (current < end) {
        const dateStr = current.toISOString().split('T')[0];
        const dayOfWeek = current.getDay();

        let activePrice = unit.pricePerNight;
        let activeRuleLabel: string | undefined = undefined;

        // 1. Check for manual overrides FIRST (Highest Priority)
        const override = overrides.find(o => o.unitId === unit.id && o.date === dateStr);
        if (override) {
            activePrice = override.price;
            activeRuleLabel = 'Manual Override';
        } else {
            // 2. Sort rules by priority: SPECIFIC_DATE > SEASONAL > WEEKEND
            const sortedRules = [...rules].filter(r => r.active).sort((a, b) => {
                const priority = { 'SPECIFIC_DATE': 0, 'SEASONAL': 1, 'WEEKEND': 2 };
                return priority[a.type] - priority[b.type];
            });

        for (const rule of sortedRules) {
            let matches = false;

            if (rule.type === 'WEEKEND' && rule.daysOfWeek?.includes(dayOfWeek)) {
                matches = true;
            } else if (rule.type === 'SPECIFIC_DATE' && rule.startDate === dateStr) {
                matches = true;
            } else if (rule.type === 'SEASONAL' && rule.startDate && rule.endDate) {
                if (dateStr >= rule.startDate && dateStr <= rule.endDate) {
                    matches = true;
                }
            }

            if (matches) {
                if (rule.adjustmentType === 'PERCENTAGE') {
                    activePrice = unit.pricePerNight * (1 + rule.adjustmentValue / 100);
                } else {
                    activePrice = unit.pricePerNight + rule.adjustmentValue;
                }
                activeRuleLabel = rule.label;
                break; // Use the first matching rule (highest priority)
            }
        }
    } // End of else block

        nights.push({ date: dateStr, price: activePrice, ruleLabel: activeRuleLabel });
        totalPrice += activePrice;

        current.setDate(current.getDate() + 1);
    }

    return { total: totalPrice, breakdown: nights };
}
