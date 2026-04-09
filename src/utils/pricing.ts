import type { PricingRule, Unit } from '../types';

/**
 * Calculates the total price for a stay based on base price and dynamic pricing rules.
 */
export function calculateStayPrice(
    unit: Unit,
    checkIn: string,
    checkOut: string,
    rules: PricingRule[]
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

        // Sort rules by priority: SPECIFIC_DATE > SEASONAL > WEEKEND
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

        nights.push({ date: dateStr, price: activePrice, ruleLabel: activeRuleLabel });
        totalPrice += activePrice;

        current.setDate(current.getDate() + 1);
    }

    return { total: totalPrice, breakdown: nights };
}
