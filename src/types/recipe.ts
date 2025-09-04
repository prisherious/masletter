export type RecipeRow = {
  id: string;
  title: string;
  ingredients: string[];     // IMPORTANT: niemals null speichern
  steps: string | null;

  image_url: string | null;
  image_width: number | null;
  image_height: number | null;
  image_placeholder: string | null;

  created_at?: string | null;
  updated_at?: string | null;
};

export type RecipeInsert = Partial<Omit<RecipeRow, "id">> & { id?: string };
export type RecipeUpdate = Partial<Omit<RecipeRow, "id">>;
