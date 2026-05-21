import style from './styles/GameVariantSelector.module.css';

export default function GameVariantSelector({
    formData,
    onChange,
    categories = [],
    showAnonymousOption = false
}) {
    const selectedCategory =
        categories.find((category) => category._id === formData.gameType) || null;
    const roundOptions = [...new Set(categories.map((category) => category.numOfRounds))]
        .sort((a, b) => a - b);
    const straightOptions = [...new Set(categories.map((category) => category.straightsAllowed))];
    const timeOptions = [...new Set(categories.map((category) => category.timePerRound))]
        .sort((a, b) => a - b);

    function handleValueChange(name, value) {
        onChange({
            target: {
                name,
                value
            }
        });
    }

    return (
        <div className={style['wrapper']}>
            <div className={style['section']}>
                <h3 className={style['sectionTitle']}>Choose Variant</h3>

                <div className={style['variantGroup']}>
                    <div className={style['fieldGroup']}>
                        <label className={style['label']}>Rounds</label>
                        <div className={style['optionGrid']}>
                            {roundOptions.map((rounds) => (
                                <label key={rounds} className={style['choiceCard']}>
                                    <input
                                        type='radio'
                                        name='numOfRounds'
                                        value={rounds}
                                        checked={formData.numOfRounds === rounds}
                                        onChange={onChange}
                                        className={style['srOnly']}
                                    />
                                    <span className={style['choiceLabel']}>Best of {rounds}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className={style['fieldGroup']}>
                        <label className={style['label']}>Time Per Round</label>
                        <div className={style['optionGrid']}>
                            {timeOptions.map((timePerRound) => (
                                <label key={timePerRound} className={style['choiceCard']}>
                                    <input
                                        type='radio'
                                        name='timePerRound'
                                        value={timePerRound}
                                        checked={formData.timePerRound === timePerRound}
                                        onChange={onChange}
                                        className={style['srOnly']}
                                    />
                                    <span className={style['choiceLabel']}>{timePerRound} seconds</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className={style['fieldGroup']}>
                        <label className={style['label']}>Allow Straights</label>
                        <div className={style['optionGrid']}>
                            {straightOptions.map((straightsAllowed) => (
                                <label
                                    key={String(straightsAllowed)}
                                    className={style['choiceCard']}
                                >
                                    <input
                                        type='radio'
                                        name='straightsAllowed'
                                        value={String(straightsAllowed)}
                                        checked={formData.straightsAllowed === straightsAllowed}
                                        onChange={onChange}
                                        className={style['srOnly']}
                                    />
                                    <span className={style['choiceLabel']}>
                                        {straightsAllowed ? 'Allowed' : 'Not Allowed'}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                <div className={style['summaryCard']}>
                    <label className={style['summaryLabel']} htmlFor='gameType'>
                        Selected Category
                    </label>
                    <select
                        id='gameType'
                        name='gameType'
                        value={formData.gameType}
                        onChange={onChange}
                        className={style['select']}
                    >
                        {categories.map((category) => (
                            <option key={category._id} value={category._id}>
                                {category.name}
                            </option>
                        ))}
                    </select>
                    {!selectedCategory ? (
                        <p className={style['summaryValue']}>
                            No matching backend category found for this combination.
                        </p>
                    ) : null}
                </div>
            </div>

            <div className={style['section']}>
                <h3 className={style['sectionTitle']}>Match Rules</h3>

                <div className={style['grid']}>
                    <div className={style['fieldGroup']}>
                        <label className={style['label']} htmlFor='desiredOpponentElo'>
                            Desired Opponent Elo
                        </label>
                        <input
                            id='desiredOpponentElo'
                            name='desiredOpponentElo'
                            type='number'
                            min='0'
                            step='1'
                            value={formData.desiredOpponentElo}
                            onChange={onChange}
                            className={style['input']}
                        />
                        <p className={style['helperText']}>
                            The platform will search near this rating to find a fair match.
                        </p>
                    </div>

                    {showAnonymousOption ? (
                        <div className={style['fieldGroup']}>
                            <label className={style['label']} htmlFor='allowAnonymousPlayers'>
                                Allow Anonymous Players
                            </label>

                            <div className={style['checkboxBox']}>
                                <input
                                    id='allowAnonymousPlayers'
                                    type='checkbox'
                                    checked={Boolean(formData.allowAnonymousPlayers)}
                                    onChange={(e) =>
                                        handleValueChange(
                                            'allowAnonymousPlayers',
                                            e.target.checked
                                        )
                                    }
                                    className={style['checkbox']}
                                />
                                <span className={style['checkboxText']}>Enabled</span>
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
