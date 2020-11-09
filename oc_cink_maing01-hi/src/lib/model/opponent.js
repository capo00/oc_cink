import Player from "./player";
import PlayerHand from "../component/player-hand";
import { PACK_ONE } from "./pack";

class Opponent extends Player {
  constructor(name, bank, id) {
    super(name, bank);
    this.id = id;
  }

  decreaseBank(count = 1) {
    const r = super.decreaseBank(count);
    if (count !== r) {
      this.looser = true;
    }
    return r;
  }

  async play(desk) {
    let promise;

    if (this.id) {
      const dtoIn = { id: this.id };
      // TODO server
    } else {
      promise = new Promise((resolve, reject) => {
        setTimeout(() => {
          const card = this.findAvailableCard(desk.availableCards);
          // TODO
          resolve(card ? { card } : {});
        }, 1000);
      });
    }

    let { card } = await promise;

    if (card) {
      card = PACK_ONE.find(c => c.kind === card.kind && c.num === card.num);
      desk.addCard(this.removeCard(card));
    } else {
      desk.increaseBank(this.decreaseBank());
    }

    return true;
  }

  render({ state, i }) {
    return (
      <PlayerHand key={this.name + i} name={this.name} state={state} cardCount={this.cards.length} bank={this._bank} />
    );
  }
}

export default Opponent;