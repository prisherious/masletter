type Recipe = {
  id: string;
  title: string;
  image_url?: string | null;
  image_placeholder?: string | null;
};

export function RecipeCard({ recipe }: { recipe: Recipe }) {
  const hasImg = !!recipe.image_url;
  return (
    <a href={`/recipes/${recipe.id}`} className="block rounded-2xl border border-border bg-card shadow-md overflow-hidden">
      <div className="relative">
        <div className="aspect-video w-full bg-muted" />
        {hasImg ? (
          <>
            {/* LQIP als Hintergrund */}
            {recipe.image_placeholder && (
              <img
                src={recipe.image_placeholder}
                aria-hidden
                alt=""
                className="absolute inset-0 h-full w-full object-cover blur-md scale-105"
              />
            )}
            {/* echtes Bild obendrüber */}
            <img
              src={recipe.image_url!}
              alt={recipe.title}
              className="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
              decoding="async"
            />
          </>
        ) : null}
      </div>
      <div className="p-4">
        <h3 className="font-medium tracking-tight">{recipe.title}</h3>
      </div>
    </a>
  );
}
