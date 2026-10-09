// Ingredient Density & Pure Metric Conversion Engine

interface IngredientDensityMap {
  keywords: string[];
  type: 'liquid' | 'solid';
  gramsPerCup: number; // For solids
  mlPerCup?: number;   // For liquids (default 240ml)
}

const INGREDIENT_DENSITIES: IngredientDensityMap[] = [
  // Liquids (1 cup = 240ml)
  {
    keywords: ['water', 'milk', 'cream', 'heavy cream', 'whipping cream', 'buttermilk', 'half and half'],
    type: 'liquid',
    gramsPerCup: 240,
    mlPerCup: 240
  },
  {
    keywords: ['oil', 'olive oil', 'vegetable oil', 'canola oil', 'coconut oil', 'sunflower oil', 'sesame oil'],
    type: 'liquid',
    gramsPerCup: 218,
    mlPerCup: 240
  },
  {
    keywords: ['sauce', 'tomato sauce', 'pizza sauce', 'marinara', 'broth', 'stock', 'vinegar', 'wine', 'juice'],
    type: 'liquid',
    gramsPerCup: 240,
    mlPerCup: 250
  },
  {
    keywords: ['honey', 'maple syrup', 'syrup', 'molasses', 'corn syrup'],
    type: 'liquid',
    gramsPerCup: 340,
    mlPerCup: 240
  },

  // Flours & Powders
  {
    keywords: ['flour', 'all-purpose flour', 'bread flour', 'whole wheat flour', 'cake flour', 'tipo 00', 'baking flour'],
    type: 'solid',
    gramsPerCup: 125
  },
  {
    keywords: ['cocoa powder', 'cacao powder'],
    type: 'solid',
    gramsPerCup: 100
  },
  {
    keywords: ['powdered sugar', 'confectioners sugar', 'icing sugar'],
    type: 'solid',
    gramsPerCup: 120
  },
  {
    keywords: ['cornstarch', 'tapioca starch', 'arrowroot'],
    type: 'solid',
    gramsPerCup: 128
  },

  // Sugars & Sweeteners
  {
    keywords: ['granulated sugar', 'white sugar', 'sugar', 'caster sugar'],
    type: 'solid',
    gramsPerCup: 200
  },
  {
    keywords: ['brown sugar', 'light brown sugar', 'dark brown sugar'],
    type: 'solid',
    gramsPerCup: 220
  },

  // Fats & Dairy (Solids)
  {
    keywords: ['butter', 'unsalted butter', 'salted butter', 'margarine', 'shortening', 'ghee'],
    type: 'solid',
    gramsPerCup: 227 // 2 sticks
  },
  {
    keywords: ['greek yogurt', 'yogurt', 'sour cream', 'ricotta', 'mascarpone'],
    type: 'solid',
    gramsPerCup: 240
  },
  {
    keywords: ['mozzarella', 'cheddar', 'parmesan', 'shredded cheese', 'cheese', 'parmigiano-reggiano', 'gouda', 'swiss'],
    type: 'solid',
    gramsPerCup: 115
  },

  // Grains, Oats & Nuts
  {
    keywords: ['oats', 'rolled oats', 'quick oats'],
    type: 'solid',
    gramsPerCup: 90
  },
  {
    keywords: ['rice', 'white rice', 'brown rice', 'arborio rice', 'quinoa', 'breadcrumbs', 'panko'],
    type: 'solid',
    gramsPerCup: 185
  },
  {
    keywords: ['walnuts', 'pecans', 'almonds', 'cashews', 'peanuts', 'chopped nuts', 'hazelnuts'],
    type: 'solid',
    gramsPerCup: 120
  },
  {
    keywords: ['chocolate chips', 'chocolate morsels', 'chocolate'],
    type: 'solid',
    gramsPerCup: 170
  },

  // Produce & Berries
  {
    keywords: ['blueberries', 'strawberries', 'raspberries', 'blackberries', 'berries'],
    type: 'solid',
    gramsPerCup: 150
  },
  {
    keywords: ['mushrooms', 'wild mushrooms', 'cremini'],
    type: 'solid',
    gramsPerCup: 90
  }
];

export interface ConvertedQuantity {
  amount: number;
  unit: string;
  originalText?: string;
}

// Convert Fahrenheit to Celsius in any text string
export function convertFahrenheitToCelsiusInText(text: string): string {
  if (!text) return '';
  // 1. Replace "475°F (246°C)" or "110°F/43°C" with "246°C" / "43°C"
  let cleaned = text.replace(/(\d+)\s*°?\s*F\s*[\/\(]\s*(\d+)\s*°?\s*C\)?/gi, '$2°C');

  // 2. Replace standalone "475°F" with "246°C"
  cleaned = cleaned.replace(/(\d+)\s*°\s*F\b/gi, (_, fStr) => {
    const f = parseInt(fStr, 10);
    const c = Math.round((f - 32) * 5 / 9);
    return `${c}°C`;
  });

  return cleaned;
}

// Automatic Cup / Imperial to Metric conversion based on ingredient name
export function convertCupToMetric(amount: number, unit: string, ingredientName: string): ConvertedQuantity {
  if (!amount || !unit) return { amount, unit };
  const u = unit.toLowerCase().trim();
  const name = ingredientName.toLowerCase().trim();

  // Only convert cup / cups / tbsp / tsp / oz / lbs
  if (!['cup', 'cups', 'tbsp', 'tablespoon', 'tablespoons', 'tsp', 'teaspoon', 'teaspoons', 'oz', 'ounce', 'ounces', 'lb', 'lbs', 'pound', 'pounds'].includes(u)) {
    return { amount, unit };
  }

  // Find matching ingredient density mapping
  const foundMap = INGREDIENT_DENSITIES.find(entry =>
    entry.keywords.some(kw => name.includes(kw))
  );

  // 1. Handling Cups
  if (u === 'cup' || u === 'cups') {
    if (foundMap) {
      if (foundMap.type === 'liquid') {
        const mlPerCup = foundMap.mlPerCup || 240;
        return {
          amount: Math.round(amount * mlPerCup),
          unit: 'ml'
        };
      } else {
        return {
          amount: Math.round(amount * foundMap.gramsPerCup),
          unit: 'g'
        };
      }
    }

    const isLiquid = /water|milk|cream|oil|sauce|juice|vinegar|broth|syrup|honey|liquid/i.test(name);
    if (isLiquid) {
      return { amount: Math.round(amount * 240), unit: 'ml' };
    } else {
      return { amount: Math.round(amount * 150), unit: 'g' };
    }
  }

  // 2. Handling Tablespoons (1 tbsp = 15ml, or 1/16 cup in grams)
  if (u === 'tbsp' || u === 'tablespoon' || u === 'tablespoons') {
    if (foundMap) {
      if (foundMap.type === 'liquid') {
        return { amount: Math.round(amount * 15), unit: 'ml' };
      } else {
        const gramsPerTbsp = foundMap.gramsPerCup / 16;
        const totalGrams = amount * gramsPerTbsp;
        return { amount: Math.round(totalGrams), unit: 'g' };
      }
    }
    const isLiquid = /water|milk|cream|oil|sauce|juice|vinegar|broth|syrup|honey/i.test(name);
    return isLiquid
      ? { amount: Math.round(amount * 15), unit: 'ml' }
      : { amount: Math.round(amount * 15), unit: 'g' };
  }

  // 3. Handling Teaspoons (1 tsp = 5ml, or 1/48 cup in grams)
  if (u === 'tsp' || u === 'teaspoon' || u === 'teaspoons') {
    if (foundMap && foundMap.type === 'solid') {
      const gramsPerTsp = foundMap.gramsPerCup / 48;
      return { amount: Math.round(amount * gramsPerTsp) || 5, unit: 'g' };
    }
    return { amount: Math.round(amount * 5), unit: 'ml' };
  }

  // 4. Handling Ounces & Pounds
  if (u === 'oz' || u === 'ounce' || u === 'ounces') {
    const isLiquid = /water|milk|cream|oil|sauce|juice|vinegar|broth|syrup|fl oz/i.test(name);
    return isLiquid
      ? { amount: Math.round(amount * 29.57), unit: 'ml' }
      : { amount: Math.round(amount * 28.35), unit: 'g' };
  }

  if (u === 'lb' || u === 'lbs' || u === 'pound' || u === 'pounds') {
    return { amount: Math.round(amount * 453.59), unit: 'g' };
  }

  return { amount, unit };
}

// Clean raw ingredient line to produce 100% PURE METRIC ingredient structure
// Remove (possibly nested) parentheticals and return what was inside them.
function extractParentheticals(text: string): { text: string; inner: string[] } {
  const inner: string[] = [];
  let out = text;
  while (/\([^()]*\)/.test(out)) {
    out = out.replace(/\(([^()]*)\)/g, (_, content) => {
      if (content.trim()) inner.unshift(content.trim());
      return '';
    });
  }
  return { text: out.replace(/[()]/g, '').replace(/\s+/g, ' ').trim(), inner };
}

export function parsePureMetricIngredient(rawLine: string): { amount: number; unit: string; name: string; notes?: string } {
  let line = convertFahrenheitToCelsiusInText(rawLine).trim();

  let notes: string | undefined = undefined;

  // 1. Check if line has explicit metric parentheticals e.g. "(320ml)", "(438–500g)", "(13g)", "(7g)", "(250g)", "(454g)"
  const metricParenMatch = line.match(/\((?:[\w\/\.\–-]*\/)?([\d\.\–-]+)\s*(g|kg|ml|l)\)/i);
  
  if (metricParenMatch) {
    const rawValStr = metricParenMatch[1].split('–')[0].split('-')[0];
    const amountVal = parseFloat(rawValStr) || 1;
    const unitVal = metricParenMatch[2].toLowerCase();

    // Clean out parenthetical cup measurements & imperial text
    let cleanName = line
      .replace(/\([\s\S]*?\)/g, '') // remove parentheticals
      .replace(/^[\d\/\.\s-]+(?:and|to)?\s*[\d\/\.\s-]*\s*(?:cups?|tbsp|tsp|tablespoons?|teaspoons?|oz|lbs?|packets?|can|g|kg|ml|l)?\s*/gi, '') // remove "1 and 1/3 cups" or "3 and 1/2 to 4 cups"
      .replace(/^(?:to\s+[\d\/\.\s-]+\s*(?:cups?|tbsp|tsp|g|kg|ml|l)?\s*)/gi, '') // remove leftover "to 4 cups"
      .replace(/^[-*•\s]+/, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (cleanName.includes(',')) {
      const parts = cleanName.split(',');
      cleanName = parts[0].trim();
      notes = parts.slice(1).join(',').trim();
    }

    return {
      amount: amountVal,
      unit: unitVal,
      name: cleanName,
      notes
    };
  }

  // 2. Standard metric conversion if parenthetical metric was not present
  line = line.replace(/(\d+)\s+and\s+(\d+\/\d+)/gi, '$1 $2');
  // Ranges like "1/2 to 3/4 cup" or "2-3 tbsp": keep the upper bound (safer for shopping)
  line = line.replace(/^([-*•\s]*)\d[\d\/\. ]*?\s*(?:to|–|-)\s*(\d[\d\/\. ]*\s)/i, '$1$2');
  
  const regex = /^([\d\/\.\s-]+)?\s*(tablespoons?|tablespoon|tbsp|teaspoons?|teaspoon|tsp|cups?|cup|grams?|gram|g|kg|milliliters?|ml|liters?|l|ounces?|oz|pounds?|lbs?|lb|cloves?|clove|pinches|pinch|handfuls?|handful|slices?|slice|packets?|packet|cans?|can|pieces?|piece|pcs)?\s+(.+)$/i;
  const match = line.replace(/^[-*•\s]+/, '').match(regex);

  let amount = 1;
  let unit = '';
  let name = line;

  if (match) {
    const rawAmt = match[1]?.trim();
    if (rawAmt) {
      if (rawAmt.includes('/')) {
        if (rawAmt.includes(' ')) {
          const parts = rawAmt.split(' ');
          const whole = parseFloat(parts[0]) || 0;
          const [num, den] = parts[1].split('/');
          amount = whole + (parseFloat(num) / parseFloat(den));
        } else {
          const [num, den] = rawAmt.split('/');
          amount = parseFloat(num) / parseFloat(den);
        }
      } else {
        amount = parseFloat(rawAmt) || 1;
      }
    }

    unit = match[2] ? match[2].toLowerCase() : '';
    name = match[3] || line;

    const stripped = extractParentheticals(name);
    name = stripped.text;
    if (stripped.inner.length > 0) notes = stripped.inner.join(', ');

    if (name.includes(',')) {
      const parts = name.split(',');
      name = parts[0].trim();
      const afterComma = parts.slice(1).join(',').trim();
      notes = notes ? `${afterComma}, ${notes}` : afterComma;
    }  } else {
    // No leading amount (e.g. "Whipped cream (optional)"): still move parentheticals into notes
    const stripped = extractParentheticals(name);
    name = stripped.text;
    if (stripped.inner.length > 0) notes = stripped.inner.join(', ');
  }

  // Convert cup/imperial to metric
  const converted = convertCupToMetric(amount, unit, name);

  return {
    amount: converted.amount,
    unit: converted.unit,
    name,
    notes
  };
}
