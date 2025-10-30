# ✅ Supabase Configuration Checklist

Votre application rencontre une erreur **403 Forbidden** lors de l'inscription. Voici la checklist complète pour résoudre ce problème :

## 🔧 Configuration Supabase requise

### 1. Activer les inscriptions d'utilisateurs

**URL:** https://supabase.com/dashboard/project/zclkfguqdwayztxvpcpn/auth/settings

1. Allez dans **Authentication** → **Settings**
2. Trouvez la section **"User Signups"**
3. **Activez** l'option **"Allow new users to sign up"** (elle est peut-être désactivée)
4. Cliquez sur **Save**

### 2. Configurer l'Email Provider

**URL:** https://supabase.com/dashboard/project/zclkfguqdwayztxvpcpn/auth/providers

1. Allez dans **Authentication** → **Providers**
2. Cliquez sur **Email**
3. Vérifiez que :
   - ✅ **Enable Email provider** est activé
   - ✅ **Confirm email** est **DÉSACTIVÉ** (pour le développement)
   - ✅ **Secure email change** peut rester activé ou désactivé selon vos préférences
4. Cliquez sur **Save**

### 3. Vérifier la configuration Site URL

**URL:** https://supabase.com/dashboard/project/zclkfguqdwayztxvpcpn/auth/url-configuration

1. Allez dans **Authentication** → **URL Configuration**
2. Ajoutez ces URLs dans **Redirect URLs** (une par ligne) :
   ```
   http://localhost:5173/**
   http://localhost:3000/**
   http://localhost:8000/**
   ```
3. Cliquez sur **Save**

### 4. Obtenir la clé Service Role (IMPORTANT)

**URL:** https://supabase.com/dashboard/project/zclkfguqdwayztxvpcpn/settings/api

1. Allez dans **Settings** → **API**
2. Dans la section **Project API keys**, trouvez la clé **service_role**
3. Cliquez sur le bouton pour révéler la clé
4. **Copiez** cette clé
5. **Remplacez** `PLEASE_PROVIDE_SERVICE_ROLE_KEY` par cette clé dans :
   - `/home/user/trainlytics-app/backend/app/.env`
   - `/home/user/trainlytics-app/backend/.env`

Exemple :
```bash
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjbGtmZ3VxZHdheXp0eHZwY3BuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTMxMzY1OCwiZXhwIjoyMDc2ODg5NjU4fQ.VOTRE_VRAIE_CLE_ICI
```

---

## 🧪 Après avoir appliqué ces changements

### Testez la configuration :

```bash
cd /home/user/trainlytics-app/backend
python3 test_signup.py
```

Si vous voyez **✅ SUCCESS**, vous pouvez passer à l'étape suivante !

### Appliquez la migration SQL :

1. Allez sur https://supabase.com/dashboard/project/zclkfguqdwayztxvpcpn/sql
2. Ouvrez le fichier `/home/user/trainlytics-app/backend/migrations/001_adapt_schema.sql`
3. Copiez tout le contenu
4. Collez-le dans l'éditeur SQL de Supabase
5. Cliquez sur **Run**

Si vous avez des erreurs concernant des tables qui n'existent pas, c'est normal - la migration s'adapte à votre schéma existant.

### Démarrez l'application :

```bash
# Terminal 1 - Backend
cd /home/user/trainlytics-app/backend
python3 -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Terminal 2 - Frontend
cd /home/user/trainlytics-app/frontend
npm run dev
```

---

## 🚨 Problèmes courants

### Si vous avez toujours une erreur 403 :

1. Videz le cache de votre navigateur
2. Vérifiez que vous n'avez pas de règles de sécurité personnalisées dans Supabase
3. Essayez de créer un utilisateur manuellement via le Dashboard Supabase pour confirmer que la base de données fonctionne

### Si la migration SQL échoue :

- Certaines tables peuvent ne pas exister dans votre schéma
- Commentez les sections qui échouent (ajoutez `--` au début de la ligne)
- Ou exécutez seulement les parties dont vous avez besoin

---

## ✅ Configuration complétée

Une fois tout configuré, testez l'inscription depuis votre frontend :
1. Allez sur http://localhost:5173
2. Créez un nouveau compte
3. Vous devriez être redirigé vers votre dashboard

**Bonne chance ! 🚀**
