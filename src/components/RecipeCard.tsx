type Recipe = {
  id: string;
  title: string;
  image_url?: string | null;
  image_placeholder?: string | null;
};

export function RecipeCard({ recipe }: { recipe: Recipe }) {
  const hasImg = !!recipe.image_url;
  return (
    <a
      href={`/recipes/${recipe.id}`}
      className="block overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
    >
      <div className="relative">
        {/* Platzhalterfläche, hält das Seitenverhältnis */}
        <div className="aspect-video w-full bg-neutral-100" />

        {/* LQIP als unscharfer Hintergrund */}
        {recipe.image_placeholder && (
          <img
            src={recipe.image_placeholder}
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full scale-105 blur-md object-cover"
          />
        )}

        {/* echtes Bild oben drüber */}
        {hasImg && (
          <img
            src={recipe.image_url!}
            alt={recipe.title}
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
            decoding="async"
          />
        )}
      </div>

      <div className="p-4">
        <h3 className="font-medium tracking-tight text-gray-900">{recipe.title}</h3>
      </div>
    </a>
  );
}
