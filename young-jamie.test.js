const { YoungJamie, goof_re, request_re, keyword_re } = require('./young-jamie');

const comments = [
  {
    parent_id: 1,
    body: 'that aint it chief',
    score: 10,
  },
  {
    body: 'jamie pull up hairless chimps',
    is_hidden: true,
  },
  {
    body: 'jamie pull up hairless chimps',
    score: 1,
  },
];

const good_comment = {
  score: 10,
  body: 'young jamie pull up hairless chimps.',
};

const reddit_mock_good = {
  getNewComments: () => {
    return [...comments, good_comment, good_comment];
  }
}

const reddit_mock_bad = {
  getNewComments: () => {
    return comments;
  }
}

const youtube_mock = {};

describe('Young Jamie', () => {
  const jamie = new YoungJamie(reddit_mock_good, youtube_mock);

  describe('filterComments()', () => {
    describe('catching goofs in comment replies', () => {
      const  goof_comment = comments[0];
      test("goof_regex: that aint it chief", () => {
        expect(goof_re.test(goof_comment.body)).toBe(true);
      });
      
      test("goof_regex: that ain't it chief", () => {
        expect(goof_re.test("that ain't it chief")).toBe(true);
      });

      test('goof_regex: with extra text in comment', () => {
        const body = 'talking a bunch of shit and that aint it chief you failed';
        expect(goof_re.test(body)).toBe(true);
      });

      test('catches a goof comment and stores it', (done) => {
        jamie.filterComments(comments.slice(0, 1));
        expect(jamie.goofs.length).toBeGreaterThan(0);
        jamie.goofs = [];
        done();
      })
    });

    describe('commentIsInvalid()', () => {
      test('is_hidden: true', () => {
        const comment = comments[1];
        expect(jamie.commentIsInvalid(comment)).toBe(true);
      });

      test('score below 2', () => {
        const comment = comments[2];
        expect(jamie.commentIsInvalid(comment)).toBe(true);
      });

      describe('request_re', () => {
        test('invalid body', () => {
          const body = 'young jamie you betta pack two fuckin lunches';
          expect(request_re.test(body)).toBe(false);
        });

        test('valid body spaces', () => {
          const body = 'young jamie pull up hairless chimps tony ferguson.';
          expect(request_re.test(body)).toBe(true);
        });

        test('valid body commas', () => {
          const body = 'young jamie pull up hairless chimps, tony.';
          expect(request_re.test(body)).toBe(true);
        });

        test('valid body spaces and commas', () => {
          const body = 'young jamie pull up hairless chimps, tony ferguson.';
          expect(request_re.test(body)).toBe(true);
        });

        test('no period at end', () => {
          const body = 'young jamie pull up hairless chimps, tony ferguson';
          expect(request_re.test(body)).toBe(true);
        });
      });
    });

    test('returns empty array given no valid comments', () => {
        const reduced = jamie.filterComments(comments);
        expect(reduced.length).toBe(0);
    });

    test('returns array of length 1 given a valid comment', () => {
      const reduced = jamie.filterComments([good_comment]);
      expect(reduced.length).toBeGreaterThan(0);
    });

    test('returns array of length 2 given mix with 2 valid comments', () => {
      const mix_comments = [...comments, good_comment, good_comment];
      const reduced = jamie.filterComments(mix_comments);
      expect(reduced.length).toBe(2);
    });

    describe('extractKeywords()', () => {
        const body_spaces = 'young jamie pull up hairless chimps tony';
        const body_commas = 'young jamie pull up hairless chimps, tony';
        const body_both = 'young jamie pull up hairless chimps, tony ferguson';
        test('keyword_re: no commas', () => {
        expect(keyword_re.test(body_spaces)).toBe(true);
      });

      test('keyword_re: with commas', () => {
        expect(keyword_re.test(body_commas)).toBe(true);
      });

      test('keyword_re: both', () => {
        expect(keyword_re.test(body_both)).toBe(true);
      });

      test('returns array with 3 keywords: spaces', () => {
        expect(jamie.extractKeywords(body_spaces).length).toBe(3);
      });

      test('returns array with 3 keywords: commas', () => {
        expect(jamie.extractKeywords(body_commas).length).toBe(3);
      });

      test('returns array with 4 keywords: both', () => {
        expect(jamie.extractKeywords(body_both).length).toBe(4);
      });
    });
  });

  describe('listen()', () => {
    test('this.comments: 2 when given 2 valid comments', async (done) => {
      await jamie.listen();
      expect(jamie.comments.length).toBe(2);
      done();
    });

    test('this.comments: 0, this.goofs: 1 given a mix', async (done) => {
      const other_jamie = new YoungJamie(reddit_mock_bad, youtube_mock);
      await other_jamie.listen();
      expect(other_jamie.comments.length).toBe(0);
      expect(other_jamie.goofs.length).toBe(1);
      done();
    });
  });
});
