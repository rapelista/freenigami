import { SortOption } from '~/lib/enum';

export const sortOptionLabelMap = new Map<SortOption, string>([
  [SortOption.Popularity, 'Popularitas'],
  [SortOption.Latest, 'Terbaru'],
  [SortOption.Rating, 'Rating'],
  [SortOption.Bookmark, 'Bookmark'],
]);
