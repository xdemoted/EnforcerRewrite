import axios from "axios";

async function command() {
    let deckResonse: Response<deckResonse> = await axios.get("https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1");

    if (deckResonse.status !== 200) {
        throw new Error("Failed to fetch deck of cards.");
    }

    let deckId = deckResonse.data.deck_id;
    console.log(`Deck ID: ${deckId}`);

    let drawResponse: Response<drawResponse> = await axios.get(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=2`);

    if (drawResponse.status !== 200) {
        throw new Error("Failed to draw cards.");
    }

    let cards = drawResponse.data.cards;
    console.log(`Drawn cards: ${cards.map(card => `${card.value} of ${card.suit}`).join(", ")}`);
}

type Response<T> = {
    status: number;
    data: T;
};

type deckResonse = {
    success: boolean;
    deck_id: string;
    shuffled: boolean;
    remaining: number;
    status: number;
};

type drawResponse = {
    success: boolean;
    cards: Array<{
        code: string;
        image: string;
        images: {
            svg: string;
            png: string;
        };
        value: string;
        suit: string;
    }>;
    deck_id: string;
    remaining: number;
    status: number;
};

let deck = [];
for (let i = 0; i < 52; i++) {
    deck.push((i % 13) + 1);
}

console.log(deck);