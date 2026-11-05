/* Mnemonic Notebook: write your own memory hooks for hard words, then review the words through them. */
(function () {
  'use strict';
  const KEY = 'gre-mnemonic-notebook.hooks';
  const IDEAS = [
    ['Sound-alike', 'Link the word to a word it sounds like. Garrulous sounds like "gargle": someone who talks so much they gargle words.'],
    ['Root', 'Break the word into parts. Benevolent: bene (good) + vol (wish), wishing good.'],
    ['Picture', 'Make a vivid, silly image. Obsequious: a waiter bowing so low he sweeps the floor with his nose.'],
    ['Story', 'Put three or four new words in one short story. The stranger the story, the better it sticks.'],
    ['Personal link', 'Connect the word to someone you know. Who in your life is laconic?'],
  ];
  // Cards for the words that have a hook, with the hook on the back.
  const cardsFor = (words, hooks) => words.filter((w) => hooks[w.id] && hooks[w.id].text).map((w) => ({ id: w.id, front: w.w, back: w.d, extra: 'Your hook: ' + hooks[w.id].text, tag: '' }));
  const App = {
    about: 'A memory hook you invent yourself sticks better than one you read. Search the GRE word bank, write a hook for each hard word, rate how well it works, and review the words with your own hooks on the back of the cards.',
    how: ['Find a word in **Notebook** and write a hook: a sound-alike, a root, a picture or a story.', 'Review your hooked words in **Review**.', 'After a review, mark whether the hook helped. Rewrite the ones that did not.', 'See **Ideas** for kinds of hooks.'],
    tabs: [
      { id: 'notebook', label: 'Notebook', render(el, ctx) {
        const hooks = SK.store.get(KEY, {});
        let term = '', onlyMine = false;
        const list = SK.h('div', {});
        const draw = () => {
          SK.clear(list);
          const hits = ctx.data.gre_words.filter((w) => (!onlyMine || hooks[w.id]) && (!term || SK.norm(w.w).startsWith(SK.norm(term)))).slice(0, 30);
          for (const w of hits) {
            const h = hooks[w.id] || {};
            const area = SK.h('input', { type: 'text', value: h.text || '', placeholder: 'Your memory hook', 'aria-label': 'Hook for ' + w.w, style: { width: '100%' },
              onchange: (e) => { hooks[w.id] = Object.assign(hooks[w.id] || {}, { text: e.target.value, at: Date.now() }); if (!e.target.value) delete hooks[w.id]; SK.store.set(KEY, hooks); } });
            const rate = SK.select([['', 'How well does it work?'], ['3', 'Works well'], ['2', 'Somewhat'], ['1', 'Not yet']], h.rating || '', (v) => { if (hooks[w.id]) { hooks[w.id].rating = v; SK.store.set(KEY, hooks); } }, null);
            list.appendChild(SK.h('div', { style: { borderTop: '1px solid var(--line)', padding: '10px 0' } }, SK.h('div', {}, SK.h('strong', { text: w.w }), ' ', SK.h('span', { class: 'sk-muted', text: '(' + w.pos + ') ' + w.d })), SK.h('div', { class: 'sk-row', style: { marginTop: '6px' } }, SK.h('div', { class: 'sk-grow' }, area), rate)));
          }
          if (!hits.length) list.appendChild(SK.h('p', { class: 'sk-muted', text: 'No words match.' }));
        };
        const count = Object.keys(hooks).length;
        el.appendChild(SK.card('Notebook', SK.stats([['Words with a hook', count], ['Working well', Object.values(hooks).filter((h) => h.rating === '3').length]]),
          SK.h('div', { class: 'sk-row' }, SK.field('Find a word', SK.h('input', { type: 'text', oninput: (e) => { term = e.target.value; draw(); } })),
            SK.h('label', { class: 'sk-choice' }, SK.h('input', { type: 'checkbox', onchange: (e) => { onlyMine = e.target.checked; draw(); } }), 'Only words with a hook')), list));
        draw();
      } },
      { id: 'review', label: 'Review', render(el, ctx) {
        const cards = cardsFor(ctx.data.gre_words, SK.store.get(KEY, {}));
        if (!cards.length) { el.appendChild(SK.card('Review', SK.h('p', { class: 'sk-muted', text: 'Write a hook for a few words in the Notebook first. They will appear here.' }))); return; }
        SK.flashcards(el, cards, { title: 'Review your hooked words', newPerDay: 40 });
      } },
      { id: 'ideas', label: 'Ideas', render(el) { el.appendChild(SK.card('Kinds of hooks', SK.table(['Kind', 'Example'], IDEAS, false))); } },
    ],
    cardsFor,
    checks: {
      'review cards come only from words with a written hook': (data, assert) => {
        const w = data.gre_words;
        const hooks = { [w[0].id]: { text: 'a hook' }, [w[1].id]: { text: '' } };
        const cards = cardsFor(w, hooks);
        assert.equal(cards.length, 1);
        assert.equal(cards[0].front, w[0].w);
        assert.ok(cards[0].extra.includes('a hook'));
      },
    },
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = App; else SK.start(App);
})();
