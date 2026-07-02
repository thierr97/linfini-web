#!/bin/bash
# Ajouter les variables Odoo sur Vercel
cd "$(dirname "$0")/../../../../.."

echo "sas-les-4-as1.odoo.com" | vercel env add ODOO_URL production --force 2>/dev/null || \
  printf "https://sas-les-4-as1.odoo.com" | vercel env add ODOO_URL production

printf "sas-les-4-as1" | vercel env add ODOO_DB production
printf "tcyrille@hotmail.fr" | vercel env add ODOO_USER production
printf "1b18ec425fb81a6542ab803dd7826e8388f1c641" | vercel env add ODOO_API_KEY production

echo "Variables Odoo ajoutées"
