/**
 * Gabarits d'articles officiels AgriCapital.
 * Le contenu est du HTML rendu tel quel par la page article (classe `prose`).
 */

export interface ExternalMediaTemplateInput {
  mediaName?: string;
  articleTitle?: string;
  articleUrl?: string;
  authorName?: string;
  publishedOn?: string;
  quote?: string;
  summary?: string;
}

export const buildExternalMediaArticle = (input: ExternalMediaTemplateInput = {}) => {
  const {
    mediaName = "Nom du média",
    articleTitle = "Titre de l'article publié par le média",
    articleUrl = "https://",
    authorName = "Rédaction",
    publishedOn = new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" }),
    quote = "Citation marquante extraite de l'article.",
    summary = "Résumé factuel de ce que le média rapporte au sujet d'AgriCapital.",
  } = input;

  return `
<p><strong>${mediaName}</strong> — ${publishedOn}</p>

<h2>${articleTitle}</h2>

<p>${summary}</p>

<blockquote>
  <p>« ${quote} »</p>
  <p><em>— ${authorName}, ${mediaName}</em></p>
</blockquote>

<h3>Ce qu'il faut retenir</h3>
<ul>
  <li>Point clé 1 rapporté par le média.</li>
  <li>Point clé 2 rapporté par le média.</li>
  <li>Point clé 3 rapporté par le média.</li>
</ul>

<h3>Le contexte AgriCapital</h3>
<p>AgriCapital SARL développe des plantations de palmier à huile clé en main et sécurise le foncier agricole en Côte d'Ivoire, avec une capacité d'action structurée autour de contrats certifiés.</p>

<hr />
<p><strong>Source :</strong> ${mediaName} — <a href="${articleUrl}" target="_blank" rel="noopener noreferrer">Lire l'article</a></p>
<p><em>Article de reprise média. Les propos cités relèvent de la responsabilité de leur auteur et de l'organe de presse d'origine.</em></p>
`.trim();
};

export const buildPressReleaseArticle = () => `
<p><strong>Communiqué officiel AgriCapital</strong> — ${new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })}</p>

<h2>Objet du communiqué</h2>
<p>Texte principal du communiqué.</p>

<h3>Détails</h3>
<ul>
  <li>Élément 1</li>
  <li>Élément 2</li>
</ul>

<hr />
<p><strong>Contact presse :</strong> contact@agricapital.ci</p>
`.trim();
