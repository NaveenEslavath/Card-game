const gridContainer = document.querySelector(".grid-container");
let cards = [];
let firstCard, secondCard;
let lockBoard = false;
let score = 0;
let clickTimeout;

document.querySelector(".score").textContent = score;

// Fetching card data with error handling
fetch("./data/cards.json")
  .then((res) => {
    if (!res.ok) throw new Error("Failed to fetch cards data");
    return res.json();
  })
  .then((data) => {
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error("Invalid or empty card data");
    }
    cards = [...data, ...data]; // Duplicate the cards for matching pairs
    shuffleCards();
    generateCards();
  })
  .catch((error) => {
    console.error("Error loading cards:", error);
  });

// Shuffle cards to randomize
function shuffleCards() {
  let currentIndex = cards.length,
    randomIndex,
    temporaryValue;

  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    temporaryValue = cards[currentIndex];
    cards[currentIndex] = cards[randomIndex];
    cards[randomIndex] = temporaryValue;
  }
}

// Generate card elements in the DOM
function generateCards() {
  for (let card of cards) {
    const cardElement = document.createElement("div");
    cardElement.classList.add("card");
    cardElement.setAttribute("data-name", card.name);

    const imgElement = new Image();
    imgElement.src = card.image;
    imgElement.alt = card.name;
    imgElement.classList.add("front-image");

    // Fallback for broken image links
    imgElement.onerror = () => {
      imgElement.src = "./path-to-placeholder-image.jpg"; // Set a fallback image path
    };

    cardElement.innerHTML = `
      <div class="front"></div>
      <div class="back"></div>
    `;
    cardElement.querySelector(".front").appendChild(imgElement);

    gridContainer.appendChild(cardElement);
    cardElement.addEventListener("click", flipCard);
  }
}

// Handle card flips and matches
function flipCard() {
  if (lockBoard || this === firstCard) return;

  clearTimeout(clickTimeout); // Cancel any pending timeouts from earlier clicks
  this.classList.add("flipped");

  if (!firstCard) {
    firstCard = this;
    return;
  }

  secondCard = this;
  lockBoard = true;

  clickTimeout = setTimeout(checkForMatch, 300); // Add slight delay for visual effect
}

// Check if two cards match
function checkForMatch() {
  let isMatch = firstCard.dataset.name === secondCard.dataset.name;

  if (isMatch) {
    disableCards();
    increaseScore();
  } else {
    unflipCards();
  }
}

// Disable matched cards (remove event listeners)
function disableCards() {
  firstCard.removeEventListener("click", flipCard);
  secondCard.removeEventListener("click", flipCard);
  resetBoard();
}

// Unflip cards if no match
function unflipCards() {
  setTimeout(() => {
    firstCard.classList.remove("flipped");
    secondCard.classList.remove("flipped");
    resetBoard(); // Ensure reset happens after animation
  }, 1000);
}

// Reset board state after each turn
function resetBoard() {
  firstCard = null;
  secondCard = null;
  lockBoard = false;
}

// Increase score on a match
function increaseScore() {
  score++;
  document.querySelector(".score").textContent = score;
}

// Restart the game, shuffle, and reset score
function restart() {
  resetBoard();
  shuffleCards(); // Shuffle cards at restart
  score = 0;
  document.querySelector(".score").textContent = score;
  
  gridContainer.innerHTML = ""; // Clear the grid and regenerate cards
  generateCards();
}
