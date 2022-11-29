# Projet

## Etudiants

- Bottin Stéphane
- Demarta Robin
- Mattei Simon
- Vaz Afonso Vitor

## Description des fonctionnalités

## 1 - Gestion d'équipes

À la connexion d'un joueur, le serveur décidera automatiquement d'une équipe à laquelle il appartiendra, en gardant au mieux l'équilibre entre l'équipe bleue et la rouge. Le joueur devra donc affronter l'autre équipe en prenant garde de ne pas tirer sur ses coéquipiers sous peine de donner un point à l'autre équipe.

### Détails techniques
- Une couleur par équipe: bleu ou rouge
- Les scores des deux équipes est affiché distinctement
- Le serveur gère l'équilibrage entre les 2 équipes
- La vie des joueurs est affichée derrière ceux-ci

## 2 - Ajout d'un boss

Après un certain temps, une entité boss apparait, contrôlée par intelligence artificielle. Tous les joueurs peuvent combattre le boss qui, quant à lui, attaquera tout le monde. Si le boss élimine un joueur rouge, l'équipe bleue gagnera un point et vice-versa.

Une fois le boss vaincu, celui-ci réapparaîtra après un certain temps (laissé cours à des fins de démonstration).

### Comportement
Le boss poursuit de manière direct le joueur le plus proche de lui. À intervalles réguliers, il tire des rafales de missiles dans sa direction. Au fur et à mesure qu'il perdra des points de vie, ses attaques seront plus agressives (tirs plus fréquent et plus de missiles par rafales qui elles seront plus rapides).

## Démarrer l'application

 - `npm install`
 - `npm start`
 - Vous pouvez ensuite vous connecter plusieurs fois à localhost:3000, une fois par joueur

*Image d'arrière-plan par [u/astrellon3](https://www.reddit.com/r/PixelArt/comments/f1wg26/space_background/)*
