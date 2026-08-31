"use client";

const germanCharacters = ["ä", "ö", "ü", "ß"];

export default function GermanCharacterBar({
  onCharacter,
  disabled = false
}: {
  onCharacter: (character: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="germanCharacterBar" aria-label="German characters">
      <span className="germanCharacterLabel">German keyboard</span>
      <div className="germanCharacterKeys">
        {germanCharacters.map(character => (
          <button
            type="button"
            className="germanCharacterKey"
            key={character}
            disabled={disabled}
            onMouseDown={event => event.preventDefault()}
            onClick={() => onCharacter(character)}
          >
            {character}
          </button>
        ))}
      </div>
    </div>
  );
}
