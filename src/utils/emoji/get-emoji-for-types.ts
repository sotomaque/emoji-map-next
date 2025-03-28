import { CATEGORY_MAP, EMOJI_OVERRIDES } from '@/constants/category-map';

export function getEmojiForTypes(name: string, types: string[]): string {
  if (EMOJI_OVERRIDES[name.toLocaleLowerCase()])
    return EMOJI_OVERRIDES[name.toLocaleLowerCase()];

  for (const type of types) {
    const matchedCategory = CATEGORY_MAP.find((cat) =>
      cat.primaryType.includes(type)
    );

    if (matchedCategory) return matchedCategory.emoji;
  }

  return '😶‍🌫️';
}
