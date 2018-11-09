const goof_re = /that (aint|ain't) it chief/mi;
const request_re = /((young )?(jamie (pull up|find|get|search) ))(\w|, | )+(?=\.)?/mi;
const keyword_re = /(?<=(pull up|find|get|search) )[\w, ]+(?=(\.| )?)/i;

class YoungJamie {
  constructor(reddit, youtube) {
    this.reddit = reddit;
    this.youtube = youtube;
    this.comments = [];
    this.results = [];
    this.goofs = [];
  };

  async listen() {
    const comments = await this.reddit.getNewComments('mma');
    this.comments = this.filterComments(comments);
  }

  extractKeywords(body) {
    const keywords_string = keyword_re.exec(body)[0];
    return keywords_string.split(/[ ,]+/);
  }

  filterComments(comments) {
    return comments.reduce(
      (filtered_comments, comment) => {
        const { id, parent_id, created_utc, permalink, body } = comment;
    
        if (goof_re.test(body)) {
          const goof = { goof_id: parent_id, body };
          this.goofs.push(goof);
          return filtered_comments;
        }
        
        if (this.commentIsInvalid(comment)) return filtered_comments;
    
        const keywords = this.extractKeywords(body);
        const filtered_comment = { id, created_at: created_utc, permalink, body, keywords };
        return [...filtered_comments, filtered_comment];
      },
      [],
    );
  }

  // score hidden (early comment), low score, or body not a request -> ignore
  commentIsInvalid ({ score, is_hidden, body }) {
    return is_hidden || score < 2 || !request_re.test(body)
  }

  async pullUp(comment) {
    const { first, second } = await this.youtube.get(comment.keywords);
    if (!first || !second) return;

    const result = { ...comment, first, second };
    this.results.push(result);
    this.sendResult(result);
  }

  respondToFail() {
    return `
why dont you go and fuck off my response then. you think i need a little fuckwit like you telling me how to be a failed bot?

thanks for the feedback. this goofery has been logged for review
    `;
  }
  
  sendResult({ first, second, keywords }) {
    const keywords_used = keywords.reduce((used, next) => `${used} ${next}`, '');
    return `
Here's that hairless chimp playlist you were looking for

[${keywords_used}](${first})

[second guess includes "mma" keyword](${second})

Did I goof? reply with: "that aint it chief"

Use me: "[young] jamie [get, find, search, pull up] [keyword, next-keyword, ] (commas or spaces between keywords)"
    `;
  }
}

module.exports = {
  YoungJamie,
  goof_re,
  request_re,
  keyword_re,
};