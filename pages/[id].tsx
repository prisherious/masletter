import Head from "next/head";
import Image from "next/image";
import Container from "/components/Container";
import { Card, CardBody } from "@/components/Card";
import Badge from "@/components/Badge";
import IconButton from "@/components/IconButton";
import IngredientItem from "@/components/IngredientItem";

// Dummy Loader: ersetze das später mit deiner echten Datenquelle
async function fetchRecipe(id: string) {
  // TODO: von Supabase / API holen
  return {
    id,
    title: "Cremige Tomaten-Pasta",
    cover: "/recipe-cover.jpg", // lege ein schönes Platzhalterbild in /public
    time: "25 Min",
    difficulty: "Einfach",
    servings: "2 Erwachsene + 3 Kinder",
    tags: ["Familienfreundlich", "Budget", "Schnell"],
    ingredients: [
      "300 g Pasta",
      "1 Dose Tomaten (400 g)",
      "1 Zwiebel, fein gewürfelt",
      "1 Knoblauchzehe, gehackt",
      "100 ml Sahne oder Hafercuisine",
      "Olivenöl, Salz, Pfeffer, Basilikum"
    ],
    steps: [
      "Pasta nach Packungsangabe kochen.",
      "Zwiebel & Knoblauch in Olivenöl glasig dünsten.",
      "Tomaten zugeben, 8 Min köcheln, würzen.",
      "Sahne einrühren, 2 Min ziehen lassen.",
      "Mit Pasta mischen, Basilikum darüber."
    ],
    nutrition: "Pro Portion ca. 520 kcal • 18 g Eiweiß",
    note: "Tipp: Mit geriebenem Käse oder Hefeflocken servieren."
  };
}

export default function RecipePage({ recipe }) {
  const share = async () => {
    try {
      await navigator.share?.({ title: recipe.title, url: typeof window !== "undefined" ? window.location.href : "" });
    } catch {}
  };

  const printPage = () => window.print();

  return (
    <>
      <Head>
        <title>{recipe.title} | MASletter</title>
        <meta name="description" content={`${recipe.title} – ${recipe.time}, ${recipe.servings}`} />
        <meta property="og:title" content={recipe.title} />
        <meta property="og:description" content={`${recipe.time} • ${recipe.servings}`} />
        <meta property="og:image" content={recipe.cover} />
      </Head>

      <div className="bg-brand-50">
        <Container className="py-8 sm:py-12">
          {/* Header */}
          <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:mb-8 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-brand-700 sm:text-4xl">{recipe.title}</h1>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge>{recipe.time}</Badge>
                <Badge>{recipe.difficulty}</Badge>
                <Badge>{recipe.servings}</Badge>
                {recipe.tags.map((t: string) => <Badge key={t}>{t}</Badge>)}
              </div>
            </div>
            <div className="flex gap-2">
              <IconButton onClick={share} title="Teilen">🔗 Teilen</IconButton>
              <IconButton onClick={printPage} title="Drucken">🖨️ Drucken</IconButton>
            </div>
          </div>

          {/* Hero + Infos */}
          <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-5">
            <Card className="lg:col-span-3 overflow-hidden">
              <Image
                src={recipe.cover}
                alt={recipe.title}
                width={1200}
                height={800}
                className="h-64 w-full object-cover sm:h-96"
                priority
              />
            </Card>

            <div className="lg:col-span-2">
              <Card>
                <CardBody>
                  <h2 className="mb-3 text-xl font-semibold text-brand-700">Zutaten</h2>
                  <div className="grid grid-cols-1 gap-1">
                    {recipe.ingredients.map((i: string, idx: number) => (
                      <IngredientItem key={idx} text={i} />
                    ))}
                  </div>
                </CardBody>
              </Card>

              <Card className="mt-4">
                <CardBody>
                  <h3 className="mb-2 text-lg font-semibold text-brand-700">Nährwerte</h3>
                  <p className="text-sm text-neutral-700">{recipe.nutrition}</p>
                </CardBody>
              </Card>
            </div>
          </div>

          {/* Steps */}
          <Card className="mt-6 sm:mt-8">
            <CardBody>
              <h2 className="mb-4 text-xl font-semibold text-brand-700">Zubereitung</h2>
              <ol className="space-y-4">
                {recipe.steps.map((step: string, i: number) => (
                  <li key={i} className="flex gap-4">
                    <span className="mt-0.5 inline-flex h-7 w-7 flex-none items-center justify-center rounded-full bg-brand-200 text-sm font-semibold text-brand-700">{i+1}</span>
                    <p className="leading-relaxed">{step}</p>
                  </li>
                ))}
              </ol>
              {recipe.note && <p className="mt-6 rounded-xl bg-brand-50 p-4 text-sm text-brand-700">{recipe.note}</p>}
            </CardBody>
          </Card>

          {/* Footer CTA */}
          <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-neutral-600">Digitales Rezeptbuch • © MAS Keramik</p>
            <div className="flex gap-2">
              <IconButton onClick={share} title="Teilen">🔗 Teilen</IconButton>
              <IconButton onClick={printPage} title="Drucken">🖨️ Drucken</IconButton>
            </div>
          </div>
        </Container>
      </div>
    </>
  );
}

export async function getServerSideProps({ params }) {
  const recipe = await fetchRecipe(params.id as string);
  return { props: { recipe } };
}
