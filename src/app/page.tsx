import Faq from "@/components/Faq";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import Mechanism from "@/components/Mechanism";
import Offer from "@/components/Offer";
import Problem from "@/components/Problem";

/**
 * Page de vente courte : un seul scroll, quatre blocs, deux occurrences du
 * même CTA. L'ordre des blocs est délibéré — voir le brief produit.
 */
export default function Page() {
  return (
    <main>
      <Hero />
      <Problem />
      <Mechanism />
      <Offer />
      <Faq />
      <Footer />
    </main>
  );
}
