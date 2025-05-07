
/**
 * Invoice calculation utilities
 */

// VAT rate in Tunisia (19%)
export const VAT_RATE = 0.19;
// Stamp duty (timbre fiscal) in Tunisia
export const TIMBRE_FISCAL = 1.0;

/**
 * Calculate the price excluding tax from a price including tax
 * @param priceTTC Price including all taxes
 * @returns Price excluding VAT
 */
export const calculateHT = (priceTTC: number): number => {
  return priceTTC / (1 + VAT_RATE);
};

/**
 * Calculate the VAT amount
 * @param priceHT Price excluding tax
 * @returns VAT amount
 */
export const calculateTVA = (priceHT: number): number => {
  return priceHT * VAT_RATE;
};

/**
 * Calculate the total amount including taxes
 * @param priceHT Price excluding tax
 * @param inclTimbre Whether to include the stamp duty
 * @returns Total price including taxes
 */
export const calculateTTC = (priceHT: number, inclTimbre: boolean = true): number => {
  const tva = calculateTVA(priceHT);
  const timbre = inclTimbre ? TIMBRE_FISCAL : 0;
  return priceHT + tva + timbre;
};

/**
 * Full invoice calculation - calculates all components from TTC prices
 * @param itemsTTC Array of items with TTC prices
 * @returns Object with calculated values
 */
export const calculateInvoiceTotals = (itemsTTC: { price: number, quantity: number }[]) => {
  // Calculate total TTC before adjustments
  const rawTotalTTC = itemsTTC.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Calculate HT from TTC
  const totalHT = calculateHT(rawTotalTTC);
  
  // Calculate TVA amount
  const totalTVA = calculateTVA(totalHT);
  
  // Add timbre fiscal to final TTC
  const finalTotalTTC = totalHT + totalTVA + TIMBRE_FISCAL;
  
  return {
    subtotalHT: totalHT,
    tva: totalTVA,
    timbreFiscal: TIMBRE_FISCAL,
    totalTTC: finalTotalTTC
  };
};

/**
 * Convert item from TTC price to HT price
 * @param item Item with TTC price
 * @returns Same item with HT price
 */
export const convertItemTTCtoHT = (item: { price: number, quantity: number }) => {
  const priceHT = calculateHT(item.price);
  return {
    ...item,
    priceHT,
    totalHT: priceHT * item.quantity
  };
};
