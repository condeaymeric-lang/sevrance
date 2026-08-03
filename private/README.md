# Dossier privé

Déposez ici le fichier vendu, sous le nom `sevrance.pdf`.

Ce dossier n'est **pas** servi publiquement : il est hors de `public/`, et les
PDF y sont exclus du dépôt Git (voir `.gitignore`). Le fichier n'est accessible
qu'à travers `/api/download`, contre un jeton signé et un paiement Stripe
vérifié.

## Limite à connaître

Sur un hébergement serverless (Vercel, Netlify), la réponse d'une fonction est
plafonnée — environ 4,5 Mo chez Vercel. Si le PDF dépasse cette taille, ne le
servez pas depuis ce dossier : hébergez-le sur un stockage objet (S3, R2,
Bunny) et renseignez `PDF_SOURCE_URL`. La route relaie alors le fichier sans
jamais exposer son URL réelle.
