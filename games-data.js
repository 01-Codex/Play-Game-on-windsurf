// Base de données des 6 jeux d'arcade avec images appropriées
const gamesData = [
    {
        id: 1,
        title: "Pac-Man",
        genre: "action",
        year: 1980,
        rating: 4.8,
        image: "screenshots/pacman.png", // Capture d'écran de Pac-Man
        description: "Le jeu d'arcade classique où vous devez manger tous les points tout en évitant les fantômes. Un incontournable qui a marqué l'histoire du jeu vidéo.\n\nContrôles: Utilisez les flèches directionnelles pour déplacer Pac-Man à travers le labyrinthe. Mangez toutes les pac-gommes pour passer au niveau suivant. Les fruits bonus apparaissent périodiquement pour des points supplémentaires.\n\nAstuces: Les power-pills rendent les fantômes vulnérables pendant un court instant. Profitez-en pour les manger et marquer des points bonus!",
        players: "1",
        duration: "5-10 min",
        difficulty: "Facile"
    },
    {
        id: 2,
        title: "Space Invaders",
        genre: "shooter",
        year: 1978,
        rating: 4.7,
        image: "screenshots/space-invaders.png", // Capture d'écran de Space Invaders
        description: "Défendez la Terre contre une invasion d'aliens dans ce shooter spatial révolutionnaire qui a lancé le genre.\n\nContrôles: Déplacez votre canon avec les flèches gauche et droite, et tirez avec la barre d'espace. Évitez les tirs ennemis et détruisez tous les envahisseurs avant qu'ils n'atteignent le bas de l'écran.\n\nAstuces: Les vaisseaux ennemis se déplacent plus vite à mesure que leur nombre diminue. Les soucoupes volantes offrent des points bonus aléatoires.",
        players: "1-2",
        duration: "10-15 min",
        difficulty: "Moyen"
    },
    {
        id: 3,
        title: "Tetris",
        genre: "puzzle",
        year: 1984,
        rating: 4.9,
        image: "screenshots/tetris.png", // Capture d'écran de Tetris
        description: "Le puzzle game addictif où vous devez organiser des blocs qui tombent pour former des lignes complètes.\n\nContrôles: Utilisez les flèches gauche et droite pour déplacer les pièces, la flèche du haut pour les faire tourner, et la flèche du bas pour les faire descendre plus rapidement.\n\nAstuces: Essayez de garder la zone de jeu la plus plate possible pour éviter les situations difficiles. Les lignes multiples rapportent plus de points qu'une seule ligne à la fois.",
        players: "1-2",
        duration: "Illimité",
        difficulty: "Facile à Difficile"
    },
    {
        id: 4,
        title: "Snake",
        genre: "arcade",
        year: 1976,
        rating: 4.5,
        image: "screenshots/snake.png", // Capture d'écran de Snake
        description: "Le classique jeu du serpent où vous devez grandir en mangeant de la nourriture tout en évitant de vous mordre la queue.\n\nContrôles: Utilisez les flèches directionnelles pour diriger le serpent. Mangez la pomme pour grandir et marquer des points.\n\nAstuces: Plus le serpent est long, plus il devient difficile de manœuvrer. Planifiez vos mouvements à l'avance pour éviter de vous coincer.",
        players: "1",
        duration: "5-15 min",
        difficulty: "Facile à Moyen"
    },
    {
        id: 5,
        title: "Pong",
        genre: "sport",
        year: 1972,
        rating: 4.3,
        image: "screenshots/pong.png", // Capture d'écran de Pong
        description: "Le tout premier jeu vidéo d'arcade à succès, un classique du tennis de table électronique.\n\nContrôles: Déplacez votre raquette de haut en bas avec les flèches ou la souris. Essayez de renvoyer la balle dans le camp adverse.\n\nAstuces: Les angles de rebond sont importants. Essayez de frapper la balle avec les extrémités de votre raquette pour des tirs plus imprévisibles.",
        players: "1-2",
        duration: "5-10 min",
        difficulty: "Facile"
    },
    {
        id: 6,
        title: "Breakout",
        genre: "arcade",
        year: 1976,
        rating: 4.4,
        image: "screenshots/breakout.png", // Capture d'écran de Breakout
        description: "Un classique du cassage de briques où vous devez faire rebondir une balle pour détruire toutes les briques.\n\nContrôles: Déplacez la raquette avec la souris ou les flèches pour renvoyer la balle. Utilisez la barre d'espace pour lancer la balle.\n\nAstuces: Visez les briques du haut pour les faire tomber plus rapidement. Certaines briques peuvent nécessiter plusieurs coups ou avoir des effets spéciaux.",
        players: "1",
        duration: "5-15 min",
        difficulty: "Moyen"
    }
];

// Export pour utilisation dans d'autres fichiers
if (typeof module !== 'undefined' && module.exports) {
    module.exports = gamesData;
}
