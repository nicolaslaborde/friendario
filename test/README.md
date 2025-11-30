# Test Directory

Ce dossier contient les scripts de test et de génération de données pour Friendoria.

## 🧪 Script de seed

Le script `seed-data.ts` crée des données de test réalistes pour l'application.

### Données créées

**Utilisateur:**
- Nom: Nicolas Laborde
- Email: nicolas.laborde@example.com
- Mot de passe: password123
- Téléphone: +33 6 12 34 56 78

**Événements:**

1. **Soirée chez Bob l'éponge** (Ponctuel)
   - Date: 15 novembre 2024
   - Lieu: Ananas sous la mer, Bikini Bottom
   - Description: Soirée karaoké et jeux avec les amis

2. **Week-end à Étretat** (3 jours)
   - Dates: 18-20 octobre 2024
   - Lieu: Étretat, Normandie
   - Description: Découverte des falaises et de la côte normande

3. **Vacances à Saint-Marcel** (21 jours)
   - Dates: 1-21 août 2024
   - Lieu: Saint-Marcel, Ardèche
   - Description: Vacances en Provence avec randonnées et détente

### Utilisation

```bash
# Depuis la racine du projet
npm install -D tsx

# Lancer le script de seed
npx tsx test/seed-data.ts
```

### Connexion après seed

Utilisez ces identifiants pour vous connecter:
- **Email**: nicolas.laborde@example.com
- **Mot de passe**: password123

### Réinitialisation

Pour supprimer toutes les données et recommencer:

```bash
npx prisma db push --force-reset
npx tsx test/seed-data.ts
```
