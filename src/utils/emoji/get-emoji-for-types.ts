import { CATEGORY_MAP } from '@/constants/category-map';

export function getEmojiForTypes(types: string[]): string {
  for (const type of types) {
    const matchedCategory = CATEGORY_MAP.find((cat) =>
      cat.primaryType.includes(type)
    );

    if (matchedCategory) return matchedCategory.emoji;
  }

  return '😶‍🌫️';
}
