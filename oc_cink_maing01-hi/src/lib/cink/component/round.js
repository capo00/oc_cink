import { createVisualComponent, useEffect, useRef, useState, useWillMount, Utils } from "uu5g05";
import Uu5Elements from "uu5g05-elements";
import Config from "../../config";
import Desk from "../model/desk";

const Players = createVisualComponent({
  displayName: Config.TAG + "Players",

  render(props) {
    const { players, winner, active } = props;

    const attrs = Utils.VisualComponent.getAttrs(props, Config.Css.css`
      display: grid;
      grid-template-columns: repeat(${players.length}, 1fr);
      gap: 8px;
    `);

    return (
      <div {...attrs}>
        {players.map((player, i) => (
          player.render({ i, state: winner === player ? "winner" : (active === player ? "active" : null) })
        ))}
      </div>
    );
  },
});

const Round = createVisualComponent({
  displayName: Config.TAG + "Round",

  render(props) {
    const { user, players, initialPlayerIndex, onEnd, bet } = props;

    const desk = useRef(new Desk()).current;

    const [winner, setWinner] = useState(null);
    const [playerIndex, setPlayerIndex] = useState(initialPlayerIndex);

    const allPlayers = [user, ...players];
    const activePlayer = allPlayers[playerIndex];

    useWillMount(() => {
      // start game - add to bank
      allPlayers.forEach((player, i) => {
        desk.increaseBank(player.decreaseBank(bet));
        player.clearCards();
      });
      desk.dealCards([user, ...players], 8);
    });

    function nextPlayer() {
      const newPlayerIndex = playerIndex + 1;
      setPlayerIndex(newPlayerIndex > 3 ? 0 : newPlayerIndex);
    }

    useEffect(() => {
      if (winner) {
        [user, ...players].forEach((player, i) => {
          if (player === winner) {
            if (winner.looser) {
              // TODO
              //log(`${winner.name}: No bank for game, no winner.`, desk.bank);
            } else {
              winner.increaseBank(desk.bank);
            }
          } else {
            winner.increaseBank(player.decreaseBank(player.cards.length * bet));
          }
        });
      }
    }, [winner]);

    useEffect(() => {
      (async function play() {
        const played = await activePlayer.play(desk, bet);

        if (played) {
          if (activePlayer.cards.length) {
            nextPlayer();
          } else {
            setWinner(activePlayer);
          }
        }
      })();
    }, [activePlayer]);

    function playCard(player, card) {
      desk.addCard(player.removeCard(card));

      if (player.cards.length) {
        nextPlayer();
      } else {
        setWinner(player);
      }
    }

    function playBank(player) {
      desk.increaseBank(player.decreaseBank(bet));
      nextPlayer();
    }

    function userClick(card) {
      // waiting on user click
      if (desk.isCardAvailable(card)) {
        playCard(user, card);
      } else {
        console.warn("Cannot add this card to the desk.", card);
      }
    }

    function userBankClick() {
      const availableCard = user.findAvailableCard(desk.availableCards);
      if (availableCard) {
        console.warn("User has available card to play.", availableCard);
      } else {
        playBank(user);
      }
    }

    const attrs = Utils.VisualComponent.getAttrs(props, Config.Css.css`
      display: grid;
      row-gap: 8px;
      padding: 4px;
    `);

    function onEndHandler() {
      onEnd(winner);
    }

    return (
      <div {...attrs}>
        <Players players={players} active={activePlayer} winner={winner} />

        {desk.render()}

        <div>
          {user.render({
            onCardClick: userClick,
            onBankClick: userBankClick,
            state: winner === user ? "winner" : (playerIndex === 0 ? "active" : null),
          })}
          {winner && (
            <Uu5Elements.Button meaning="primary" significance="highlighted" size="xl" onClick={onEndHandler} width="100%">
              Pokračovat
            </Uu5Elements.Button>
          )}
        </div>
      </div>
    );
  },
});

export default Round;
